import React from 'react';
import Navbar from '../components/Navbar';
import { FaUsers, FaRocket, FaStar, FaLightbulb, FaHandshake, FaBriefcase } from 'react-icons/fa';
import backgroundImage from '../assets/bg.jpg'; 
import './App.css';

function AboutUs  () {
  return (
     <div
      className="about-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <nav className="navbar-container">
        <div className="logo">🌟Logo</div>
        <Navbar />
      </nav>

      
      <section className="hero-section">
        <h1 className="hero-title slide-in">
          <FaRocket className="hero-icon" /> Empowering Teams for Success
        </h1>
        <p className="hero-subtitle fade-in">
          We help you build skilled teams of developers, testers, and leaders with speed and efficiency.
        </p>
      </section>

      

      
      <section className="values-section">
        <h2 className="values-title"><FaLightbulb /> Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <FaUsers className="value-icon" />
            <h3>Collaboration</h3>
            <p>Teamwork and transparency drive our success.</p>
          </div>
          <div className="value-card">
            <FaStar className="value-icon" />
            <h3>Excellence</h3>
            <p>We strive for innovation and high-quality solutions.</p>
          </div>
          <div className="value-card">
            <FaHandshake className="value-icon" />
            <h3>Trust</h3>
            <p>Integrity and honesty build strong partnerships.</p>
          </div>
        </div>
      </section>

      
      <section className="team-section">
        <h2 className="team-title"><FaBriefcase /> Meet Our Team</h2>
        <div className="team-grid">
          {['Alice', 'Bob', 'Charlie'].map((member, index) => (
            <div key={index} className="team-card">
              <img src={`/team-${index + 1}.jpg`} alt={member} className="team-img" />
              <h3>{member}</h3>
              <p>{['Developer', 'Tester', 'Team Lead'][index]}</p>
            </div>
          ))}
        </div>
      </section>

      
      <footer className="footer">
        <p>&copy; 2025 AI Interview Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;
