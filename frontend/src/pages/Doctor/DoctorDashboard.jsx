import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8080", {
    transports: ["websocket"],
    withCredentials: true
});

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [file, setFile] = useState(null);
    const [testName, setTestName] = useState("");
    const [recommendAdmit, setRecommendAdmit] = useState(false);
    const [admissionNote, setAdmissionNote] = useState("");
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
        }
        socket.on("new_appointment", (data) => {
            alert(`🔔 ${data.message}`); 
            fetchAppointments(); 
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

    const handleDischarge = async (apptId) => {
        if (!window.confirm("Are you sure you want to discharge this patient?")) return;
        try {
            await axios.post("http://localhost:8080/api/doctor/discharge-patient", 
            { appointmentId: apptId }, 
            { headers: { Authorization: `Bearer ${token}` } });
            alert("Patient Discharged and Bed is now free!");
            fetchAppointments();
        } catch (err) {
            alert(err.response?.data?.message || "Discharge failed");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !testName) return alert("Please provide both file and test name");

        const formData = new FormData();
        formData.append("reportFile", file); 
        formData.append("reportName", testName);
        formData.append("recommendAdmit", recommendAdmit);
        formData.append("admissionNote", admissionNote);

        try {
            await axios.post(`http://localhost:8080/api/doctor/complete-appointment/${selectedAppt._id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("Report Uploaded & Admission Status Updated!");
            setShowModal(false);
            setRecommendAdmit(false); 
            setAdmissionNote(""); 
            fetchAppointments(); 
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
                                <td>
                                    <span className={`status-pill ${appt.status}`}>{appt.status}</span>
                                    {appt.admissionStatus === "Admitted" && <span style={{display: 'block', fontSize: '10px', color: 'green', fontWeight: 'bold'}}>Admitted (Bed: {appt.bedNumber})</span>}
                                </td>
                                <td>
                                    <div className="action-btns" style={{display: 'flex', gap: '5px'}}>
                                        {appt.status === "pending" ? (
                                            <>
                                                <button className="acc-btn" onClick={() => updateStatus(appt._id, "Accepted")}>Accept</button>
                                                <button className="rej-btn" onClick={() => updateStatus(appt._id, "Rejected")}>Reject</button>
                                            </>
                                        ) : appt.status === "Accepted" ? (
                                            <button className="upload-btn" onClick={() => { setSelectedAppt(appt); setShowModal(true); }}>
                                                Complete Appointment
                                            </button>
                                        ) : (
                                            <span className="done-text">{appt.status}</span>
                                        )}

                                        {appt.admissionStatus === "Admitted" && (
                                            <button 
                                                onClick={() => handleDischarge(appt._id)}
                                                style={{background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                                            >
                                                Discharge
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Upload Report & Admit Decision</h3>
                        <p>Patient: {selectedAppt.patientId.name}</p>
                        <form onSubmit={handleUpload}>
                            <input className="entery" type="text" placeholder="Report Name (e.g. ECG)" required 
                                   onChange={(e) => setTestName(e.target.value)} />
                            <input type="file" required onChange={(e) => setFile(e.target.files[0])} />

                            <div style={{ margin: "20px 0", textAlign: "left", background: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", cursor: "pointer" }}>
                                    <input 
                                        type="checkbox" 
                                        checked={recommendAdmit} 
                                        onChange={(e) => setRecommendAdmit(e.target.checked)} 
                                    />
                                    Recommend Admission?
                                </label>
                                {recommendAdmit && (
                                    <textarea 
                                        className="entery" 
                                        style={{ marginTop: "10px", width: "100%", height: "70px", padding: "10px" }}
                                        placeholder="Enter Reason for Admission"
                                        value={admissionNote}
                                        onChange={(e) => setAdmissionNote(e.target.value)}
                                        required
                                    />
                                )}
                            </div>

                            <div className="modal-btns">
                                <button type="submit" className="submit-btn">Finish & Send</button>
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