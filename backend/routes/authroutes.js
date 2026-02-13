const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer" );
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/Profile_Pics";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

router.post("/register", upload.single("image"), async (req, res) => {
    try {
        const { name, email, password, role, phone, address, gender, specialization, fees, experience, bio } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name, email, password: hashedPassword,
            role, phone, address, gender,
            specialization, fees, experience, bio,
            image: req.file ? req.file.filename : null
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registered Successfully" });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Registration Failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Wrong Email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Wrong Password" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "complex-secret-key",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;