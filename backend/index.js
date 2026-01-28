require("dotenv").config();
const express = require("express");
const session =require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const PORT=process.env.PORT||5500;

mongoose
.connect (process.env.DB_URI,{

})
.then(() => console.log("Connected to the database"))
.catch((error) => console.error(error));

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(
    session({
        secret:"complex-secret-key",
        resave:false,
        saveUninitialized: true,
        cookie:{secure: false}
    })
);
app.use("/uploads",express.static(path.join(__dirname,"uploads")));


app.get('/',(req,res)=>{
    res.send('Server is start running');
});
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/patient", require("./routes/patientroutes"));
app.use("/api/doctor", require("./routes/doctorroutes"));
app.use("/api/emergency",require("./routes/emergencyroutes"));
app.listen(PORT,()=>{console.log(`Server running on port :${PORT} `);
});