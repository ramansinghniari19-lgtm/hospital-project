const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const { isDoctor } = require("../middleware/auth"); 

//  Email Config 
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
            to, subject, text
        });
    } catch (err) { console.log("Email Error:", err.message); }
};

// Multer Setup (Reports ke liye)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads/reports/"); },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ROUTES 

//  Doctors list  (Public)
router.get("/public/doctor", async (req, res) => {
    const doctors = await User.find({ role: "doctor" }).select("name specialization fees");
    res.json(doctors);
});

//  Patients ki list (Sirf Doctor dekh sakta hai)
router.get("/patient", isDoctor, async (req, res) => {
    const patient = await User.find({ role: "patient" }).select("name email");
    res.json(patient);
});

//  Appointments 
router.get("/appointments/:doctorId", isDoctor, async (req, res) => {
    const list = await Appointment.find({ doctorId: req.params.doctorId })
        .populate("patientId", "name email phone");
    res.json(list);
});

//  Accept Appointment
router.put("/accept/:id", isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id, { status: "Accepted" }, { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(appointment.patientId.email, "Appointment Accepted", `Hi ${appointment.patientId.name}, your appointment is ACCEPTED`);
    }
    res.json(appointment);
});

//  Reject Appointment
router.put("/reject/:id", isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id, { status: "Rejected" }, { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(appointment.patientId.email, "Appointment Rejected", `Sorry ${appointment.patientId.name}, appointment rejected`);
    }
    res.json(appointment);
});

//  Complete & Upload Report
router.post("/complete-appointment/:id", isDoctor, upload.single("reportFile"), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate("patientId");
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        appointment.status = "Completed";
        if (req.file) {
            appointment.reports.push({
                reportName: req.body.reportName || "Medical Report",
                fileUrl: req.file.filename
            });
        }
                await appointment.save();

        if (appointment?.patientId?.email) {
        await sendEmail(appointment.patientId.email, "Medical report update ! Please check", ` ${appointment.patientId.name}, now download it `);
    }
        res.json({ message: "Report uploaded and appointment completed!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;