import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientDashboard = () => {
    const [patientData, setPatientData] = useState(null);
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/patient/dashboard");
                setPatientData(res.data.patient);
                setReports(res.data.reports);
            } catch (err) {
                alert("Session expired! Please login again.");
                navigate("/login");
            }
        };
        fetchDashboardData();
    }, [navigate]);

    const handleLogout = async () => {
        await axios.post("http://localhost:8080/api/auth/logout");
        navigate("/login");
    };

    return (
        <div style={{ padding: "20px" }}>
            <nav style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Patient Dashboard</h2>
                <button onClick={handleLogout} style={{ background: "orange" }}>Logout</button>
            </nav>

            <hr />

            <section>
                <h3>Welcome, {patientData?.name || "Patient"}! 👋</h3>
                <p><strong>Email:</strong> {patientData?.email}</p>
                <p><strong>Phone:</strong> {patientData?.phone || "N/A"}</p>
            </section>

            <hr />

            <section>
                <h3>My Medical Reports 📄</h3>
                {reports.length > 0 ? (
                    <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Doctor Name</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report._id}>
                                    <td>{report.title}</td>
                                    <td>{report.doctorName}</td>
                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <a href={`http://localhost:8080/${report.filePath}`} target="_blank" rel="noreferrer">
                                            View / Download
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Abhi tak koi report upload nahi hui hai.</p>
                )}
            </section>
        </div>
    );
};

export default PatientDashboard;