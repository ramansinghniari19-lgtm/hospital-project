import React, { useState } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        role: "patient",
        specialization: "",
        fees: "",
        experience: "",
        bio: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/api/auth/register", formData);
            
            if (res.data.success) {
                alert("Mubarak ho! Tagore Hospital mein registration ho gaya.");
                navigate("/login");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Registration Failed!");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "450px", margin: "50px auto", fontFamily: "Arial" }}>
            <h2 style={{ textAlign: "center" }}>Tagore Hospital 🏥</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required style={inputStyle} />
                <input type="password" name="password" placeholder="Set Password" onChange={handleChange} required style={inputStyle} />
                
                <input type="text" name="address" placeholder="Full Home Address" onChange={handleChange} required style={inputStyle} />

                <div style={{ margin: "15px 0" }}>
                    <label>Register as: </label>
                    <select name="role" onChange={handleChange} style={{ padding: "5px" }}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>

                {formData.role === "doctor" && (
                    <div style={{ background: "#f0f7ff", padding: "15px", border: "1px solid #d0e7ff", borderRadius: "8px" }}>
                        <h4 style={{ marginTop: 0 }}>Doctor Professional Details</h4>
                        <input type="text" name="specialization" placeholder="Specialization (e.g. Heart Specialist)" onChange={handleChange} required style={inputStyle} />
                        <input type="number" name="fees" placeholder="Consultation Fees (₹)" onChange={handleChange} required style={inputStyle} />
                        <input type="text" name="experience" placeholder="Years of Experience" onChange={handleChange} required style={inputStyle} />
                        <textarea name="bio" placeholder="Short Bio about yourself" onChange={handleChange} style={{ ...inputStyle, height: "60px" }}></textarea>
                    </div>
                )}

                <button type="submit" style={btnStyle}>Register Now</button>
            </form>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
};

const btnStyle = {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
};

export default Register;