const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const bcrypt = require("bcryptjs");

const { isAuthenticated } = require("../middleware/auth"); 

const storage = multer.diskStorage({
    destination: "./uploads/Profile_Pics",
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage }).single("image");

router.post("/register", upload, async (req, res) => {
    try {
        const { name, email, phone, password, role, gender, specialization, fees, experience, address, bio } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "already!register" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name, email, phone, role: role || "patient",
            password: hashedPassword,
            image: req.file ? req.file.filename : "",
            gender: gender || "Male",
            address: address || "",
            specialization: role === "doctor" ? specialization : "",
            fees: role === "doctor" ? fees : "",
            experience: role === "doctor" ? experience : "",
            bio: role === "doctor" ? bio : "",
            available: role === "doctor" ? true : false
        });

        await newUser.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Wrong! Email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Wrong! Password" });

        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.userName = user.name;

        req.session.save((err) => {
            if (err) return res.status(500).json({ success: false, message: "Session Error" });
            return res.status(200).json({
                success: true,
                message: "Login Successful!",
                user: { id: user._id, name: user.name, role: user.role }
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

router.get("/logout", isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Not Successful!" });
        res.status(200).json({ message: "Logout successful" });
    });
});

module.exports = router;