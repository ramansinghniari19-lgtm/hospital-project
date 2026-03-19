import React, { useState, useContext } from "react";
import API from "../../services/api";
import { Authcontext } from "../../context/Authcontext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(Authcontext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/login", { email, password });

            if (res.data.success) {
                login(res.data.user, res.data.token);

                if (res.data.user.role === "doctor") {
                    navigate("/DoctorDashboard");
                } else {
                    navigate("/PatientDashboard");
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || "Login Failed! Check Credentials.");
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative', minHeight: '100vh' }}>
            
            <button 
                onClick={() => navigate("/")} 
                style={{ 
                    position: 'fixed', 
                    top: '20px', 
                    right: '30px', 
                    background: 'white', 
                    color: '#333', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '30px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.backgroundColor = 'white';
                }}
            >
                🏠 Go to Website
            </button>

            <div className="auth-card">
                <h2>Hospital</h2>
                <p>Welcome back! Please Login</p>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Enter Password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    
                    <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                        <span 
                            onClick={() => navigate("/forgot-password")} 
                            style={{ cursor: 'pointer', color: '#007bff', fontSize: '13px', fontWeight: '500' }}
                        >
                            Forgot Password?
                        </span>
                    </div>

                    <button type="submit">Login</button>
                </form>

                <div className="auth-footer" style={{ marginTop: '20px' }}>
                    <p>Don't have an Account? <span onClick={() => navigate("/register")} style={{cursor: 'pointer', color: 'blue', fontWeight: 'bold'}}>Register</span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;