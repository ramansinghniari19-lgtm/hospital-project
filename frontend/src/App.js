import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState("Connecting to server...");

  useEffect(() => {
    axios.get("http://localhost:8080/") 
      .then(res => setMessage("Backend Connected! Server says: " + res.data))
      .catch(err => setMessage("Connection Failed! Error: " + err.message));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Hospital Management System</h1>
      <p style={{ color: message.includes("Connected") ? "green" : "red" }}>
        {message}
      </p>
    </div>
  );
}

export default App;