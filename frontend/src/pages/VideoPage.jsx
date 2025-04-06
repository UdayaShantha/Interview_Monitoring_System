import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Video, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

function VideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const savedIndex = localStorage.getItem('currentQuestionIndex');
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(() => {
    return localStorage.getItem('sessionCompleted') === 'true';
  });
  const [timer, setTimer] = useState(() => {
    const savedTimer = localStorage.getItem('interviewTimer');
    return savedTimer ? parseInt(savedTimer) : 0;
  });
  const [questionTimer, setQuestionTimer] = useState(() => {
    const savedQuestionTimer = localStorage.getItem('questionTimer');
    return savedQuestionTimer ? parseInt(savedQuestionTimer) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [positionType, setPositionType] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem('interviewStartTime');
    return savedStartTime ? parseInt(savedStartTime) : Date.now();
  });

  // Initialize session if not already started
  useEffect(() => {
    if (!localStorage.getItem('interviewStartTime')) {
      localStorage.setItem('interviewStartTime', Date.now().toString());
      setSessionStartTime(Date.now());
    }
  }, []);

  // Get position type from backend using user ID from token
  useEffect(() => {
    const fetchPositionType = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          toast.error('No authentication token found');
          navigate('/login');
          return;
        }

        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.userId;

        if (!userId) {
          toast.error('User ID not found in token');
          navigate('/login');
          return;
        }

        const response = await axios.get(`/users/hr/candidate/position/${userId}`);
        if (response.data && response.data.data) {
          setPositionType(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching position type:', error);
        toast.error('Failed to fetch position type');
      }
    };

    fetchPositionType();
  }, [navigate]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!positionType) return;

      try {
        const response = await axios.get(`/questions/get/interview/questions?positionType=${positionType}`);
        if (response.data.data) {
          setQuestions(response.data.data);
          // Only set question timer if it's not already set in localStorage
          if (!localStorage.getItem('questionTimer')) {
            const initialTimer = response.data.data[0]?.duration * 60 || 0;
            setQuestionTimer(initialTimer);
            localStorage.setItem('questionTimer', initialTimer.toString());
          }
        }
      } catch (error) {
        toast.error('Failed to load questions');
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [positionType]);

  // Block navigation attempts
  useEffect(() => {
    if (sessionCompleted) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handleBackButton);

    const unloadCallback = (e) => {
      if (!sessionCompleted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', unloadCallback);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      window.removeEventListener('beforeunload', unloadCallback);
    };
  }, [sessionCompleted]);

  // Timer effects
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
      setTimer(elapsedSeconds);
      localStorage.setItem('interviewTimer', elapsedSeconds.toString());

      setQuestionTimer((prev) => {
        const newTimer = prev - 1;
        localStorage.setItem('questionTimer', newTimer.toString());
        if (newTimer <= 0) {
          handleNextQuestion();
          return questions[currentQuestionIndex + 1]?.duration * 60 || 0;
        }
        return newTimer;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, questions, sessionStartTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setSessionCompleted(true);
      localStorage.setItem('sessionCompleted', 'true');
      // Clear timer data when session is completed
      localStorage.removeItem('interviewTimer');
      localStorage.removeItem('interviewStartTime');
      localStorage.removeItem('questionTimer');
      localStorage.removeItem('currentQuestionIndex');
    } else {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      localStorage.setItem('currentQuestionIndex', nextIndex.toString());
      const nextQuestionTimer = questions[nextIndex]?.duration * 60 || 0;
      setQuestionTimer(nextQuestionTimer);
      localStorage.setItem('questionTimer', nextQuestionTimer.toString());
    }
  };

  const handleForceExit = () => {
    if (sessionCompleted) {
      // Clear timer data when exiting
      localStorage.removeItem('interviewTimer');
      localStorage.removeItem('interviewStartTime');
      localStorage.removeItem('questionTimer');
      localStorage.removeItem('currentQuestionIndex');
      localStorage.removeItem('sessionCompleted');
      navigate('/feedback');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-emerald-50 flex items-center justify-center">
        <div className="text-2xl text-emerald-600">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen w-full bg-emerald-50 flex items-center justify-center">
        <div className="text-2xl text-red-600">No questions available</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-emerald-50 flex flex-col">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">End Session?</h2>
              <p className="text-gray-600">
                {sessionCompleted 
                  ? "You've completed all questions. You can now safely end the session."
                  : "Completing all questions is required before ending the session!"}
              </p>
              <div className="flex gap-4 w-full mt-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForceExit}
                  className={`flex-1 px-6 py-2.5 rounded-xl transition-colors ${
                    sessionCompleted 
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!sessionCompleted}
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-emerald-800">
              {positionType ? `${positionType} Interview` : 'Loading...'}
            </h1>
            <button 
              onClick={() => setShowExitConfirm(true)}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                sessionCompleted 
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!sessionCompleted}
            >
              <span className="font-semibold text-sm md:text-base">
                {sessionCompleted ? "End Session" : "Session Locked"}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-100 px-4 py-2 rounded-lg">
            <Clock size={18} className="text-emerald-700" />
            <span className="font-medium text-emerald-800">{formatTime(timer)}</span>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
          <Mic size={64} className="text-white opacity-80" />
        </div>

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-300 border-4 border-white shadow-xl flex items-center justify-center">
            <Video size={24} className="text-gray-500" />
          </div>
        </div>
      </main>

      {/* Question Section */}
      <footer className="w-full bg-white border-t border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  <span className="text-emerald-600 font-medium">
                    {formatTime(questionTimer)}
                  </span>
                </div>
                <p className="text-gray-800 font-medium">
                  {questions[currentQuestionIndex]?.content}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
            >
              {currentQuestionIndex === questions.length - 1 ? "Complete Session" : "Next Question"}
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VideoPage;