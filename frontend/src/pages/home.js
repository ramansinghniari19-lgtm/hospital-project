import React from "react";
import {useNavigate} from "react-router-dom";
import axios from"axios";

const Home =()=>{
        const navigate=useNavigate();
        const handleEmergency=async()=>{
            const phone = window.prompt("Please enter your Mobile Number") ;
            if(!phone)return alert("Phone Number is compulsory") ;

            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(async(position)=>{
                    const {latitude,longitude}=position.coords;
                    try{
                        const res = await axios.post("http://localhost:8080/api/emergency/sos",{
                            phone:phone,
                            lat:latitude,
                            lng:longitude
                        });
                        if(res.data.success)alert("SOS Sent! Ambulance Reached in few Minutes")
                    }catch(error){
                        alert("Server error! call 102  Immediately.or inform to a 9115585258");
                    }
                });
            }
        };
        const diseases = [
        { id: "aids", name: "AIDS / HIV", info: "Immune system ki jankari aur bachaav." },
        { id: "diabetes", name: "Diabetes", info: "Sugar management aur lifestyle tips." },
        { id: "heart", name: "Heart Disease", info: "Cardiac arrest aur heart health." },
        { id: "cancer", name: "Cancer Care", info: "Symptoms aur early detection." },
        { id: "typhoid", name: "Typhoid", info: "Bukhaar aur saaf paani ka mahatva." },
        { id: "dengue", name: "Dengue", info: "Platelets aur machharon se bachaav." },
        { id: "malaria", name: "Malaria", info: "Symptoms aur treatment ki jankari." },
        { id: "asthma", name: "Asthma", info: "Saans ki takleef aur precautions." }
    ];
  return(
    <div>
        <nav>
            <h1>Tagore Hospital 24/7</h1>
            <div>
                <div>
                    <button onClick={()=>navigate("/login")}>Login</button>
                    <button onClick={() => navigate("/register")} style={{ marginLeft: "10px" }}>Sign Up</button>
                </div>
                <div>
                    <button onClick={handleEmergency}>
                        QUICK SOS
                    </button>
                </div>
            </div>
        </nav>
        <section>
            <h3>Medical Encyclopedia</h3>
            <div>{diseases.map((d)=>(
                <div key={d.id}
                onClick={()=>navigate(`/disease/${d.id}`)}>
                    <h4>{d.name}</h4>
                    <p>{d.info}</p>
                    <span>Learn More ==</span>
                </div>
            ))}
            </div>   
            
        </section>
        <footer >
                <div >
                    <div>
                        <h4>Contact Support</h4>
                        <p><strong>Admin Email:</strong> ramansinghniari19@gmail.com</p>
                        <p><strong>Emergency No:</strong> +91 9115585258</p>
                    </div>
                    <div>
                        <h4>Tagore Hospital</h4>
                        <p>Address:  Main Road, Chandigarh</p>
                        <p>© 2026 Tagore Medical Portal</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
