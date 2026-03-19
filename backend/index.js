require("dotenv").config();
const express = require("express");
const session =require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const app = express();
const http = require("http");
const{Server} = require("socket.io");
const PORT=process.env.PORT||8080;

const server = http.createServer(app);
const  io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
}); 
io.on("connection",(socket)=>{
    console.log("New Client Connected:",socket.id);

    socket.on("join_room",(userId)=>{
        socket.join(userId);
        console.log(`user${userId}joined their personal room`);
    });
    socket.on("disconnect",()=>{
        console.log ("client Disconnected");
    });
});
app.set("socketio",io);

app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
    session({
        secret:"complex-secret-key",
        resave:false,
        saveUninitialized: false,
        cookie:{secure: false,httpOnly: true,sameSite:"lax"}
    })
);
app.use("/uploads/reports", express.static(path.join(__dirname, "uploads/reports")));
app.use("/uploads/profilePics", express.static(path.join(__dirname, "uploads/Profile_Pics")));
app.get('/',(req,res)=>{
    res.send('Server is  running on 8080');
});
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/patient", require("./routes/patientroutes"));
app.use("/api/doctor", require("./routes/doctorroutes"));
app.use("/api/emergency",require("./routes/emergencyroutes"));
app.use("/api/payment",require("./routes/paymentroutes"));

mongoose
.connect(process.env.DB_URI)
.then(() => { 
    console.log("Connected to database:", mongoose.connection.name); 
    app.listen(PORT, () => {
        console.log(`Server running on port :${PORT}`);
    });
})
.catch((error) => {console.error("Database connection fail",error)
    process.exit(1);
});

