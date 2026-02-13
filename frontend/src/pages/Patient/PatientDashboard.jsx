import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const token = localStorage.getItem("token");

   const fetchPatientData = async () => {
    try {
        const res = await axios.get(`http://localhost:8080/api/patient/my-medical-history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setAppointments(res.data || []);
        
        const allReports = res.data
            .filter(app => app.status === "Completed" && app.reports && app.reports.length > 0)
            .flatMap(app => app.reports.map(r => ({
                ...r,
                doctorName: app.doctorId?.name,
                date: app.date
            })));
            
        setReports(allReports);
    } catch (err) {
        console.error("Fetch error:", err);
    } finally {
        setLoading(false);
    }
};
    useEffect(() => {
        if (token) fetchPatientData();
        else navigate("/login");
    }, [token]);

    if (loading) return <div className="loading-state">Loading Dashboard...</div>;

    const medicalReports = appointments
        .filter(app => app.status === "Completed" && app.reports && app.reports.length > 0)
        .flatMap(app => app.reports.map(r => ({ ...r, doctorName: app.doctorId?.name, date: app.date })));

    return (
        <div className="dashboard-container">
            <div className="dash-nav">
                <h2>Welcome, {user?.name || "Patient"}</h2>
                <div className="dash-btns">
                    <button className="book-btn" onClick={() => navigate("/book-appointment")}>Book Appointment</button>
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
                </div>
            </div>

            <div className="dash-content">
                <div className="dash-section">
                    <h3>My Appointments</h3>
                    <div className="table-wrapper">
                        <table className="dash-table">
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
                                        {/* Backend mein doctorId populate hokar aati hai */}
                                        <td>Dr. {app.doctorId?.name || "General"}</td>
                                        <td>{new Date(app.date).toLocaleDateString()}</td>
                                        <td><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                                    </tr>
                                )) : <tr><td colSpan="3">No appointments found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dash-section">
                    <h3>Medical Reports</h3>
                    <div className="reports-grid">
                        {medicalReports.length > 0 ? medicalReports.map((report, index) => (
                            <div className="report-card" key={index}>
                                <div className="report-info">
                                    <h4>{report.reportName}</h4>
                                    <p>By Dr. {report.doctorName}</p>
                                    <small>{new Date(report.date).toLocaleDateString()}</small>
                                </div>
                                <a 
                                    href={`http://localhost:8080/uploads/reports/${report.fileUrl}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="download-link"
                                >
                                    View Report
                                </a>
                            </div>
                        )) : <p>No reports available yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;