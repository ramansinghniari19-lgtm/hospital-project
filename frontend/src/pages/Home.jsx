import {useNavigate} from "react-router-dom";
import  API from "../services/api";
import axios from "axios";

 const Home =()=>{
    const navigate = useNavigate();
    const handleEmergency = async()=>{
        try{
           const res = await axios.post("http://localhost:8080/api/emergency/emergency", {
            message: "Emergency alert triggered from website Home Page!",
            time: new Date().toLocaleString()
        });
            
           if (res.status === 200 || res.data.success) {
            alert("Emergency Alert sent to Hospital! Help is on the way.");
        }
        }catch(error){
            console.error("Mail failed",error);
            alert("Emergency contact failed . Please call 108 0r 112 directly!");
        }
    };
    return(
        <div className="home-container">
            <header className="hero">
                <h1>Hospital</h1>
                <p>Advance Medical Care & real-time Reports</p>

                <div className="emergency-section">
                    <button className="emergency-btn blink" onClick={handleEmergency}>
                        Send Emergency  Alert
                    </button>
                    <h3>or call +91 9115585258</h3>
                </div>
            </header>
            <div className="auth-options">
                <h2>Join our Medical Network</h2>
                <div className="btn-group"> 
                    <button className="main-btn" onClick={()=>navigate("/login")}>Login Account </button>
                    <button className="main-btn outline" onClick={()=>navigate("/Register")}>Register</button>
                </div>
                     </div>
        </div>
    );

};
export default Home;