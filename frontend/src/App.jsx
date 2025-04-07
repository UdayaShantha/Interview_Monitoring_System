import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import AddQuestionPage from "./pages/AddQuestionPage";
import EditQuestionPage from './pages/EditQuestionPage'; 
import InterviewStatusPage from './pages/InterviewStatusPage'; // Consolidated component
import VideoScreen from './pages/VideoScreen';
import VideoPage from './pages/VideoPage';
import FeedbackPage from './pages/FeedbackPage';
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

        {/* Protected Routes */}
        <Route path="/user-profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/hr-dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
        <Route path="/technical-dashboard" element={<ProtectedRoute><TechnicalDashboard /></ProtectedRoute>} />
        <Route path="/candidates" element={<ProtectedRoute><CandidatesPage /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/candidate-form" element={<ProtectedRoute><CandidateForm /></ProtectedRoute>} />
        <Route path="/questions" element={<ProtectedRoute><QuestionPage /></ProtectedRoute>} />
        <Route path="/add-question" element={<ProtectedRoute><AddQuestionPage /></ProtectedRoute>} />
        <Route path="/edit-question/:id" element={<ProtectedRoute><EditQuestionPage /></ProtectedRoute>} />
        
        {/* Consolidated Interview Status Routes */}
        <Route path="/interviews/upcoming" element={<ProtectedRoute><InterviewStatusPage status="UPCOMING" /></ProtectedRoute>} />
        <Route path="/interviews/completed" element={<ProtectedRoute><InterviewStatusPage status="COMPLETED" /></ProtectedRoute>} />
        <Route path="/interviews/postponed" element={<ProtectedRoute><InterviewStatusPage status="POSTPONED" /></ProtectedRoute>} />
        <Route path="/interviews/cancelled" element={<ProtectedRoute><InterviewStatusPage status="CANCELLED" /></ProtectedRoute>} />
        
        <Route path="/video-screen" element={<ProtectedRoute><VideoScreen /></ProtectedRoute>} />
        <Route path="/video-session" element={<ProtectedRoute><VideoPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;