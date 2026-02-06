import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [title, setTitle] = useState("");
    const [prescription, setPrescription] = useState(""); // Naya field dawaiyo ke liye
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE = "http://localhost:8080/api/doctor";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem("user");
                if (!userData) return;
                const user = JSON.parse(userData);
                const doctorId = user._id || user.id;

                // Appointment fetch logic
                const aRes = await axios.get(`${API_BASE}/appointments/${doctorId}`, { withCredentials: true });
                setAppointments(aRes.data || []);
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (id, actionType) => {
        try {
            const route = actionType === "accept" ? "accept" : "reject";
            await axios.put(`${API_BASE}/${route}/${id}`, {}, { withCredentials: true });
            alert(`Appointment ${actionType === "accept" ? "Accepted" : "Rejected"}!`);
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: actionType === "accept" ? "Accepted" : "Rejected" } : a));
        } catch (err) { alert("Action failed!"); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedPatient || !file) {
            return alert("Please select an appointment and a file!");
        }
        
        setLoading(true);

        // FORM DATA taiyar kar rahe hain
        const formData = new FormData();
        formData.append("reportFile", file); // Multer isi name ko dhundega
        formData.append("reportName", title);
        formData.append("prescription", prescription); // Optional prescription field

        console.log("Uploading to Appointment ID:", selectedPatient);

        try {
            const res = await axios.post(
                `${API_BASE}/complete-appointment/${selectedPatient}`, 
                formData, 
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true
                }
            );

            if (res.status === 200 || res.status === 201) {
                alert("✅ Report & Details Uploaded Successfully!");
                // Form reset karo
                setTitle("");
                setFile(null);
                setSelectedPatient("");
                setPrescription("");
            }
        } catch (err) {
            console.error("Upload Error Details:", err.response?.data);
            alert(`Upload failed: ${err.response?.data?.message || "Check Appointment ID or Server"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "30px", backgroundColor: "#f4f7f6", minHeight: "100vh", fontFamily: 'Segoe UI' }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>👨‍⚕️ Tagore Hospital - Doctor Panel</h2>
                
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
                    
                    {/* LEFT: APPOINTMENTS */}
                    <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                        <h4 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>📅 Appointment Requests</h4>
                        <table width="100%" style={{ borderCollapse: "collapse", marginTop: "15px" }}>
                            <thead>
                                <tr style={{ textAlign: "left", color: "#7f8c8d", fontSize: "14px" }}>
                                    <th style={{ padding: "12px" }}>PATIENT</th>
                                    <th style={{ padding: "12px" }}>STATUS</th>
                                    <th style={{ padding: "12px" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((app) => (
                                    <tr key={app._id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                        <td style={{ padding: "12px" }}>
                                            <b>{app.patientId?.name || "Patient"}</b><br/>
                                            <small>{app.date} | {app.time}</small>
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", 
                                                backgroundColor: app.status === "Accepted" ? "#e1f7e3" : app.status === "Rejected" ? "#fdeaea" : "#fff3cd",
                                                color: app.status === "Accepted" ? "#2ecc71" : app.status === "Rejected" ? "#e74c3c" : "#f1c40f" }}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px" }}>
                                            {app.status === "pending" && (
                                                <>
                                                    <button onClick={() => handleAction(app._id, "accept")} style={{ background: "#2ecc71", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", marginRight: "5px" }}>Accept</button>
                                                    <button onClick={() => handleAction(app._id, "reject")} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "#95a5a6" }}>No requests.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT: REPORT UPLOAD */}
                    <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", height: "fit-content" }}>
                        <h4 style={{ marginBottom: "20px" }}>📤 Send Patient Report</h4>
                        <form onSubmit={handleUpload}>
                            <label style={{ fontSize: "13px", fontWeight: "600" }}>Select Appointment</label>
                            <select style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "6px", border: "1px solid #ddd" }} 
                                    value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                                <option value="">-- Choose Patient --</option>
                                {appointments.filter(a => a.status === "Accepted").map(a => (
                                    <option key={a._id} value={a._id}>{a.patientId?.name} ({a.date})</option>
                                ))}
                            </select>

                            <label style={{ fontSize: "13px", fontWeight: "600" }}>Report Name</label>
                            <input type="text" style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "6px", border: "1px solid #ddd" }} 
                                   value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blood Test / X-Ray" required />

                            <label style={{ fontSize: "13px", fontWeight: "600" }}>Prescription / Notes (Optional)</label>
                            <textarea style={{ width: "100%", padding: "10px", margin: "8px 0 15px", borderRadius: "6px", border: "1px solid #ddd", height: "60px" }} 
                                   value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Take medicine 2 times a day..." />

                            <label style={{ fontSize: "13px", fontWeight: "600" }}>Upload PDF/Image</label>
                            <input type="file" style={{ width: "100%", margin: "8px 0 20px" }} 
                                   onChange={(e) => setFile(e.target.files[0])} required />

                            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                                {loading ? "Uploading..." : "Complete Appointment"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;