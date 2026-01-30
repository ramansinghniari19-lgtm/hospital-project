const express = require("express");
const router = express.Router();
const emergency = require("../models/emergency");
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
        console.log("Emergency Alert SMS Sent!");
    } catch (error) {
        console.error("SMS Error:", error.message);
    }
};
router.post("/sos",async(req,res)=> {
    try{
        const {phone,lat,lng}=req.body;
        const newRequest = new emergency({
            phone,
            location:{lat,lng}
        });
        await newRequest.save();
        const alertMessage = `EMERGENCY! SOS received from ${phone}. Location: https://www.google.com/maps?q=${lat},${lng}. Help is on the way!`;
      
        await sendSMS(phone,alertMessage);
        
        res.status(201).json({
            success: true,
            message: "Ambulance dispatched! Help is on the way",
            data: newRequest
        });
      
    }catch(error){
        res.status(500).json({message:"SOS Failed",error:error.message});
    }
});
module.exports = router;