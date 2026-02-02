const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const nodemailer = require("nodemailer"); 
const path = require("path");

const isPatient = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === "patient") {
        next();
    } else {
        res.status(401).json({ message: "Patient login required or Session Expired!" });
    }
};

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


router.get("/view-doctors", isPatient, async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" })
        .select("-password")
        .sort({available: -1});
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
});

router.post("/book", isPatient, async (req, res) => {
    try {
        const { patientId, doctorId, date, time, message } = req.body;
        
        const newAppointment = new Appointment({ 
            patientId,
            doctorId,
            date,
            time,
            message ,
            status:"pending"
        });
        await newAppointment.save();

        const patient = await User.findById(patientId);
        if (patient && patient.email) {
            const emailText = `Hi ${patient.name}, your appointment request for ${date} at ${time} has been sent. Please wait for doctor's approval.`;
            await sendEmail(patient.email, "Appointment Request Sent", emailText);
        }

        setTimeout(async () => {
            const checkAppoint = await Appointment.findById(newAppointment._id).populate("patientId");
            
            if (checkAppoint && checkAppoint.status === "pending") {
                checkAppoint.status = "Rejected"; 
                await checkAppoint.save();
                
                if(checkAppoint.patientId && checkAppoint.patientId.email) {
                    sendEmail(checkAppoint.patientId.email, "Appointment Update", "Sorry, the doctor didn't respond in time. Your request is auto-rejected.");
                }
                console.log(`Auto-rejected appointment: ${newAppointment._id}`);
            }
        }, 300000); 

        res.status(201).json({ message: "Request Sent! Email confirmation delivered.", appointmentId:newAppointment._id });
    } catch (error) {
        res.status(500).json({ message: "Booking fail", error: error.message });
    }
});

router.get("/my-medical-history/:patientId", isPatient, async (req, res) => {
    try {
        const records = await Appointment.find({ patientId: req.params.patientId }).populate("doctorId", "name specialization");
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Fetch error" });
    }
});

router.get("/download-report/:filename", isPatient, (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);
    res.download(filePath, (err) => {
        if (err) res.status(404).json({ message: "File nahi mili!" });
    });
});

module.exports = router;