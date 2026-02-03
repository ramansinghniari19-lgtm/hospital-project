import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
    const [doctor, setDoctor] = useState([]); 
    const [date, setDate] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api";

    // Doctors fetch karne ke liye (Ye backend ka public route hai)
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get(`${API_BASE}/doctor/public/doctor`);
                if (res.data) {
                    setDoctor(Array.isArray(res.data) ? res.data : [res.data]);
                }
            } catch (err) {
                console.error("Doctor load error:", err);
            }
        };
        fetchDoctor();
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!selectedDoctor) return alert("Bhai, pehle doctor toh chuno!");

        // --- BACKEND KI REQUIREMENTS KE HISAB SE DATA ---
        const bookingData = {
            doctorId: selectedDoctor,
            date: date,
            time: "10:30 AM", // Backend model mein required:true hai, isliye static bhej rahe hain
            message: "Patient is requesting an appointment"
        };

        try {
            // FIX: Backend route exact '/patient/book' hai
            const res = await axios.post(
                `${API_BASE}/patient/book`, 
                bookingData, 
                { withCredentials: true } // Cookies/Session ke liye mandatory
            );
            
            console.log("Success:", res.data);
            alert("✅ Appointment Book ho gayi bhai!");
            navigate("/patient-dashboard");
        } catch (err) {
            // console mein error dekhne ke liye
            console.error("Fail Detail:", err.response?.data);
            
            // Agar backend 401 de raha hai toh login issue hai
            const errorMsg = err.response?.data?.message || "Booking fail! Login check karo.";
            alert(errorMsg);
        }
    };

    return (
        <div style={{ padding: "30px", maxWidth: "450px", margin: "50px auto", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", color: "#333" }}>📅 Book Appointment</h2>
            <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <label><b>Specialist Doctor:</b></label>
                    <select 
                        style={{ width: "100%", padding: "12px", marginTop: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                        value={selectedDoctor} 
                        onChange={(e) => setSelectedDoctor(e.target.value)} 
                        required
                    >
                        <option value="">-- Select Doctor --</option>
                        {doctor.map((doc) => (
                            <option key={doc._id} value={doc._id}>
                                Dr. {doc.name} ({doc.specialization})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label><b>Appointment Date:</b></label>
                    <input 
                        type="date" 
                        style={{ width: "94%", padding: "12px", marginTop: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                        value={date}
                        onChange={(e) => setDate(e.target.value)} 
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
                >
                    Confirm & Send Request
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;