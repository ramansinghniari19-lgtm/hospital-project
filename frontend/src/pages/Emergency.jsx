import React ,{useState}from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Emergency=()=>{
    const[phone,setPhone]=useState("");
    const [loading,setLoading]=useState(false);
    const navigate=useNavigate();

    const handleSOS=async (e)=>{
        e.preventDefault();

        if(!phone||phone.length<10){
            alert("Please enter your valid number");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async(position)=>{
                const {latitude,longitude}=position.coords;
                try{
                    const res = await axios.post("http://localhost:8080/api/emergency/sos",{
                        phone:phone,
                        lat:latitude,
                        lng:longitude
                    });
                    if(res.data.success){
                        alert("Success: Ambulance dispatched! Email sent to Admin.");
                        setPhone("");
                        navigate("/");
                    }
                }catch(error){
                    console.error("SOS Error",error.response?.data);
                    alert("Emergency request failed.Please call 108 immeditely");
                }finally{
                    setLoading(false);
                }
            },
            (err)=>{
                setLoading(false);
                alert("Location access denied! Please enable a gps to send sos.");
            }
        )
    };
    return(
        <div className="emergency-page">
        <div className="sos-card">
            <div className="sos-header">
                <span className="sos-icon">Emergency</span>
                <h2>Emergency SOS</h2>
                <p>Don't panic! Enter your number  and we'll track your location to send help </p>
            </div>
            <form onSubmit={handleSOS} className="sos-form">
                <div className="input-group">
                    <label >Mobile Number</label>
                    <input type="number" placeholder="+9111111111" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
                </div>
                <button type="submit" className="sos-submit-btn" disabled={loading}>
                {loading?"Fetching Location..":"SEND HELP NOW"}
                </button>
            </form>
            <button className="back-link" onClick={()=>navigate("/")}>Back to Home</button>
        </div>
        </div>
    );
};
export default Emergency;