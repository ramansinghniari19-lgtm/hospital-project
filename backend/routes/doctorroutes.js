const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user"); 
const multer = require("multer");
const axios = require("axios");

const sendSMS = async (number, message) => {
    try {
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                "authorization": "26d5mXi7qTfUSYnhwA0IPvBDbZHQ3uc8zKtRjsk4CFpaGxoegVOi0CH5pgowsJVDhdKWyBaNF4tQkeEr", 
                "route": "q",
                "message": message,
                "language": "english",
                "numbers": number, 
            }
        });
        console.log("SMS notification sent successfully!");
    } catch (error) {
        console.error("SMS Error:", error.message);
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

        if (appointment.patientId && appointment.patientId.phone) {
            const msg = `Hi ${appointment.patientId.name}, your appointment has been ACCEPTED by the doctor.`;
            await sendSMS(appointment.patientId.phone, msg);
        }

        res.status(200).json({ message: "Accepted & SMS Sent!", appointment });
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

        if (appointment && appointment.patientId && appointment.patientId.phone) {
            const msg = `Sorry ${appointment.patientId.name}, doctor is busy. Your appointment is REJECTED.`;
            await sendSMS(appointment.patientId.phone, msg);
        }

        res.status(200).json({ message: "Rejected & SMS Sent!", appointment });
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
        if (appointment.patientId && appointment.patientId.phone) {
            const smsMessage = `Hi ${appointment.patientId.name}, your report & prescription are uploaded. Check your dashboard!`;
            sendSMS(appointment.patientId.phone, smsMessage);
        }
        res.status(200).json({ message: "Doctor work uploaded!", appointment });
    } catch (error) {
        res.status(500).json({ message: "Update fail", error: error.message });
    }
});

module.exports = router;