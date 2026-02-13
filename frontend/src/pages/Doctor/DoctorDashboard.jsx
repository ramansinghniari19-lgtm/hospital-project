import React, { useState, useEffect } from "react";
import {io}from"socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8080", {
    transports: ["websocket"],
    withCredentials: true
});const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [file, setFile] = useState(null);
    const [testName, setTestName] = useState("");
    
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const fetchAppointments = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/doctor/appointments", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        if (user && user.id) {
            socket.emit("join_room", user.id);
            console.log("Joined room:", user.id);
        }
        socket.on("new_appointment", (data) => {
            alert(`🔔 ${data.message}`); // Aap isse Toastify se replace kar sakte hain
            fetchAppointments(); // Data refresh karein automatically
        });
        return () => {
            socket.off("new_appointment");
        };
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const endpoint = status === "Accepted" ? "accept" : "reject";
            await axios.put(`http://localhost:8080/api/doctor/${endpoint}/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Appointment ${status}!`);
            fetchAppointments();
        } catch (err) {
            alert("Status update failed");
        }
    };

    const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !testName) return alert("Please provide both file and test name");

    const formData = new FormData();
    formData.append("reportFile", file); 
    formData.append("reportName", testName);

    try {
        await axios.post(`http://localhost:8080/api/doctor/complete-appointment/${selectedAppt._id}`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        alert("Appointment Completed & Report Uploaded!");
        setShowModal(false);
        fetchAppointments(); // List refresh karo
    } catch (err) {
        alert(err.response?.data?.message || "Upload Failed");
    }
};

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === "pending").length,
        accepted: appointments.filter(a => a.status === "Accepted").length
    };

    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (
        <div className="doc-dash-wrapper">
            <header className="doc-nav">
                <h2>Doctor Dashboard</h2>
                <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href="/login"; }}>Logout</button>
            </header>

            <div className="stats-container">
                <div className="stat-card"><h3>{stats.total}</h3><p>Total Apps</p></div>
                <div className="stat-card pending"><h3>{stats.pending}</h3><p>Pending</p></div>
                <div className="stat-card accepted"><h3>{stats.accepted}</h3><p>Accepted</p></div>
            </div>

            <div className="table-container">
                <h3>Appointment Requests</h3>
                <table className="doc-table">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appt) => (
                            <tr key={appt._id}>
                                <td>{appt.patientId?.name || "N/A"}</td>
                                <td>{appt.date}</td>
                                <td><span className={`status-pill ${appt.status}`}>{appt.status}</span></td>
                                <td>
                                    {appt.status === "pending" ? (
                                        <div className="action-btns">
                                            <button className="acc-btn" onClick={() => updateStatus(appt._id, "Accepted")}>Accept</button>
                                            <button className="rej-btn" onClick={() => updateStatus(appt._id, "Rejected")}>Reject</button>
                                        </div>
                                    ) : appt.status === "Accepted" ? (
                                        <button className="upload-btn" onClick={() => { setSelectedAppt(appt); setShowModal(true); }}>
                                            Upload Report
                                        </button>
                                    ) : (
                                        <span className="done-text">Rejected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Upload Report for {selectedAppt.patientId.name}</h3>
                        <form onSubmit={handleUpload}>
                            <input type="text" placeholder="Test Name (e.g. Blood Test)" required 
                                   onChange={(e) => setTestName(e.target.value)} />
                            <input type="file" accept=".pdf,.jpg,.png" required 
                                   onChange={(e) => setFile(e.target.files[0])} />
                            <div className="modal-btns">
                                <button type="submit" className="submit-btn">Submit Report</button>
                                <button type="button" className="close-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;