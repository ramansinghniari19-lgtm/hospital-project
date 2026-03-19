import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/forgot-password", { email, newPassword });
            if (res.data.success) {
                alert("Success: " + res.data.message);
                navigate("/login");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Reset Failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                <p>Enter your email and a new password</p>
                <form onSubmit={handleReset}>
                    <input 
                        type="email" 
                        placeholder="Registered Email Address"
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Enter New Password" 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit">Update Password</button>
                </form>
                <p onClick={() => navigate("/login")} style={{cursor: 'pointer', color: 'blue', marginTop: '10px'}}>
                    Back to Login
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;