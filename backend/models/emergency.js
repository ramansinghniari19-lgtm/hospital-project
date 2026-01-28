const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    phone:{type:String,
        required:true
    },
    location:{
        lat:{type:number,required:true},
        lng:{type:number,required:true}
    },
    status:{type:String,default:"Pending"},
    createdAt:{type:Date,default:Date.now}
})
module.exports=mongoose.model("emergency",emergencySchema);