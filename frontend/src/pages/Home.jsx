import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/download.png'
const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="logo" style={{fontSize: '24px', fontWeight: 'bold',display:'flex',gap:'10px'}}> <img src={logo} style={{height:"80px",marginLeft:'1px'}} alt="Hospital logo" /> Tagore Hospital</div>
                <div className="nav-right">
                    <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn" onClick={() => navigate('/register')}>Register</button>
                    <button className="nav-btn nav-emergency" onClick={() => navigate('/emergency')}>🚨 Emergency</button>
                </div>
            </nav>

            <div className="hero" style={{textAlign: 'center', padding: '100px 20px'}}>
                <h1>Compassion. Care. Innovation.</h1>
                <p>Leading the way in medical excellence.</p>
            </div>

            <div className="services-preview-section">
            </div>
            <footer className='Footer'> <span >tg@gmail.com </span> <span >+91 9115585258</span> </footer>
        </div>
    );
}

export default Home;