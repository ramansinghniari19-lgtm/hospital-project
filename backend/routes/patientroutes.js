const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const path = require("path");

const { isPatient } = require("../middleware/auth");

// Email Config 
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
        console.log("Email sent to:", to);
    } catch (error) {
        console.error("Email error:", error.message);
    }
};

// ROUTES 

router.get("/view-doctors", isPatient, async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" })
            .select("-password")
            .sort({ available: -1 });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Doctor fetch error" });
    }
});

router.post("/book", isPatient, async (req, res) => {
    try {
        const { doctorId, date, time, message } = req.body;
        if (!doctorId || !date || !time) {
            return res.status(400).json({ message: "Doctor, date and time are required" });
        }

        const newAppointment = new Appointment({
            patientId: req.session.userId, 
            doctorId, date, time, message, status: "pending"
        });

        await newAppointment.save();
        const patient = await User.findById(req.session.userId);

        if (patient?.email) {
            await sendEmail(patient.email, "Request Sent", `Hi ${patient.name}, request sent for ${date}.`);
        }

        setTimeout(async () => {
            const check = await Appointment.findById(newAppointment._id).populate("patientId");
            if (check && check.status === "pending") {
                check.status = "Rejected";
                await check.save();
                if (check.patientId?.email) {
                    await sendEmail(check.patientId.email, "Auto-Rejected", "Doctor didn't respond.");
                }
            }
        }, 300000);

        res.status(201).json({ message: "Booked!", appointmentId: newAppointment._id });
    } catch (error) {
        res.status(500).json({ message: "Booking fail", error: error.message });
    }
});

router.get("/my-medical-history", isPatient, async (req, res) => {
    try {
        const records = await Appointment.find({ patientId: req.session.userId })
            .populate("doctorId", "name specialization");
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Fetch error" });
    }
});

router.get("/download-report/:filename", isPatient, (req, res) => {
    const filePath = path.join(__dirname, "../uploads/reports", req.params.filename);
    res.download(filePath, err => {
        if (err) res.status(404).json({ message: "File not found" });
    });
});

module.exports = router;