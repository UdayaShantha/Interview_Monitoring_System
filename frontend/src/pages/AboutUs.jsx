import React from 'react';
import Navbar from '../components/Navbar';
import { FaUsers, FaRocket, FaStar, FaLightbulb, FaHandshake, FaBriefcase } from 'react-icons/fa';
//import backgroundImage from '../assets/bg.jpg';
import teamImage1 from '../assets/team1.png';


function AboutUs() {
  return (
    <div className="about-container">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          <FaRocket className="hero-icon" /> Empowering Teams for Success
        </h1>
        <p className="hero-subtitle">
          We help you build skilled teams of developers, testers, and leaders with speed and efficiency.
        </p>
      </section>

      {/* Core Values */}
      <section className="values-section">
        <h2 className="values-title">
          <FaLightbulb className="hero-icon" /> Our Core Values
        </h2>
        <div className="values-grid">
          {[
            { icon: <FaUsers />, title: "Collaboration", desc: "Teamwork and transparency drive our success." },
            { icon: <FaStar />, title: "Excellence", desc: "We strive for innovation and high-quality solutions." },
            { icon: <FaHandshake />, title: "Trust", desc: "Integrity and honesty build strong partnerships." }
          ].map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-desc">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2 className="team-title">
          <FaBriefcase className="hero-icon" /> Meet Our Team
        </h2>
        <div className="team-grid">
          {[
            { name: 'Alice', role: 'Developer', img: teamImage1 },
            { name: 'Bob', role: 'Tester', img: teamImage1 },
            { name: 'Charlie', role: 'Team Lead', img: teamImage1 }
          ].map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.img} alt={member.name} className="team-img" />
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 AI Interview Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AboutUs;
