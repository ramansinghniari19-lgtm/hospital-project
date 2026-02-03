const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user"); 
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ramansinghniari19@gmail.com",
        pass: "skjhuyjfabrmhzgc" 
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"Tagore Hospital" <ramansinghniari19@gmail.com>',
            to: to,
            subject: subject,
            text: text,
        });
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error(" Email Error:", error.message);
    }
};

const isDoctor = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === "doctor") {
        next();
    } else {
        res.status(401).json({ message: "Doctor login required or Session Expired!" });
    }
};

const reportStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads/reports"),
    filename: (req, file, cb) => cb(null, "REPORT_" + Date.now() + "_" + file.originalname)
});
const uploadReport = multer({ storage: reportStorage });

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads/profile_Pics"),
    filename: (req, file, cb) => cb(null, "DP_" + Date.now() + "_" + file.originalname)
});
const uploadProfile = multer({ storage: profileStorage });

router.get("/public/doctor", async (req, res) => {
    try {
        const doctor = await User.find({ role: "doctor" }).select("name specialization fees");
        // FIX: Variable mismatch fixed (doctors -> doctor)
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Doctors fetch fail" });
    }   
});

router.get("/patient", isDoctor, async (req, res) => {
    try {
        const patient = await User.find({ role: "patient" }).select("name email");
        // FIX: mismatch fixed (patients -> patient)
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: "error" });
    }
});

router.get("/appointments/:doctorId", isDoctor, async (req, res) => {
    try {
        const list = await Appointment.find({ doctorId: req.params.doctorId }).populate("patientId", "name email phone");
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: "List not found" });
    }
});

router.get("/stats/:doctorId", isDoctor, async (req, res) => {
    try {
        const total = await Appointment.countDocuments({ doctorId: req.params.doctorId });
        const pending = await Appointment.countDocuments({ doctorId: req.params.doctorId, status: "pending" });
        const completed = await Appointment.countDocuments({ doctorId: req.params.doctorId, status: "Completed" });
        res.status(200).json({ total, pending, completed });
    } catch (error) {
        res.status(500).json({ message: "Stats error", error: error.message });
    }
});

router.put("/update-profile/:id", isDoctor, uploadProfile.single("profilePic"), async (req, res) => {
    try {
        const { specialization, fees, experience, bio, available } = req.body;
        let updateData = { specialization, fees, experience, bio, available };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedDoctor = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select("-password");
        res.status(200).json({ message: "Profile Updated!", updatedDoctor });
    } catch (error) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

router.put("/accept/:id", isDoctor, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: "Accepted" },
            { new: true }
        ).populate("patientId");

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (appointment.patientId && appointment.patientId.email) {
            const msg = `Hi ${appointment.patientId.name}, your appointment has been ACCEPTED by the doctor.`;
            await sendEmail(appointment.patientId.email, "Appointment Accepted", msg);
        }

        res.status(200).json({ message: "Accepted & Email Sent!", appointment });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
});

router.put("/reject/:id", isDoctor, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: "Rejected" },
            { new: true }
        ).populate("patientId");

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (appointment.patientId && appointment.patientId.email) {
            const msg = `Sorry ${appointment.patientId.name}, doctor is busy. Your appointment is REJECTED.`;
            await sendEmail(appointment.patientId.email, "Appointment Updated", msg);
        }

        res.status(200).json({ message: "Rejected & Email Sent!", appointment });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
});

router.post("/complete-appointment/:id", isDoctor, uploadReport.single("reportFile"), async (req, res) => {
    try {
        const { medicines, diagnosis, advice } = req.body;
        const appointment = await Appointment.findById(req.params.id).populate("patientId");
        
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        appointment.status = "Completed";
        appointment.prescription = `Diagnosis: ${diagnosis || 'N/A'}\nMedicines: ${medicines}\nAdvice: ${advice || 'N/A'}`;

        if (req.file) {
            appointment.reports.push({
                reportName: req.body.reportName || "Medical Report",
                fileUrl: req.file.filename
            });
        }

        await appointment.save();

        if (appointment.patientId && appointment.patientId.email) {
            const emailMessage = `Hi ${appointment.patientId.name}, your report & prescription are uploaded. Check your dashboard!`;
            await sendEmail(appointment.patientId.email, "Medical Report Uploaded", emailMessage);
        }
        res.status(200).json({ message: "Doctor work uploaded!", appointment });
    } catch (error) {
        res.status(500).json({ message: "Update fail", error: error.message });
    }
});

module.exports = router;