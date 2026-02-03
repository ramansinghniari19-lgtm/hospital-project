import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // ✅ Session aur Cookies ke liye zaroori hai
    axios.defaults.withCredentials = true;

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting Login for:", email);

        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
                email,
                password
            });

            console.log("Server Response:", res.data);

            if (res.data.success) {
                alert("Login Successful! 🎉");
                
                // ✅ ROLE FIXED: backend me user.role me hai
                if (res.data.user.role === "doctor") {
                    navigate("/doctor-dashboard");
                } else {
                    navigate("/patient-dashboard");
                }
            } else {
                alert("Login failed: " + res.data.message);
            }
        } catch (err) {
            console.error("Login Error Details:", err.response || err);
            const errorMsg = err.response?.data?.message || "Server se connection nahi ho paya!";
            alert("Error: " + errorMsg);
        }
    };

    return (
        <div style={{ padding: "50px", fontFamily: "Arial" }}>
            <div style={{ border: "1px solid #000", padding: "30px", maxWidth: "400px", margin: "0 auto" }}>
                <h2 style={{ textAlign: "center" }}>Tagore Hospital Login</h2>
                <hr />
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Email Address:</label><br />
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <label>Password:</label><br />
                        <input 
                            type="password" 
                            placeholder="Enter password"
                            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
                        Login Now
                    </button>
                </form>

                <p style={{ marginTop: "15px", textAlign: "center" }}>
                    Naya account chahiye? <button onClick={() => navigate("/register")} style={{ border: "none", color: "blue", cursor: "pointer", background: "none" }}>Register Here</button>
                </p>    
                <button onClick={() => navigate("/")} style={{ width: "100%", padding: "8px", marginTop: "10px" }}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default Login;
