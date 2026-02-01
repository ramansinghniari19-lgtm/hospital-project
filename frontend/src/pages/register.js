import React, { useState } from "react";
import API from "../api";
import { Navigate, useNavigate } from "react-router-dom";

const handleRegister=()=>{
    const [formData,setformData]=useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'patient',
        specialization: '',
        fees: '',
        experience: '',
        bio: ''
    });

    const navigate=useNavigate();
    const handleChange = (e)=>{
        setFormData({...fromData,[e.target.name]:e.target.value});
    };
    const handleRegister=async(e)=>{
        e.preventDefault();
        try{
            const res = await API.post('/auth/register',formData);
            if(res.Data.success){
                alert("Congratulations! registered");
                navigate('login')
            }
        }catch(error){
            alert(error.response?.data?.message||"wrong ! Check again");
        }  
    };
    return  (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-form">\
                <h2>Join Tagore Hospital</h2>

                <input type="text"  name="name" placeholder="Full Name" onChange={handleChange} required/>
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Set Password" onChange={handleChange} required />

                <label>Register as:</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>
                {formData.role === 'doctor' && (
                    <div className="doctor-extra-fields" style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px'}}>
                        <h4>Professional Information</h4>
                        <input type="text" name="specialization" placeholder="Specialization (e.g. Heart Specialist)" onChange={handleChange} required />
                        <input type="number" name="fees" placeholder="Consultation Fees (₹)" onChange={handleChange} required />
                        <input type="text" name="experience" placeholder="Years of Experience" onChange={handleChange} required />
                        <textarea name="bio" placeholder="Short Bio about yourself" onChange={handleChange}></textarea>
                    </div>
                )}
                <button type="submit" style={{marginTop: '20px'}}>Create Account</button>
                <p onClick={() => navigate('/login')} style={{cursor: 'pointer', color: 'blue'}}>Pehle se account hai? Login karein</p>
            </form>
        </div>
    );
};

export default Register;
