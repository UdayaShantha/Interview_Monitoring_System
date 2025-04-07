import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Video, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';

function VideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const positionType = location.state?.positionType || 'SOFTWARE_ENGINEER';
        const response = await axios.get(`/questions/get/interview/questions?positionType=${positionType}`);
        if (response.data.data) {
          setQuestions(response.data.data);
          setQuestionTimer(response.data.data[0]?.duration * 60 || 0);
        }
      } catch (error) {
        toast.error('Failed to load questions');
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [location.state]);

  // Security restrictions and fullscreen handling
  useEffect(() => {
    // Completely block Escape key at the document level
    const blockEscapeKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Exiting fullscreen is not allowed during the interview');
        return false;
      }
    };

    // Add event listener to document to capture Escape key before it triggers fullscreen exit
    document.addEventListener('keydown', blockEscapeKey, true);
    
    const enterFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.error('Fullscreen failed:', error);
          toast.error('Fullscreen mode is required for this interview');
        }
      }
    };

    const handleKeyDown = (e) => {
      // Block common shortcut keys
      if ((e.ctrlKey || e.metaKey) && ['t', 'T', 'w', 'W', 'n', 'N'].includes(e.key)) {
        e.preventDefault();
        toast.error('Shortcut disabled during interview');
      }
      
      // Block F11 and F12 keys
      if (['F11', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error('Right click disabled during interview');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        toast.error('Please return to interview tab!');
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // If user exited fullscreen, force back to fullscreen
      if (!document.fullscreenElement && !sessionCompleted) {
        toast.error('Fullscreen mode is required until you reach the thank you page');
        // Try to re-enter fullscreen immediately
        enterFullscreen();
      }
    };

    // Initial setup
    enterFullscreen();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', blockEscapeKey, true);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [sessionCompleted]);

  // Navigation blocking
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      window.history.pushState(null, null, window.location.href);
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
      setQuestionTimer(prev => {
        if (prev <= 0) {
          handleNextQuestion();
          return questions[currentQuestionIndex + 1]?.duration * 60 || 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, questions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setSessionCompleted(true);
      toast.success('You have completed the interview session!');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionTimer(questions[currentQuestionIndex + 1]?.duration * 60 || 0);
    }
  };

  const handleActionButton = () => {
    // Regular next question logic for non-final questions
    if (currentQuestionIndex < questions.length - 1) {
      handleNextQuestion();
      return;
    }
    
    // For the final question
    if (!sessionCompleted) {
      // First click on final question marks session as completed
      setSessionCompleted(true);
      toast.success('You have completed the interview session!');
    } else {
      // Second click (after completion) shows the completion alert
      setShowCompletionAlert(true);
    }
  };

  const handleEndSession = async () => {
    try {
      // Automatically exit fullscreen mode
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      // Navigate to feedback page after exiting fullscreen
      navigate('/feedback');
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
      // Navigate anyway if fullscreen exit fails
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

  // Determine button text and style based on current state
  const getActionButtonStyles = () => {
    if (sessionCompleted) {
      return "bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md";
    }
    return "bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md";
  };

  // Determine button text based on current state
  const getActionButtonText = () => {
    if (currentQuestionIndex < questions.length - 1) {
      return "Next Question";
    }
    if (!sessionCompleted) {
      return "Complete Session";
    }
    return "End Session";
  };

  return (
    <div className="h-screen w-full bg-emerald-50 flex flex-col">
      {/* Fullscreen Warning */}
      {!isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Fullscreen Required</h2>
              <p className="text-gray-600">
                This interview session requires fullscreen mode. Please click the button below to continue.
              </p>
              <button
                onClick={() => document.documentElement.requestFullscreen()}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion Alert Modal */}
      {showCompletionAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">End Interview Session?</h2>
              <p className="text-gray-600">
                You have completed all questions. Are you ready to end the session and proceed to feedback?
              </p>
              {tabSwitches > 0 && (
                <div className="text-yellow-600 text-sm">
                  Note: You switched tabs {tabSwitches} times during this session
                </div>
              )}
              <div className="flex gap-4 w-full mt-4">
                <button
                  onClick={() => setShowCompletionAlert(false)}
                  className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
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
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500">
            <span className="font-semibold text-sm md:text-base">
              {sessionCompleted ? "Session Completed" : "Session in Progress"}
            </span>
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

      {/* Question Section - Hide when session is completed */}
      {!sessionCompleted && (
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
                </div>
                <p className="text-gray-800 font-medium mt-2">
                  {questions[currentQuestionIndex]?.content}
                </p>
              </div>
              
              <button
                onClick={handleActionButton}
                className={getActionButtonStyles()}
              >
                {getActionButtonText()}
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Alternative Footer when Session is Completed */}
      {sessionCompleted && (
        <footer className="w-full bg-white border-t border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-emerald-700 font-medium text-lg mb-2">
                  Interview Session Completed
                </div>
                <p className="text-gray-600">
                  You have answered all questions. Ready to proceed to the feedback page?
                </p>
              </div>
              
              <button
                onClick={() => setShowCompletionAlert(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md mt-4 md:mt-0"
              >
                End Session
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default VideoPage;