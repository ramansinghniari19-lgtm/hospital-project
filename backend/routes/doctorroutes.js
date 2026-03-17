const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/user");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { isAuthenticated, isDoctor } = require("../middleware/auth"); 
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
            from: '"Tagore Hospital" <ramansinghniari19@gmail.com>',
            to, subject, text
        });
    } catch (err) { console.log(err.message); }
};
const uploadDir = "uploads/reports/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });
router.get("/public/doctor", async (req, res) => {
    const doctors = await User.find({ role: "doctor" }).select("name specialization fees");
    res.json(doctors);
});
router.get("/patient", isAuthenticated, isDoctor, async (req, res) => {
    const patient = await User.find({ role: "patient" }).select("name email");
    res.json(patient);
});
router.get("/appointments", isAuthenticated, isDoctor, async (req, res) => {
    const list = await Appointment.find({ doctorId: req.user.id })
        .populate("patientId", "name email phone");
    res.json(list);
});
router.put("/accept/:id", isAuthenticated, isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id, { status: "Accepted" }, { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(appointment.patientId.email, "Appointment Accepted", `Hi ${appointment.patientId.name}, your appointment is ACCEPTED`);
    }
    res.json(appointment);
});
router.put("/reject/:id", isAuthenticated, isDoctor, async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id, { status: "Rejected" }, { new: true }
    ).populate("patientId");

    if (appointment?.patientId?.email) {
        await sendEmail(appointment.patientId.email, "Appointment Rejected", `Sorry ${appointment.patientId.name}, appointment rejected`);
    }
    res.json(appointment);
});
router.post("/complete-appointment/:id", isAuthenticated, isDoctor, upload.single("reportFile"), async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate("patientId");
        if (!appointment) return res.status(404).json({ message: "Not found" });

        appointment.status = "Completed";
            if (req.body.recommendAdmit === "true"||req.body.recommendAdmit === true){
                appointment.admissionStatus="Recommended";
                appointment.admissionNote = req.body.admissionNote||"Urgent observation required";
            }
        if (req.file) {
            appointment.reports.push({
                reportName: req.body.reportName || "Medical Report",
                fileUrl: req.file.filename
            });
        }
        await appointment.save();
        if (appointment?.patientId?.email) {
            await sendEmail(appointment.patientId.email, "Medical Report Ready", `Hi ${appointment.patientId.name}, your report is ready for download.`);
        }
        res.json({ message: "Completed!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/seed-beds", async (req, res) => {
    try {
        const bedData = [
            { bedNumber: "B1", bedType: "General", pricePerDay: 500, isOccupied: false },
            { bedNumber: "B2", bedType: "General", pricePerDay: 500, isOccupied: false },
            { bedNumber: "B3", bedType: "Private", pricePerDay: 1500, isOccupied: false },
            { bedNumber: "B4", bedType: "Private", pricePerDay: 1500, isOccupied: false },
            { bedNumber: "B5", bedType: "ICU", pricePerDay: 5000, isOccupied: false },
            { bedNumber: "B6", bedType: "ICU", pricePerDay: 5000, isOccupied: false }
        ];
        
        await Bed.deleteMany({}); 
        await Bed.insertMany(bedData);
        
        res.json({ message: "Success! 6 Beds inserted with prices." });
    } catch (error) {
        res.status(500).json({ message: "Seed Failed: " + error.message });
    }
});
const Bed = require("../models/bed");
router.get("/all-beds", async (req, res) => {
    try {
        const beds = await Bed.find();
        console.log("Found Beds in DB:", beds);
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post("/confirm-admission",isAuthenticated,async(req,res)=>{
    try{
        const{appointmentId,bedNumber}=req.body;

        const bed = await Bed.findOneAndUpdate(
            {bedNumber,isOccupied:false},
            {isOccupied:true,currentPatient:req.user.id},
            {new:true}
        );
        if(!bed)
            return res.status(400).json({message:"Bed not available"});

        await Appointment.findByIdAndUpdate(appointmentId,{
            admissionStatus:"Admitted",
            bedNumber:bedNumber
        });
        res.json({message:"you have been admitted to bed"+bedNumber});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});
router.post("/discharge/:id", isAuthenticated, isDoctor, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        const bedNum = appointment.bedNumber;
        appointment.admissionStatus = "Discharged";
        appointment.dischargeSummary = req.body.summary;
        appointment.bedNumber = null; 
        await appointment.save();
        await Bed.findOneAndUpdate({ bedNumber: bedNum }, { isOccupied: false, currentPatient: null });
        res.json({ message: "Patient Discharged Successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post("/discharge-patient", async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        await Bed.findOneAndUpdate(
            { bedNumber: appointment.bedNumber },
            { isOccupied: false, currentPatient: null }
        );

         appointment.admissionStatus = "Discharged";
        appointment.status = "Completed";
        await appointment.save();

        res.json({ message: "Patient Discharged and Bed is now free!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;        