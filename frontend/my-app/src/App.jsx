import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InstructionPage from './pages/InstructionPage';
import AboutUs from './pages/AboutUs';
import UserProfilePage from './pages/UserProfilePage';
import HRDashboard from './pages/HRDashboard';
import TechnicalDashboard from './pages/TechnicalDashboard';
import './pages/App.css';


function App() {
  return (
    <Router>
      
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/instructions" element={<InstructionPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
            
          </Routes>
        
    </Router>
  );
}

export default App;
