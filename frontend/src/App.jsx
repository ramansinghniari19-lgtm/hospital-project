import React from "react";
import { BrowserRouter as Router,Routes,Route,Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Home from "./pages/Home.jsx";
import Emergency from "./pages/Emergency.jsx";
import PatientDashboard from "./pages/Patient/PatientDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/Authcontext.jsx";
import BookAppointment from "./pages/Appointment.jsx";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard.jsx";

function App() {
  return(
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to ="/Home"/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/Register" element={<Register/>}/>
        <Route path="/Home" element={<Home/>}/>
        <Route path="/Emergency" element={<Emergency/>}/>
<Route 
          path="/PatientDashboard" 
          element={<ProtectedRoute roleRequired="patient"><PatientDashboard /></ProtectedRoute>
          } 
        />
        <Route path="/book-appointment" element={<ProtectedRoute roleRequired={"patient"}><BookAppointment/></ProtectedRoute>}/>
          <Route 
          path="/DoctorDashboard" 
          element={<ProtectedRoute roleRequired="doctor"><DoctorDashboard/></ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </AuthProvider>
  );
   
}
export default App
