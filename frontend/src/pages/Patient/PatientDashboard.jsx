import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import AlarmIcon from '@mui/icons-material/Alarm';

const PatientDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [beds, setBeds] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [selectedApptId, setSelectedApptId] = useState(null); 
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    const fetchPatientData = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/patient/my-medical-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data || []);

            const bedRes = await axios.get("http://localhost:8080/api/doctor/all-beds", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBeds(bedRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPatientData();
        else navigate("/login");
    }, [token]);

    const handleConfirmAdmission = async (bedNum) => {
        try {
            await axios.post("http://localhost:8080/api/doctor/confirm-admission", 
            { appointmentId: selectedApptId, bedNumber: bedNum }, 
            { headers: { Authorization: `Bearer ${token}` } });

            alert(`Mubarak ho! Bed ${bedNum} book ho gaya hai.`);
            setSelectedApptId(null);
            fetchPatientData(); 
        } catch (err) {
            alert(err.response?.data?.message || "Bed booking failed");
        }
    };

    if (loading) return <div className="loading-state">Loading Dashboard...</div>;

    const medicalReports = appointments
        .filter(app => app.status === "Completed" && app.reports?.length > 0)
        .flatMap(app => app.reports.map(r => ({ 
            ...r, 
            doctorName: app.doctorId?.name, 
            doctorSpec: app.doctorId?.specialization,
            apptDate: app.date,
            apptTime: app.time 
        })));

    return (
        <div className="dashboard-wrapper">
            <div className="dash-nav">
                <div className="user-welcome">
                    <h2>Welcome, <span>{user?.name || "Patient"}</span></h2>
                    <p>Manage your health and appointments</p>
                </div>
                <div className="dash-btns">
                    <button className="book-btn" onClick={() => navigate("/book-appointment")}>+ Book New</button>
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
                </div>
            </div>

            <div className="dash-content">
                {selectedApptId && (
                    <section className="dash-section admission-box" style={{background: '#f8f9fa', padding: '25px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #dee2e6', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{margin: 0, color: '#333'}}>Select Your Hospital Bed</h3>
                        </div>
                        
                        <div className="bed-grid" style={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px'}}>
                            {beds.map((bed) => {
                                const isICU = bed.bedType === 'ICU';
                                const isPrivate = bed.bedType === 'Private';
                                return (
                                    <div 
                                        key={bed.bedNumber}
                                        onClick={() => !bed.isOccupied && handleConfirmAdmission(bed.bedNumber)}
                                        style={{
                                            width: '110px', padding: '15px 10px', textAlign: 'center', borderRadius: '12px',
                                            cursor: bed.isOccupied ? 'not-allowed' : 'pointer',
                                            backgroundColor: bed.isOccupied ? '#ffccd5' : isICU ? '#f3e5f5' : isPrivate ? '#e3f2fd' : '#e8f5e9',
                                            border: bed.isOccupied ? '1px solid #ff4d4d' : '1px solid #ddd',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <div style={{fontSize: '24px', marginBottom: '5px'}}>
                                            {bed.isOccupied ? '🚫' : isICU ? '🚨' : isPrivate ? '🏠' : '🛏️'}
                                        </div>
                                        <div style={{fontWeight: 'bold', fontSize: '16px'}}>{bed.bedNumber}</div>
                                        <div style={{fontSize: '10px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase'}}>{bed.bedType}</div>
                                        <div style={{fontSize: '11px', color: '#2e7d32', fontWeight: 'bold', marginTop: '4px'}}>₹{bed.pricePerDay}/day</div>
                                        <small style={{fontSize: '10px', display: 'block', marginTop: '5px', color: bed.isOccupied ? 'red' : 'green'}}>
                                            {bed.isOccupied ? "Occupied" : "Available"}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="logout-btn" style={{marginTop: '20px', background: '#6c757d'}} onClick={() => setSelectedApptId(null)}>Cancel</button>
                    </section>
                )}

                <section className="dash-section">
                    <div className="section-header">
                        <h3>Upcoming & Recent Appointments</h3>
                    </div>
                    
                    <div className="appointments-grid">
                        {appointments.length > 0 ? appointments.map((app) => (
                            <div className="appointment-card" key={app._id}>
                                <div className="card-left">
                                    <div className={`status-dot ${app.status}`}></div>
                                    <div className="info">
                                        <h4>Dr. {app.doctorId?.name || "Specialist"}</h4>
                                        <div className="time-meta">
                                            <span> <svg className="calender" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>{new Date(app.date).toLocaleDateString()}</span>
                                            <span> <IconButton color="secondary" aria-label="add an alarm"><AlarmIcon /></IconButton>{app.time || "Not Set"}</span> 
                                        </div>

                                        {app.admissionStatus === "Recommended" && (
                                            <div className="status-pill Recommended" style={{background: '#ffc107', color: '#000', cursor: 'pointer'}} onClick={() => setSelectedApptId(app._id)}>
                                                Action Required: Select Bed
                                            </div>
                                        )}
                                        {app.admissionStatus === "Admitted" && (
                                            <div className="status-pill Admitted" style={{background: '#28a745', color: '#fff'}}>
                                                Currently Admitted: Bed {app.bedNumber}
                                            </div>
                                        )}
                                        {app.admissionStatus === "Discharged" && (
                                            <div className="status-pill Discharged" style={{background: '#17a2b8', color: '#fff'}}>
                                                Discharged
                                            </div>
                                        )}
                                        
                                        <span className={`status-pill ${app.status}`}>{app.status}</span>
                                    </div>
                                </div>
                                
                                <div className="card-right">
                                     {(app.status === "pending" || app.status === "Accepted") && (
                                        <button className="edit-action-btn" onClick={() => navigate(`/book-appointment?edit=${app._id}`)}>Edit</button>
                                     )}
                                     {app.admissionStatus === "Recommended" && (
                                        <button className="book-btn" onClick={() => setSelectedApptId(app._id)}>Select Bed</button>
                                     )}
                                </div>
                            </div>
                        )) : <div className="no-data">No appointments found.</div>}
                    </div>
                </section>

                <section className="dash-section">
                    <div className="section-header">
                        <h3>Medical Reports & History</h3>
                    </div>
                    
                    <div className="reports-grid">
                        {medicalReports.length > 0 ? medicalReports.map((report, index) => (
                            <div className="report-card-premium" key={index}>
                                <div className="report-icon-box">📄</div>
                                <div className="report-details-main">
                                    <div className="report-top-row">
                                        <h4>{report.reportName}</h4>
                                        <span className="date-badge">{new Date(report.apptDate).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <div className="report-meta">
                                        <p><strong>Doctor:</strong> Dr. {report.doctorName} <small>({report.doctorSpec})</small></p>
                                        <p><strong>Time:</strong> {report.apptTime || "N/A"}</p>
                                    </div>

                                    <div className="report-footer-action">
                                        <a href={`http://localhost:8080/uploads/reports/${report.fileUrl}`} target="_blank" rel="noreferrer" className="view-report-link">
                                            View PDF Report
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="no-data">No reports available yet.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PatientDashboard;