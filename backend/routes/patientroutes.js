const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");

router.get("/view-doctors", async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" }).select("-password");
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
});

router.post("/book", async (req, res) => {
    try {
        const { patientId, doctorId, date, time, message } = req.body;
        const newAppointment = new Appointment({ patientId, doctorId, date, time, message });
        await newAppointment.save();
        res.status(201).json({ message: "Appointment Requested!" });
    } catch (error) {
        res.status(500).json({ message: "Booking fail", error: error.message });
    }
});

router.get("/my-medical-history/:patientId", async (req, res) => {
    try {
        const records = await Appointment.find({ patientId: req.params.patientId }).populate("doctorId", "name specialization");
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Fetch error" });
    }
});

module.exports = router;