import React from "react";
import ReactDom from "react-dom/client"
import App from "./App.jsx";
import './index.css';
import { AuthProvider } from "./context/Authcontext.jsx";
ReactDom.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </React.StrictMode>
)