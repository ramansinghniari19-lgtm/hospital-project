const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    phone:{type:Number,
        required:true
    },
    location:{
        lat:{type:Number,required:true},
        lng:{type:Number,required:true}
    },
    status:{type:String,default:"Pending"},
    createdAt:{type:Date,default:Date.now}
})
module.exports=mongoose.model("emergency",emergencySchema);