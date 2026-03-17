const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: true,
        unique: true
    },
    bedType: {
        type: String,
        enum: ['General', 'Private', 'ICU'],
        default: 'General'
    },
    pricePerDay: {
        type: Number,
        default: 500 
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null
    }
});

module.exports = mongoose.model("Bed", bedSchema);