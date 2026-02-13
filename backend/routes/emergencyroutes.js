const express = require("express");
const router = express.Router();
const emergency = require("../models/emergency");
const nodemailer = require("nodemailer"); 

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
            from: '"SOS EMERGENCY" <ramansinghniari19@gmail.com>',
            to: to,
            subject: subject,
            text: text,
        });
        console.log("Emergency Email Sent successfully!");
    } catch (error) {
        console.error("Email Error:", error.message);
    }
};

router.post("/sos", async (req, res) => {
    try {
        const { phone, lat, lng } = req.body;
        
        const newRequest = new emergency({
            phone,
            location: { lat, lng }
        });
        await newRequest.save();

        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        const alertMessage = ` EMERGENCY ALERT! \n\n Emergency alert!\n\nPhone Number: ${phone}\nLocation Link: ${mapUrl}\n\nPlease send a ambulance immediteily!`;

        await sendEmail("ramansinghniari19@gmail.com", " SOS REQUEST RECEIVED!", alertMessage);
        
        res.status(201).json({
            success: true,
            message: "Ambulance dispatched! Admin has been notified via Email.",
            data: newRequest
        });
      
    } catch (error) {
        res.status(500).json({ message: "SOS Failed", error: error.message });
    }
});

module.exports = router;