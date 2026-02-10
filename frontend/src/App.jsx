import React from "react";
import { BrowserRouter as Router,Routes,Route,Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to ="/Home"/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="Register" element={<Register/>}/>
        <Route path="Home" element={<Home/>}/>

      </Routes>
    </Router>
  );
   
}
export default App
