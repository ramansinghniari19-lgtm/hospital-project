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
      const { name, email, phone, password, role } = req.body;
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
            role,
            password :hashedPassword,
            image: req.file ? req.file.filename : ""
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
            return res.status(400).json({ message: "Wrong! Email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong! Password" });
        }

        res.status(200).json({
            message: "Login Successful!",
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Not SuccesFul!" });
        }
        res.status(200).json({ message: "Logout successful" });
    });
});
module.exports = router;