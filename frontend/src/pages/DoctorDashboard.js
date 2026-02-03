import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, aRes] = await Promise.all([
                    axios.get(`${API_BASE}/doctor/patients`, { withCredentials: true }),
                    axios.get(`${API_BASE}/doctor/appointments`, { withCredentials: true })
                ]);
                setPatients(pRes.data);
                setAppointments(aRes.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    navigate("/login");
                }
            }
        };
        fetchData();
    }, [navigate]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await axios.put(
                `${API_BASE}/doctor/update-status/${id}`, 
                { status: newStatus }, 
                { withCredentials: true }
            );
            if (res.status === 200) {
                setAppointments(prev => prev.map(app => 
                    app._id === id ? { ...app, status: newStatus } : app
                ));
            }
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("patientId", selectedPatient);
        formData.append("title", title);
        formData.append("report", file);

        try {
            await axios.post(`${API_BASE}/doctor/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            alert("✅ Report Uploaded Successfully!");
            setTitle("");
            setFile(null);
            setSelectedPatient("");
            document.getElementById("fileInput").value = "";
        } catch (err) {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${API_BASE}/auth/logout`, { withCredentials: true });
            navigate("/login");
        } catch (err) {
            navigate("/login");
        }
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Navbar */}
            <nav className="navbar navbar-dark bg-primary shadow-sm mb-4">
                <div className="container">
                    <span className="navbar-brand mb-0 h1">👨‍⚕️ Doctor Dashboard</span>
                    <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="container">
                <div className="row">
                    {/* Appointments Table */}
                    <div className="col-lg-8 mb-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">📅 Patient Appointments</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patient Name</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.length > 0 ? (
                                                appointments.map((app) => (
                                                    <tr key={app._id}>
                                                        <td className="align-middle">{app.patientName || "User"}</td>
                                                        <td className="align-middle">
                                                            <span className={`badge ${app.status === 'Accepted' ? 'bg-success' : app.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {app.status === "Pending" && (
                                                                <div className="btn-group btn-group-sm">
                                                                    <button className="btn btn-outline-success" onClick={() => handleStatusUpdate(app._id, "Accepted")}>Accept</button>
                                                                    <button className="btn btn-outline-danger" onClick={() => handleStatusUpdate(app._id, "Rejected")}>Reject</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="3" className="text-center p-3 text-muted">No appointments found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Upload Form */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-header bg-white text-center">
                                <h5 className="mb-0">📤 Upload Medical Report</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleUpload}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Select Patient</label>
                                        <select className="form-select" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                                            <option value="">Choose...</option>
                                            {patients.map((p) => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Report Title</label>
                                        <input type="text" className="form-control" placeholder="e.g., Blood Test" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">File (PDF/Image)</label>
                                        <input id="fileInput" type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "🚀 Send Report"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;