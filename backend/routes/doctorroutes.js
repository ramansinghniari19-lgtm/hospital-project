const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ramansinghniari19@gmail.com",
        pass: "skjhuyjfabrmhzgc"
    },
});

const sendEmail = async (to, subject, text) => {
    await transporter.sendMail({
        from: '"Tagore Hospital" <ramansinghniari19@gmail.com>',
        to,
        subject,
        text
    });
};
/* =======================
    MULTER CONFIG (Files save karne ke liye)
======================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/reports/"); // Ensure ye folder exist karta ho
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

/* =======================
    COMPLETE APPOINTMENT ROUTE (Ye missing tha!)
======================= */
router.post("/complete-appointment/:id", isDoctor, upload.single("reportFile"), async (req, res) => {
    try {
        const { reportName, prescription } = req.body;
        const appointmentId = req.params.id;

        // 1. Appointment dhundo
        const appointment = await Appointment.findById(appointmentId).populate("patientId");
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found!" });
        }

        // 2. Report data update karo
        const newReport = {
            reportName: reportName || "Medical Report",
            fileUrl: req.file ? req.file.filename : null,
            date: new Date()
        };

        appointment.status = "Completed";
        appointment.reports.push(newReport);
        
        // Agar schema mein prescription field hai toh:
        if (prescription) {
            appointment.prescription = prescription; 
        }

        await appointment.save();

        // 3. Patient ko email bhejo (Optional par badiya hai)
        if (appointment.patientId?.email) {
            await sendEmail(
                appointment.patientId.email,
                "Medical Report Uploaded",
                `Hi ${appointment.patientId.name}, your medical report "${newReport.reportName}" has been uploaded. You can download it from your dashboard.`
            );
        }

        res.status(200).json({ message: "Report uploaded successfully!", appointment });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});
const isDoctor = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === "doctor") {
        next();
    } else {
        res.status(401).json({ message: "Doctor login required!" });
    }
};

router.get("/public/doctor", async (req, res) => {
    const doctors = await User.find({ role: "doctor" }).select("name specialization fees");
    res.json(doctors);
});

router.get("/patient", isDoctor, async (req, res) => {
    const patient = await User.find({ role: "patient" }).select("name email");
    res.json(patient);
});

router.get("/appointments/:doctorId", isDoctor, async (req, res) => {
    const list = await Appointment.find({ doctorId: req.params.doctorId })
        .populate("patientId", "name email phone");
    res.json(list);
});

router.put("/accept/:id", isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: "Accepted" },
        { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(
            appointment.patientId.email,
            "Appointment Accepted",
            `Hi ${appointment.patientId.name}, your appointment is ACCEPTED`
        );
    }

    res.json(appointment);
});

router.put("/reject/:id", isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: "Rejected" },
        { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(
            appointment.patientId.email,
            "Appointment Rejected",
            `Sorry ${appointment.patientId.name}, appointment rejected`
        );
    }

    res.json(appointment);
});

module.exports = router;
