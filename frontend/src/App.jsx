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
import AddQuestionPage from "./pages/AddQuestionPage";
import EditQuestionPage from './pages/EditQuestionPage'; 
import UpcomingInterviewsPage from './pages/UpcomingInterviewsPage';
import CompletedInterviewsPage from './pages/CompletedInterviewsPage';
import PostponedInterviewsPage from './pages/PostponedInterviewsPage';
import CancelledInterviewsPage from './pages/CancelledInterviewsPage';
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
        <Route path="/user-profile" element={<UserProfilePage />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/technical-dashboard" element={<TechnicalDashboard />} />
        <Route path="/candidates" element={<CandidatesPage />} /> 
        <Route path="/interviews" element={<InterviewPage />} />
        <Route path="/candidate-form" element={<CandidateForm />} />
        <Route path="/questions" element={<QuestionPage />} /> 
        <Route path="/add-question" element={<AddQuestionPage />} /> 
        <Route path="/edit-question/:id" element={<EditQuestionPage />} /> 
        <Route path="/interviews/upcoming" element={<UpcomingInterviewsPage />} />
        <Route path="/interviews/completed" element={<CompletedInterviewsPage />} />
        <Route path="/interviews/postponed" element={<PostponedInterviewsPage />} />
        <Route path="/interviews/cancelled" element={<CancelledInterviewsPage />} />
        <Route path="/video-screen" element={<VideoScreen />} />
        <Route path="/video-session" element={<VideoPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        
      </Routes>
    </Router>

  );
}

export default App;
