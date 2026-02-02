const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const storage = multer.diskStorage({
    destination:"./uploads",
    filename:function(req,file,cb){
        cb(null,Date.now()+"_"+file.originalname);
    },
})
const upload = multer ({storage}).single("image");

router.post ("/register",upload,async(req,res)=>{
    try{
      const { name, email, phone, password, role,gender,specialization,fees,experience,address,bio } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "already!register" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            name,
            phone,
            email,
            role:role ||"patient",
            password :hashedPassword,
            image: req.file ? req.file.filename : "",
            gender: gender ||"Male",
            address:address||"",
            specialization:role ==="doctor"? specialization:"",
            fees: role === "doctor"? fees:"",
            experience: role === "doctor" ? experience : "", 
            bio: role === "doctor" ? bio : "",
            available:role ==="doctor"? true:false


        });

        await newUser.save();
        res.status(201).json({message:"Registration Succesfull"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"server error",error:error.message});
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Wrong! Email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Wrong! Password" });
        }

        // 🔥 Session mein data bharo
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.userName = user.name;

        // ✅ Ye raha sahi bracket wala session save
        req.session.save((err) => {
            if (err) {
                console.error("Session Save Error:", err);
                return res.status(500).json({ success: false, message: "Session Error" });
            }
            // Response hamesha save ke ANDAR bhejte hain
            return res.status(200).json({
                success: true,
                message: "Login Successful!",
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                    available: user.available
                }
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Not SuccesFul!" });
        }
        res.status(200).json({ message: "Logout successful" });
    });
});
module.exports = router;