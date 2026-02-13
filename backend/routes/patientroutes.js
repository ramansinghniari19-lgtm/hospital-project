    const express = require("express");
    const router = express.Router();
    const Appointment = require("../models/Appointment");
    const User = require("../models/user");
    const nodemailer = require("nodemailer");
    const path = require("path");

    const { isAuthenticated, isPatient } = require("../middleware/auth");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ramansinghniari19@gmail.com",
            pass: "skjhuyjfabrmhzgc"
        }
    });

    const sendEmail = async (to, subject, text) => {
        try {
            await transporter.sendMail({
                from: '"Tagore Hospital" <ramansinghniari19@gmail.com>',
                to, subject, text
            });
        } catch (error) {
            console.error("Email error:", error.message);
        }
    };


router.get(
  "/view-doctors",
  isAuthenticated,   
  isPatient,         
  async (req, res) => {
    const doctors = await User.find({ role: "doctor" });
    res.json(doctors);
  }
);
    router.post("/book", isAuthenticated, isPatient, async (req, res) => {
        try {
            const { doctorId, date, time, message } = req.body;
            
            const patientId = req.user.id; 

            const newAppointment = new Appointment({
                patientId,
                doctorId, 
                date, 
                time, 
                message, 
                status: "pending"
            });

            await newAppointment.save();
            const patient = await User.findById(patientId);

            if (patient?.email) {
                await sendEmail(patient.email, "Request Sent", `Hi ${patient.name}, request sent for ${date}.`);
            }

            res.status(201).json({ message: "Booked!", appointmentId: newAppointment._id });
        } catch (error) {
            res.status(500).json({ message: "Booking fail", error: error.message });
        }
    });
router.get("/dashboard-data", isAuthenticated, isPatient, async (req, res) => {
    try {
        // Saari appointments nikalo aur doctor ki details populate karo
        const appointments = await Appointment.find({ patientId: req.user.id })
            .populate("doctorId", "name specialization")
            .sort({ createdAt: -1 });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Dashboard data fetch error", error: error.message });
    }
});
    router.get("/my-medical-history", isAuthenticated, isPatient, async (req, res) => {
        try {
            const records = await Appointment.find({ patientId: req.user.id })
                .populate("doctorId", "name specialization");
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ message: "Fetch error" });
        }
    });

    module.exports = router;