import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Video, Clock, ChevronRight, AlertCircle } from 'lucide-react';

function VideoPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const totalQuestions = 5;
  const [timer, setTimer] = useState(0);

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

  // Sample questions
  const questions = [
    "Tell me about yourself and your experience.",
    "What's your greatest professional achievement?",
    "How do you handle pressure or stressful situations?",
    "Describe a time you disagreed with a team decision.",
    "Where do you see yourself in 5 years?"
  ];

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestion === totalQuestions) {
      setSessionCompleted(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleForceExit = () => {
    if (sessionCompleted) {
        navigate('/feedback'); 
      }
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
        <div className="max-w-6xl mx-auto flex justify-between items-center">
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
                  Question {currentQuestion}/{totalQuestions}
                </span>
                <p className="text-gray-800 font-medium">
                  {questions[currentQuestion - 1]}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
            >
              {currentQuestion === totalQuestions ? "Complete Session" : "Next Question"}
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VideoPage;