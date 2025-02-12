import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

function UserProfilePage () {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("00D 00H 00M 00S");

  useEffect(() => {
    const interviewStartTime = new Date("2025-02-10T10:00:00").getTime();
    
    function updateTimer () {
      const now = new Date().getTime();
      const difference = interviewStartTime - now;

      if (difference <= 0) {
        setTimeLeft("00D 00H 00M 00S");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
    };

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleLogout () {
    navigate('/login');
  };

  return (
    <div className="user-container">
      
      <header className="user-header">
        <h1 className="company-name">🚀 LOGO</h1>
        <div className="header-buttons">
          <button className="home-btn">🏠 Home</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 LogOut</button>
        </div>
      </header>
      
   
      <div className="welcome-banner">
        <span>👋 Welcome, Bob!</span>
      </div>

      
      <main className="profile-section">
        <div className="profile-card">
          <h2 className="profile-title">🎯 JOB INTERVIEW (Position)</h2>
          <p className="profile-description">
            Simplify hiring with live interviews, emotion detection, and facial recognition.  
            Efficient, secure, and advanced!
          </p>
          <button className="start-btn">🎥 Start Interview</button>
          <p className="time-left">⏳ Time Left: {timeLeft}</p>
        </div>
        <div className="profile-picture">
          <img src="Bob.jpg" alt="User" />
        </div>
      </main>

    
      <footer className="user-footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">🔰 LOGO</div>
            <p>📍 No 124/B, Lily Avenue, Colombo 5</p>
            <p>📧 abc@gmail.com</p>
            <p>📞 074-5678900</p>
          </div>

          <div className="social-icons">
            <a href="https://www.facebook.com" className="social-btn"><Facebook size={24} /></a>
            <a href="https://www.twitter.com" className="social-btn"><Twitter size={24} /></a>
            <a href="https://www.linkedin.com" className="social-btn"><Linkedin size={24} /></a>
            <a href="https://www.youtube.com" className="social-btn"><Youtube size={24} /></a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 AI Interview System. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserProfilePage;
