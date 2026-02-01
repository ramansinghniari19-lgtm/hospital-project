import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
// Baaki pages ke components (Jab ban jayenge tab import honge)
import Register from "../pages/Register";
// import PatientDashboard from "./pages/PatientDashboard";
// import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route: Agar koi seedha aaye toh use login par bhejo */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}

          {/* Dashboards (Inhe hum kal detail mein banayenge) */}
          {/* <Route path="/patient-dashboard" element={<PatientDashboard />} /> */}
          {/* <Route path="/doctor-dashboard" element={<DoctorDashboard />} /> */}
          
          {/* Error Page: Agar koi galat URL daale */}
          <Route path="*" element={<h2>404: Bhai galat raste aa gaye!</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;