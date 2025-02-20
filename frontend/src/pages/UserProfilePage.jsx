import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import './App.css';

function UserProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState('00D 00H 00M 00S');

  useEffect(() => {
    const interviewStartTime = new Date('2025-02-10T10:00:00').getTime();
    
    function updateTimer() {
      const now = new Date().getTime();
      const difference = interviewStartTime - now;

      if (difference <= 0) {
        setTimeLeft('00D 00H 00M 00S');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
    }

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    navigate('/login');
  }

  return (
    <div className="user-container">
      <header className="user-header">
        <h1 className="company-name">LOGO</h1>
        <nav className="header-buttons">
          <button 
            className={`nav-btn ${location.pathname === '/user-profile' ? 'active' : ''}`}
            onClick={() => navigate('/user-profile')}
          >
            Home
          </button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </nav>
      </header>
      
      <section className="welcome-banner">
        <h2>Welcome, Bob!</h2>
      </section>

      <main className="profile-section">
        <div className="profile-card">
          <h2 className="profile-title">Software Engineer Interview</h2>
          <p className="profile-description">
            Experience AI-driven hiring with real-time facial and emotion analysis.
          </p>
          <button className="start-btn">Start Interview</button>
          <p className="time-left">Time Left: {timeLeft}</p>
        </div>
        <div className="profile-picture">
          <img src="user.png" alt="User Profile" className="profile-img" />
        </div>
      </main>
      
      <footer className="user-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>📍 124/B, Lily Avenue, Colombo 5</p>
            <p>📧 abc@gmail.com | 📞 074-5678900</p>
          </div>
          <div className="social-icons">
            <a href="#"><Facebook size={24} /></a>
            <a href="#"><Twitter size={24} /></a>
            <a href="#"><Linkedin size={24} /></a>
            <a href="#"><Youtube size={24} /></a>
          </div>
        </div>
        <p className="footer-rights">© 2025 AI Interview System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default UserProfilePage;
