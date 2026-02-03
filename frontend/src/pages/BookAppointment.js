import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {
    const [doctorList, setDoctorList] = useState([]); // Naam badal diya taaki confusion na ho
    const [date, setDate] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api";

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await axios.get(`${API_BASE}/doctor/public/doctor`);
                console.log("Backend Raw Data:", res.data);

                // --- JUGAD FOR BACKEND UNDEFINED VARIABLE ---
                // Agar backend 'doctors' (undefined) bhej raha hai, toh res.data khali hoga.
                // Lekin agar data aa raha hai, toh hum check karenge:
                if (res.data) {
                    setDoctorList(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                console.error("Doctor load error:", err);
            }
        };
        fetchDoctor();
    }, []);

    const handleBooking = async (e) => {
        e.preventDefault();
        
        // Backend 'patientroutes.js' ke hisaab se payload
        const bookingData = {
            doctorId: selectedDoctor,
            date: date,
            time: "10:00 AM", // Backend mein 'time' required hai
            patientId: localStorage.getItem("userId"), // Ya jo bhi tera session storage hai
            message: "Appointment request"
        };

        try {
            // FIX: Route path '/book' hai patientroutes mein
            await axios.post(`${API_BASE}/patient/book`, bookingData, { withCredentials: true });
            alert("✅ Appointment Request Sent!");
            navigate("/patient-dashboard");
        } catch (err) {
            console.error("Booking Error:", err);
            alert("Booking fail! Make sure you are logged in.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Select Doctor & Date</h2>
            <form onSubmit={handleBooking}>
                <label>Doctor:</label>
                <select 
                    style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                    value={selectedDoctor} 
                    onChange={(e) => setSelectedDoctor(e.target.value)} 
                    required
                >
                    <option value="">-- Choose Doctor --</option>
                    {doctorList.length > 0 ? (
                        doctorList.map((doc) => (
                            <option key={doc._id} value={doc._id}>
                                Dr. {doc.name} ({doc.specialization})
                            </option>
                        ))
                    ) : (
                        <option disabled>No doctors found (Check DB Role)</option>
                    )}
                </select>

                <label>Date:</label>
                <input 
                    type="date" 
                    style={{ width: "100%", padding: "10px", margin: "10px 0" }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                />

                <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
                    Confirm Appointment
                </button>
            </form>
            <button onClick={() => navigate("/patient-dashboard")} style={{ marginTop: "10px", background: "none", border: "none", color: "blue", cursor: "pointer" }}>
                Back to Dashboard
            </button>
        </div>
    );
};

export default BookAppointment;