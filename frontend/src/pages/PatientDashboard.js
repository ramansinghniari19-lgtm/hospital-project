import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api/patient";

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const res = await axios.get(`${API_BASE}/my-medical-history`, { withCredentials: true });
                setAppointments(res.data);

                const allReports = [];
                res.data.forEach(app => {
                    if (app.reports && app.reports.length > 0) {
                        app.reports.forEach(rep => {
                            allReports.push({
                                ...rep,
                                doctorName: app.doctorId?.name || "Doctor",
                                appointmentId: app._id
                            });
                        });
                    }
                });
                setReports(allReports);

            } catch (err) {
                if (err.response && err.response.status === 401) {
                    navigate("/login");
                }
            }
        };
        fetchPatientData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.get("http://localhost:8080/api/auth/logout", { withCredentials: true });
            navigate("/login");
        } catch (err) {
            navigate("/login");
        }
    };

    return (
        <div>
            <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ccc" }}>
                <h2>Patient Dashboard</h2>
                <div>
                    <button 
                        onClick={() => navigate("/book-appointment")} 
                        style={{ marginRight: "10px", backgroundColor: "green", color: "white", padding: "5px 10px", cursor: "pointer" }}
                    >
                        + Book New Appointment
                    </button>
                    <button onClick={handleLogout} style={{ padding: "5px 10px", cursor: "pointer" }}>Logout</button>
                </div>
            </nav>

            <div style={{ marginTop: "20px" }}>
                <h3>My Appointments</h3>
                <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? appointments.map((app) => (
                            <tr key={app._id}>
                                <td>{app.doctorId?.name || "Doctor"}</td>
                                <td>{app.date}</td>
                                <td><b style={{ color: app.status === "Accepted" ? "green" : "orange" }}>{app.status}</b></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3">No appointments found. Book one now!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "30px" }}>
                <h3>My Medical Reports</h3>
                <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Doctor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? reports.map((report, index) => (
                            <tr key={index}>
                                <td>{report.reportName || "Medical Report"}</td>
                                <td>{report.doctorName}</td>
                                <td>
                                    {/* Yahan hum direct static path use kar rahe hain jo sabse safe hai */}
                                    <a 
                                        href={`http://localhost:8080/uploads/reports/${report.fileUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: "blue", textDecoration: "underline", fontWeight: "bold" }}
                                    >
                                        View/Download
                                    </a>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3">No reports available yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientDashboard;