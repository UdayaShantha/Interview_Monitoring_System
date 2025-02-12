import React from 'react';
import './App.css';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaLightbulb, FaCheckCircle, FaUserCheck, FaLaptop, FaEye, FaMicrophone, FaTasks } from 'react-icons/fa';
import loginBackground from '../assets/login.png';

function InstructionPage() {
  return (
    <div 
          className="instruction-container" 
          style={{ backgroundImage: `url(${loginBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
      <Navbar />

      {/* Hero Section - Now with margin to prevent overlap */}
      <div className="instruction-hero">
        <h1 className="instruction-title">
          <FaLightbulb className="instruction-icon" /> Prepare for Your Interview!
        </h1>
        <p className="instruction-subtitle">Follow these steps for a smooth interview experience.</p>
      </div>

      {/* Instruction Box - Same as Login Form Size */}
      <div className="instruction-box">
        <h2 className="instruction-title">
          <FaTasks className="icon" /> Instructions
        </h2>
        <ol className="instruction-list">
          <li><FaLaptop className="bullet-icon" /> Quiet environment with good lighting.</li>
          <li><FaUserCheck className="bullet-icon" /> Dress professionally.</li>
          <li><FaMicrophone className="bullet-icon" /> Check camera & microphone.</li>
          <li><FaEye className="bullet-icon" /> Maintain eye contact.</li>
          <li><FaCheckCircle className="bullet-icon" /> Be ready for technical questions.</li>
          <li><FaUserCheck className="bullet-icon" /> Login with your credentials.</li>
          <li><FaCheckCircle className="bullet-icon" /> Select your position.</li>
          <li><FaCheckCircle className="bullet-icon" /> Verify your details before submission.</li>
        </ol>
        <button className="back-button" onClick={() => window.history.back()}>
          <FaArrowLeft className="icon" /> Back
        </button>
      </div>
    </div>
  );
}


export default InstructionPage;
