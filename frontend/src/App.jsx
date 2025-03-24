import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import AddQuestionPage from "./pages/AddQuestionPage";
import EditQuestionPage from './pages/EditQuestionPage'; 

import './pages/App.css';

function App() {
  return (
    <Router>
        <ToastContainer position="bottom-right" />
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
        <Route path="/add-question" element={<AddQuestionPage />} /> 
        <Route path="/edit-question/:id" element={<EditQuestionPage />} /> 

        
      </Routes>
    </Router>

  );
}

export default App;
