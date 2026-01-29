const express = require("express");
const router = express.Router();
const emergency = require("../models/emergency");

router.post("/sos",async(req,res)=> {
    try{
        const {phone,lat,lng}=req.body;
        const newRequest = new emergency({
            phone,
            location:{lat,lng}
        });
        await newRequest.save();
        res.status(201).json({
            success:true,
            message:"Ambulance dispatched! Help is on the way"
        });
    }catch(error){
        res.status(500).json({message:"SOS Failed",error:error.message});
    }
});
module.exports = router;