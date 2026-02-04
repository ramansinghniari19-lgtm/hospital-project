const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const multer = require("multer");
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
