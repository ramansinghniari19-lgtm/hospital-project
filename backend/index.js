require("dotenv").config();
const express = require("express");
const session =require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT=process.env.PORT||8080;


app.use(cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
    session({
        secret:"complex-secret-key",
        resave:false,
        saveUninitialized: true,
        cookie:{secure: false}
    })
);
app.use("/uploads/reports", express.static(path.join(__dirname, "uploads/reports")));
app.use("/uploads/profilePics", express.static(path.join(__dirname, "uploads/profilePics")));

app.get('/',(req,res)=>{
    res.send('Server is  running on 8080');
});
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/patient", require("./routes/patientroutes"));
app.use("/api/doctor", require("./routes/doctorroutes"));
app.use("/api/emergency",require("./routes/emergencyroutes"));

mongoose
.connect (process.env.DB_URI)
.then(() =>{ console.log("Connected to the database")
app.listen(PORT,()=>{console.log(`Server running on port :${PORT} `);
});
})
.catch((error) => {console.error("Database connection fail",error)
    process.exit(1);
});

