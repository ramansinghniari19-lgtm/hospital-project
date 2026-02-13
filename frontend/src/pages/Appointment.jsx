import React, { useState, useEffect } from "react";
import API from "../services/api";   
import { useNavigate } from "react-router-dom";

const BookAppointment = () => {

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [formData, setFormData] = useState({ date: "", time: "", message: "" });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchDoctors = async () => {
            try {
                const res = await API.get("/patient/view-doctors");
                setDoctors(res.data);
            } catch (error) {
                console.log("Doctor fetch error:", error);
                alert("Doctor load nhi ho paya");
            } finally {
                setLoading(false);   
            }
        };

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Session expired, please login again");
            navigate("/login");
            return;
        }

        fetchDoctors();

    }, [navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDoctor) {
            return alert("Please select a doctor");
        }

        try {
            await API.post("/patient/book", {
                ...formData,
                doctorId: selectedDoctor._id
            });

            alert("Appointment Booked!");
            navigate("/PatientDashboard");

        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };


    if (loading) {
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
    }

    return (
        <div className="main-wrapper">

            <nav className="top-nav">
                <h3>Tagore Hospital | Appointment Booking</h3>
                <button onClick={() => navigate(-1)} className="back-btn">
                    Dashboard
                </button>
            </nav>

            <div className="split-container">

                <div className="left-panel">
                    <h2 className="panel-title">Choose Your Doctor</h2>

                    <div className="doc-list">
                        {doctors.map((doc) => (
                            <div
                                key={doc._id}
                                className={`doc-item ${selectedDoctor?._id === doc._id ? "active" : ""}`}
                                onClick={() => setSelectedDoctor(doc)}
                            >
                                <img
                                    src={
                                        doc.image
                                            ? `http://localhost:8080/uploads/profilePics/${doc.image}`
                                            : "https://via.placeholder.com/60"
                                    }
                                    alt="doc"
                                />

                                <div className="details">
                                    <h4>Dr. {doc.name}</h4>
                                    <p>{doc.specialization}</p>
                                    <span className="status">Available</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="right-panel">
                    <div className="booking-form-card">
                        <h2 className="panel-title">Appointment Details</h2>

                        {selectedDoctor ? (
                            <p>Booking with: <strong>Dr. {selectedDoctor.name}</strong></p>
                        ) : (
                            <p>Please select a doctor first</p>
                        )}

                        <form onSubmit={handleSubmit}>

                            <input
                                type="date"
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                }
                            />

                            <input
                                type="time"
                                required
                                onChange={(e) =>
                                    setFormData({ ...formData, time: e.target.value })
                                }
                            />

                            <textarea
                                placeholder="Message..."
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                            />

                            <button type="submit" disabled={!selectedDoctor}>
                                Confirm Appointment
                            </button>

                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookAppointment;
