import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import BookAppointment from "./pages/BookAppointment";

axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route: Agar koi seedha aaye toh use login par bhejo */}
          <Route path="/" element={<Navigate to="/home" />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          
          <Route path="*" element={<h2>404: Bhai galat raste aa gaye!</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;