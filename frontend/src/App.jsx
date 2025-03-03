import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InstructionPage from './pages/InstructionPage';
import AboutUs from './pages/AboutUs';
import HRDashboard from './pages/HRDashboard';
import CandidatesPage from './pages/CandidatesPage';
import TechnicalDashboard from './pages/TechnicalDashboard'; 
import UserProfilePage from './pages/UserProfilePage';
import InterviewPage from './pages/InterviewPage'; 
import './pages/App.css';

function App() {
  return (

    <div>

      <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/instructions" element={<InstructionPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidates" element={<CandidatesPage />} /> 
        <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
        <Route path="/interviews" element={<InterviewPage />} />



        </Routes>
    </Router>
    </div>
    
  );
}

export default App;
