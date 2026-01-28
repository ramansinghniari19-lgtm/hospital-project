const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Completed"],
        default: "Pending"
    },
    message: {
        type: String, 
        default: ""
    },
    created_at: {
        type: Date,
        default: Date.now
    },
   prescription: {
        type: String,
        default: ""
    },
    reports: [
        {
            reportName:{
                type: String
            },
            fileUrl:{
                type: String
            },
            uploadedAt:{
                type:Date,default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model("Appointment", appointmentSchema);