import React from 'react';
import './App.css';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaUserCheck, FaLaptop, FaEye, FaMicrophone, FaTasks } from 'react-icons/fa';
import loginBackground from '../assets/login.png';

function InstructionPage() {
  return (
    <div 
      className="instruction-container" 
      style={{ backgroundImage: `url(${loginBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Navbar />
      <br></br>
      

      {/* Instruction Box */}
      <div className="instruction-box colorful-box expanded-width">
        <h2 className="instruction-title">
          <FaTasks className="icon" /> Important Instructions
        </h2><br></br>
        <ol className="instruction-list">
          <li className="colorful-item"><FaLaptop className="bullet-icon" /> Find a quiet environment with good lighting.</li>
          <li className="colorful-item"><FaUserCheck className="bullet-icon" /> Dress professionally to create a good impression.</li>
          <li className="colorful-item"><FaMicrophone className="bullet-icon" /> Ensure your camera and microphone are working.</li>
          <li className="colorful-item"><FaEye className="bullet-icon" /> Maintain eye contact and sit upright.</li>
          <li className="colorful-item"><FaUserCheck className="bullet-icon" /> Log in using your provided credentials.</li>
          <li className="colorful-item"><FaEye className="bullet-icon" /> Maintain eye contact and sit upright.</li>
          <li className="colorful-item"><FaUserCheck className="bullet-icon" /> Log in using your provided credentials.</li>
          
        </ol>
        <button className="back-button" onClick={() => window.history.back()}>
          <FaArrowLeft className="icon" /> Back
        </button>
      </div>
    </div>
  );
}

export default InstructionPage;
