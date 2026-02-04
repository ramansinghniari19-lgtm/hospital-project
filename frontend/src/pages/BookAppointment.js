import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
    const [doctor, setDoctor] = useState([]); 
    const [date, setDate] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api";

    // Global settings taaki har request mein cookie jaye
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                // Public route se doctors ki list lana
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

        // --- BACKEND MODEL REQUIREMENTS ---
        // Backend ko 'time' field mandatory chahiye (required: true)
        const bookingData = {
            doctorId: selectedDoctor,
            date: date,
            time: "10:30 AM", // Static time bhej rahe hain kyunki backend ise mang raha hai
            message: "Appointment request from Patient Dashboard"
        };

        try {
            // Path must be '/api/patient/book' as per your index.js + patientroutes
            const res = await axios.post(
                `${API_BASE}/patient/book`, 
                bookingData, 
                { withCredentials: true } // Sabse important line session ke liye
            );
            
            console.log("Booking Success:", res.data);
            alert("✅ Appointment Booked Successfully!");
            navigate("/patient-dashboard");
        } catch (err) {
            console.error("Booking Error Detail:", err.response?.data);
            
            // Agar status 401 hai toh matlab session nahi mila
            const status = err.response?.status;
            const msg = err.response?.data?.message || "Booking fail!";

            if (status === 401) {
                alert("❌ Session Error: Backend keh raha hai tum logged in nahi ho. Ek baar Logout karke wapas Login karo.");
            } else {
                alert(`❌ Error: ${msg}`);
            }
        }
    };

    return (
        <div style={{ padding: "30px", maxWidth: "450px", margin: "50px auto", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
            <h2 style={{ textAlign: "center", color: "#333" }}>📅 Book Appointment</h2>
            <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <label><b>Select Doctor:</b></label>
                    <select 
                        style={{ width: "100%", padding: "12px", marginTop: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                        value={selectedDoctor} 
                        onChange={(e) => setSelectedDoctor(e.target.value)} 
                        required
                    >
                        <option value="">-- Choose a Specialist --</option>
                        {doctor.map((doc) => (
                            <option key={doc._id} value={doc._id}>
                                Dr. {doc.name} ({doc.specialization})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label><b>Choose Date:</b></label>
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
                    style={{ padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
                >
                    Confirms Booking
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;