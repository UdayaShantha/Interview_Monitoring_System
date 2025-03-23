import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InstructionPage from './pages/InstructionPage';
import AboutUs from './pages/AboutUs';
import UserProfilePage from './pages/UserProfilePage';
import HRDashboard from './pages/HRDashboard';
import TechnicalDashboard from './pages/TechnicalDashboard';
import CandidatesPage from './pages/CandidatesPage'; 
import InterviewPage from './pages/InterviewPage';
import CandidateForm from "./pages/CandidateForm";
import QuestionPage from './pages/QuestionPage'; 
import './pages/App.css';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/instructions" element={<InstructionPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
        <Route path="/candidates" element={<CandidatesPage />} /> 
        <Route path="/interviews" element={<InterviewPage />} />
        <Route path="/candidate-form" element={<CandidateForm />} />
        <Route path="/questions" element={<QuestionPage />} /> 
        
      </Routes>
    </Router>

  );
}

export default App;
