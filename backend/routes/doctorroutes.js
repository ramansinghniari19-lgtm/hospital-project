const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user"); 
const multer = require("multer");
const axios = require("axios");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ramansinghniari19@gmail.com",
        pass: "skjh uyjf abrm hzgc" 
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads/reports"),
    filename: (req, file, cb) => cb(null, "REPORT_" + Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });


router.get("/appointments/:doctorId", async (req, res) => {
    try {
        const list = await Appointment.find({ doctorId: req.params.doctorId }).populate("patientId", "name email phone");
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: "List not found" });
    }
});

router.put("/accept/:id", async (req, res) => {
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

router.put("/reject/:id", async (req, res) => {
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

router.put("/update-status/:id", async (req, res) => {
    try {
        const { available } = req.body;
        const updatedDoc = await User.findByIdAndUpdate(
            req.params.id,
            { available },
            { new: true } 
        );
        res.status(200).json({ message: "Status Updated!", available: updatedDoc.available });
    } catch (error) {
        res.status(500).json({ message: "Status update fail", error: error.message });
    }
});

router.post("/complete-appointment/:id", upload.single("reportFile"), async (req, res) => {
    try {
        const { status, medicines } = req.body;
        const appointment = await Appointment.findById(req.params.id).populate("patientId");
        
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (status) appointment.status = status;
        if (medicines) appointment.prescription = medicines; 

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