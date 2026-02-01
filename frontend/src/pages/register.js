import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'patient',
        specialization: '',
        fees: '',
        experience: '',
        bio: '',
        address: '' // ✅ State mein hai
    });

    const [profilePic, setProfilePic] = useState(null); // ✅ Image ke liye alag state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]); // ✅ File select handle karna
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 🔥 Sabse Zaroori: Image bhejni hai toh FormData use karna padega
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("password", formData.password);
        data.append("role", formData.role);
        data.append("address", formData.address);
        
        if (profilePic) {
            data.append("profilePic", profilePic); // Backend field name check kar lena
        }

        if (formData.role === 'doctor') {
            data.append("specialization", formData.specialization);
            data.append("fees", formData.fees);
            data.append("experience", formData.experience);
            data.append("bio", formData.bio);
        }

        try {
            const res = await API.post('/auth/register', data, {
                headers: { "Content-Type": "multipart/form-data" } // ✅ Headers zaroori hain
            });
            
            if (res.data && res.data.success) { 
                alert("Congratulations! Everything stored in Database.");
                navigate('/login');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!");
        }  
    };

    return (
        <div className="register-container" style={{ padding: '20px' }}>
            <form onSubmit={handleSubmit}>
                <h2>Tagore Hospital - Register</h2>
                
                <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                <br /><br />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <br /><br />
                <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
                <br /><br />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <br /><br />

                {/* ✅ ADDRESS FIELD ADDED */}
                <input type="text" name="address" placeholder="Full Address" onChange={handleChange} required />
                <br /><br />

                {/* ✅ IMAGE UPLOAD FIELD ADDED */}
                <label>Profile Picture: </label>
                <input type="file" name="profilePic" onChange={handleFileChange} accept="image/*" />
                <br /><br />
                
                <label>Register as: </label>
                <select name="role" onChange={handleChange}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>

                {formData.role === 'doctor' && (
                    <div className="doctor-fields" style={{ marginTop: '20px', borderTop: '1px solid black' }}>
                        <h3>Professional Details</h3>
                        <input type="text" name="specialization" placeholder="Specialization" onChange={handleChange} required />
                        <br /><br />
                        <input type="number" name="fees" placeholder="Consultation Fees" onChange={handleChange} required />
                        <br /><br />
                        <input type="text" name="experience" placeholder="Experience (Years)" onChange={handleChange} required />
                        <br /><br />
                        <textarea name="bio" placeholder="Bio/Description" onChange={handleChange}></textarea>
                    </div>
                )}

                <br /><br />
                <button type="submit">Register Now</button>
            </form>
        </div>
    );
};

export default Register;