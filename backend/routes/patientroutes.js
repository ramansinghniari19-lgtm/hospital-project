const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const path = require("path");


const isPatient = (req, res, next) => {
    if (req.session?.user && req.session.user.role === "patient") {
        next();
    } else {
        return res.status(401).json({
            message: "Patient login required or session expired!"
        });
    }
};


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
            to,
            subject,
            text
        });
        console.log(" Email sent to:", to);
    } catch (error) {
        console.error("Email error:", error.message);
    }
};


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
            return res.status(400).json({
                message: "Doctor, date and time are required"
            });
        }

        const newAppointment = new Appointment({
            patientId: req.session.user._id,
            doctorId,
            date,
            time,
            message,
            status: "pending"
        });

        await newAppointment.save();

        const patient = await User.findById(req.session.user._id);

        if (patient?.email) {
            await sendEmail(
                patient.email,
                "Appointment Request Sent",
                `Hi ${patient.name}, your appointment request for ${date} at ${time} has been sent. Please wait for doctor's approval.`
            );
        }

        
        setTimeout(async () => {
            const checkAppointment = await Appointment.findById(newAppointment._id)
                .populate("patientId");

            if (checkAppointment && checkAppointment.status === "pending") {
                checkAppointment.status = "Rejected";
                await checkAppointment.save();

                if (checkAppointment.patientId?.email) {
                    await sendEmail(
                        checkAppointment.patientId.email,
                        "Appointment Auto-Rejected",
                        "Doctor didn't respond in time. Your appointment was auto-rejected."
                    );
                }

                console.log("⏱ Auto-rejected:", newAppointment._id);
            }
        }, 300000);

        res.status(201).json({
            message: "Appointment booked successfully",
            appointmentId: newAppointment._id
        });

    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({
            message: "Booking fail",
            error: error.message
        });
    }
});


router.get("/my-medical-history", isPatient, async (req, res) => {
    try {
        const records = await Appointment.find({
            patientId: req.session.user._id
        }).populate("doctorId", "name specialization");

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Fetch error" });
    }
});


router.get("/download-report/:filename", isPatient, (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    res.download(filePath, err => {
        if (err) {
            res.status(404).json({ message: "File not found" });
        }
    });
});

module.exports = router;
