const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent',async(req,res)=>{
    try{
        const{amount}=req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount:amount*100,
            currency: 'inr',
            automatic_payment_methods:{enabled:true},
        });
        res.status(200).send({
            clientSecret:paymentIntent.client_secret,
        });
    }catch(error){
        console.error("stripe error",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
});
router.post('book-cod',async(req,res)=>{
    try{
        const {appointmentData}=req.body;
        console.log("Booking  COD Appointment for:",appointmentData.patientName);
        res.status(200).json({
            success:true,
            message:"Appointment booked Successfully! Please pay at he hospital."
        });
    }catch(error){
        res.status(500).json({message:"COD Booking is not working"})
    }
});
module.exports = router;