import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    // Session maintain karne ke liye important hai
    axios.defaults.withCredentials = true;

    // 1. Saare registered patients ki list mangwao
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/doctor/patients");
                setPatients(res.data);
            } catch (err) {
                console.error("Fetch Patients Error:", err);
                alert("Doctor login required or Session Expired!");
                navigate("/login");
            }
        };
        fetchPatients();
    }, [navigate]);

    // 2. Report Upload karne ka logic
    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!file || !selectedPatient || !title) {
            return alert("Bhai, saari details bharna zaroori hai!");
        }

        const formData = new FormData();
        formData.append("patientId", selectedPatient);
        formData.append("title", title);
        formData.append("report", file); // 'report' wahi naam hona chahiye jo backend mein multer use kar raha hai

        try {
            const res = await axios.post("http://localhost:8080/api/doctor/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            if (res.status === 200 || res.status === 201) {
                alert("✅ Report Uploaded Successfully!");
                setTitle("");
                setFile(null);
                setSelectedPatient("");
            }
        } catch (err) {
            console.error("Upload Error:", err);
            alert("Upload failed! Backend check karo.");
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/api/auth/logout");
            navigate("/login");
        } catch (err) {
            navigate("/login");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <nav style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Doctor Dashboard 🏥</h2>
                <button onClick={handleLogout} style={{ background: "red", color: "white" }}>Logout</button>
            </nav>
            
            <hr />

            <h3>Upload Medical Report</h3>
            <form onSubmit={handleUpload} style={{ border: "1px solid #ccc", padding: "20px", width: "400px" }}>
                <div>
                    <label>Select Patient:</label><br />
                    <select 
                        value={selectedPatient} 
                        onChange={(e) => setSelectedPatient(e.target.value)} 
                        required
                    >
                        <option value="">-- Choose a Patient --</option>
                        {patients.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name} ({p.email})
                            </option>
                        ))}
                    </select>
                </div>
                <br />
                
                <div>
                    <label>Report Title:</label><br />
                    <input 
                        type="text" 
                        placeholder="e.g. Blood Test, X-Ray"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />
                </div>
                <br />

                <div>
                    <label>Select File (PDF/Image):</label><br />
                    <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        required 
                    />
                </div>
                <br />

                <button type="submit" style={{ background: "green", color: "white", padding: "10px" }}>
                    🚀 Upload & Send to Patient
                </button>
            </form>

            <hr />
            <p>Note: Upload ki hui reports patient ke dashboard par turant dikhne lagengi.</p>
        </div>
    );
};

export default DoctorDashboard;