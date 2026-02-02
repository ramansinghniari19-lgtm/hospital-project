import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Session maintain karne ke liye (Frontend-Backend link)
    axios.defaults.withCredentials = true;

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login form submit hua...");

        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password
            });

            console.log("Backend Response:", res.data);

            // Case 1: Agar Login Success hai
            if (res.data && res.data.success) {
                alert("✅ Login Successful!");
                
                if (res.data.role === "doctor") {
                    return navigate("/doctor-dashboard");
                } else {
                    return navigate("/patient-dashboard");
                }
            } 
            
            // Case 2: Agar Backend ne "success: false" bheja (Wrong password etc.)
            alert("❌ Login Fail: " + (res.data.message || "Invalid Email or Password"));

        } catch (err) {
            // Case 3: Agar Server hi nahi chal raha ya koi aur technical error hai
            console.error("Network/Server Error:", err);
            const errorMsg = err.response?.data?.message || "Server error! Backend check karo.";
            alert("⚠️ Alert: " + errorMsg);
        }
    };

    return (
        <div style={{ 
            padding: "50px", 
            fontFamily: "Arial, sans-serif", 
            display: "flex", 
            justifyContent: "center" 
        }}>
            <div style={{ 
                border: "2px solid #333", 
                padding: "30px", 
                borderRadius: "10px", 
                width: "350px",
                backgroundColor: "#f9f9f9"
            }}>
                <h2 style={{ textAlign: "center", color: "#d9534f" }}>TAGORE LOGIN</h2>
                <hr />
                
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "15px" }}>
                        <label><b>Email:</b></label><br />
                        <input 
                            type="email" 
                            placeholder="Enter Email"
                            style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box" }}
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <label><b>Password:</b></label><br />
                        <input 
                            type="password" 
                            placeholder="Enter Password"
                            style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box" }}
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            width: "100%", 
                            padding: "10px", 
                            background: "#28a745", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        LOGIN
                    </button>
                </form>

                <p style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
                    Account nahi hai? 
                    <button 
                        onClick={() => navigate("/register")} 
                        style={{ border: "none", color: "blue", background: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                        Register Karo
                    </button>
                </p>

                <button 
                    onClick={() => navigate("/")} 
                    style={{ width: "100%", padding: "8px", marginTop: "10px", cursor: "pointer" }}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default Login;