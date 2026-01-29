const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        default: "" 
    },
    role: { 
        type: String, 
        enum: ["patient", "doctor", "admin"], 
        default: "patient" 
    },
    gender:{
        type:String,
        enum:["Male","Female","Other"],
        default:"Male"
    },
    address:{
        type:String,
        default:""
    },

    specialization: { 
        type: String, 
        default: "" 
    },
    fees: { 
        type: Number, 
        default: 0 
    },
    experience: { 
        type: String, 
        default: "" 
    },
    bio: { 
        type: String, 
        default: "" 
    },
    available: { 
        type: Boolean, 
        default: true 
    },

    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("User", userSchema);