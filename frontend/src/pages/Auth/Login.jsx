import React,{useState,useContext} from "react";
import API from "../../services/api";
import { Authcontext } from "../../context/Authcontext";
import {useNavigate} from "react-router-dom";
const Login =()=>{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const {login}= useContext(Authcontext);
    const navigate=useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const res = await API.post("/auth/login",{email,password});

            if(res.data.success){
                login(res.data.user);

                if(res.data.user.role==="doctor"){
                    navigate("/doctor-dashboard");
                }else{
                    navigate("patient-dashboard");
                }
            }
        }catch(error){
            alert(error.response?.data?.message||"Login Failed! Check Credentials.");
        }
    };
    return(
        <div className="auth-container">
            <div className="auth-card">
                <h2>Hospital</h2>
                <p>Welcome back! Please Login</p>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email Address"
                    onChange={(e)=>setEmail(e.target.value)}/>  

                    <input type="password" placeholder="Enter Password" onChange={(e)=>setPassword(e.target.value)} />
                    <button type="Submit">Login</button>
                    </form>
                    <p>Don't have am Account? <span onClick={()=>navigate("/register")}>Register</span></p>
            </div>
        </div>
    );
};
export default Login;