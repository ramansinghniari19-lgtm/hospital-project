import React ,{ useState}from "react";
import API from '../api';
import  {useNavigate} from'react-router-dom';

const Login = ()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]= useState('');
    const navigate = useNavigate();

    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            const res = await API.post('/auth/login',{email,password});

            if(res.data.success){
                alert("Login Successful!Welcome "); 
                localStorage.serItem('user',JSON.stringify(res.data.user));
                if(res.data.user.role==='doctor'){
                    navigate('doctor-dashboard');
                } else{
                    navigate('/patient-dashboard');
                }
            }
        }catch(error){
            alert("login fail.Check you Email Password");
            console.error(error)
        }
    };
    return(
        <div className="login-container">
            <from onSubmit={handleLogin}className="login-form">
                <h2>Tagore Hospital Login</h2>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
                <p>Register! <span onClick={() => navigate('/register')}> Create your Account</span></p>
            </from>
        </div>
    );
};
export default Login;