const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const axios = require("axios");

const sendSMS = async(number,message)=>{
    try{
        await axios.get('https://www.fast2sms.com/dev/bulkV2',{
            params: {   
                "authorization":"26d5mXi7qTfUSYnhwA0IPvBDbZHQ3uc8zKtRjsk4CFpaGxoegVOi0CH5pgowsJVDhdKWyBaNF4tQkeEr",

                "route":"q",
                "message":message,
                "language":"english",
                "number":number,
            }
    });
    console.log("message deliverd");
    }catch(error){
        console.log("Error in SMS",error.message);
    }
};

router.get("/view-doctors", async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" })
        .select("-password")
        .sort({available: -1});
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
});

router.post("/book", async (req, res) => {
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

        setTimeout(async () => {
            const checkAppoint = await Appointment.findById(newAppointment._id);
            
            if (checkAppoint && checkAppoint.status === "pending") {
                checkAppoint.status = "Rejected"; 
                await checkAppoint.save();
                console.log(`Auto-rejected appointment: ${newAppointment._id} (Doctor didn't respond)`);
            }
        }, 500000);
        res.status(201).json({ message: "Request Sent! Doctor has a  5 minutes to respond" ,
            appointmentId:newAppointment._id
        });
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