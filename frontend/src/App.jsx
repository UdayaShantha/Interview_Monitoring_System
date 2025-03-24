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
import ProtectedRoute from './components/ProtectedRoute';
import './pages/App.css';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/instructions" element={<InstructionPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/hr-dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
        <Route path="/technical-dashboard" element={<ProtectedRoute><TechnicalDashboard /></ProtectedRoute>} />
        <Route path="/candidates" element={<ProtectedRoute><CandidatesPage /></ProtectedRoute>} /> 
        <Route path="/interviews" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/candidate-form" element={<ProtectedRoute><CandidateForm /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><QuestionPage /></ProtectedRoute>} /> 
        
      </Routes>
    </Router>

  );
}

export default App;
