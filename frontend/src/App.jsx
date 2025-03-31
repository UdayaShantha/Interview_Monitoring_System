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
<<<<<<< HEAD
import UpcomingInterviewsPage from './pages/UpcomingInterviewsPage';
import CompletedInterviewsPage from './pages/CompletedInterviewsPage';
import PostponedInterviewsPage from './pages/PostponedInterviewsPage';
import CancelledInterviewsPage from './pages/CancelledInterviewsPage';
import VideoScreen from './pages/VideoScreen';
import VideoPage from './pages/VideoPage';
import FeedbackPage from './pages/FeedbackPage';
=======
>>>>>>> 1d0a6cce8213593cb07725bac36d9d60f7c8792e

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
<<<<<<< HEAD
        <Route path="/interviews/upcoming" element={<UpcomingInterviewsPage />} />
        <Route path="/interviews/completed" element={<CompletedInterviewsPage />} />
        <Route path="/interviews/postponed" element={<PostponedInterviewsPage />} />
        <Route path="/interviews/cancelled" element={<CancelledInterviewsPage />} />
        <Route path="/video-screen" element={<VideoScreen />} />
        <Route path="/video-session" element={<VideoPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
=======
>>>>>>> 1d0a6cce8213593cb07725bac36d9d60f7c8792e

        
      </Routes>
    </Router>

  );
}

export default App;
