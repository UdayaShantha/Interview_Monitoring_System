import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

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
  const [positionType, setPositionType] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [faceRecognitionStarted, setFaceRecognitionStarted] = useState(false);
  const [faceRecognitionError, setFaceRecognitionError] = useState(null);
  const [isServiceReady, setIsServiceReady] = useState(false);
  const [serviceInitializing, setServiceInitializing] = useState(false);
  const [backendStreamActive, setBackendStreamActive] = useState(false);
  const videoFeedRef = useRef(null); // Reference for the video feed img element
  const maxRetries = 10;
  const retryDelay = 2000;

  // Axios instance for Python service
  const pythonServiceAxios = axios.create({
    baseURL: 'http://localhost:8001',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });

  // Fetch user data (position type, candidate ID, interview ID)
  useEffect(() => {
    const fetchUserData = async () => {
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

        // Fetch position type
        try {
          const positionResponse = await axios.get(`/users/hr/candidate/position/${userId}`);
          if (positionResponse.data && positionResponse.data.data) {
            setPositionType(positionResponse.data.data);
          }
        } catch (error) {
          console.error('Error fetching position type:', error);
          toast.warning('Could not determine position type');
        }

        setCandidateId(userId);
        console.log("Candidate ID set:", userId);

        // Fetch or set interview ID
        if (userId) {
          try {
            const interviewResponse = await axios.get(`http://localhost:9191/api/v1/interviews/get/interviewId/by/candidateId?candidateId=${userId}`);
            console.log("Interview ID response:", interviewResponse.data);
            if (interviewResponse.data && interviewResponse.data.data) {
              setInterviewId(interviewResponse.data.data);
              console.log("Interview ID set:", interviewResponse.data.data);
            } else {
              console.warn("No interview ID received, using candidateId instead");
              setInterviewId(userId);
            }
          } catch (error) {
            console.error('Error fetching interview ID:', error);
            toast.error('Failed to fetch interview ID, using candidate ID instead');
            setInterviewId(userId);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Initialize backend services and video stream
  useEffect(() => {
    if (!interviewId || serviceInitializing) return;

    const initializeBackendServices = async () => {
      setServiceInitializing(true);
      let retries = 0;

      toast.info("Initializing interview session...", {
        autoClose: false,
        toastId: "service-init"
      });

      const checkService = async () => {
        try {
          const response = await fetch('http://localhost:8001/health', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
          });
          if (response.ok) {
            console.log("Python service is ready!");
            return true;
          } else {
            console.warn(`Service not ready (status: ${response.status})`);
            return false;
          }
        } catch (error) {
          console.warn(`Service check failed: ${error.message}`);
          return false;
        }
      };

      const startBackendStreaming = async () => {
        try {
          console.log(`Starting backend streaming for interview ID: ${interviewId}`);
          const response = await fetch(
            `http://localhost:8001/load/model/face-recognition/${interviewId}?emotion_library=deepface&min_face_detection=0.5&min_face_presence=0.5&min_tracking=0.5`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Backend stream started successfully:", data);
            setBackendStreamActive(true);
            setFaceRecognitionStarted(true);
            setIsServiceReady(true);

            // Set video feed source
            if (videoFeedRef.current) {
              videoFeedRef.current.src = `http://localhost:8001/video_feed/${interviewId}`;
            }

            toast.success('Interview session ready');
            toast.dismiss("service-init");
            return true;
          } else {
            const errorData = await response.text();
            console.error("Backend stream error:", errorData);
            throw new Error(errorData);
          }
        } catch (error) {
          console.error('Failed to start backend stream:', error);
          throw error;
        }
      };

      const executeFlow = async () => {
        try {
          const serviceReady = await checkService();
          if (!serviceReady) {
            console.log("Service not ready yet, retrying...");
            return false;
          }
          await startBackendStreaming();
          return true;
        } catch (error) {
          console.error("Error in initialization flow:", error);
          return false;
        }
      };

      try {
        const success = await executeFlow();
        if (success) return;
      } catch (error) {
        console.error("Initial attempt failed:", error);
      }

      const intervalId = setInterval(async () => {
        if (retries >= maxRetries) {
          console.error("Maximum retries reached. Cannot initialize backend services.");
          toast.dismiss("service-init");
          toast.error("Failed to initialize interview session. Please refresh and try again.");
          setServiceInitializing(false);
          clearInterval(intervalId);
          return;
        }

        retries++;
        console.log(`Retry attempt ${retries}/${maxRetries}...`);

        try {
          const success = await executeFlow();
          if (success) {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error(`Retry ${retries} failed:`, error);
        }
      }, retryDelay);

      return () => clearInterval(intervalId);
    };

    initializeBackendServices();
  }, [interviewId, serviceInitializing]);

  // Heartbeat to check backend service status
  useEffect(() => {
    let heartbeatInterval;

    if (backendStreamActive && interviewId) {
      heartbeatInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:8001/monitoring/status/${interviewId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'error') {
              setFaceRecognitionError("Face recognition service encountered an error. Session will continue, but data may be limited.");
            }
          }
        } catch (error) {
          console.warn("Heartbeat check failed:", error.message);
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [backendStreamActive, interviewId]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!positionType) return;

      try {
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
  }, [positionType]);

  // Stop backend services
  const stopBackendServices = async () => {
    if (!interviewId || !backendStreamActive) return;

    try {
      console.log(`Stopping backend services for interview ID: ${interviewId}`);
      toast.info("Stopping interview session...");

      const response = await fetch(`http://localhost:8001/stop/monitoring/${interviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Backend services stopped successfully:", data);
        toast.success('Interview session ended');
      } else {
        const errorText = await response.text();
        console.warn("Error stopping backend services:", errorText);
        toast.warning('Backend services may not have stopped properly');
      }
    } catch (error) {
      console.error('Error stopping backend services:', error);
    } finally {
      setBackendStreamActive(false);
      setFaceRecognitionStarted(false);
      if (videoFeedRef.current) {
        videoFeedRef.current.src = ''; // Clear the video feed
      }
    }
  };

  // Security restrictions and fullscreen handling
  useEffect(() => {
    const blockEscapeKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Exiting fullscreen is not allowed during the interview');
        return false;
      }
    };

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
      if ((e.ctrlKey || e.metaKey) && ['t', 'T', 'w', 'W', 'n', 'N'].includes(e.key)) {
        e.preventDefault();
        toast.error('Shortcut disabled during interview');
      }
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
      if (!document.fullscreenElement && !sessionCompleted) {
        toast.error('Fullscreen mode is required until you reach the thank you page');
        enterFullscreen();
      }
    };

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

    const handlePopState = () => {
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

  const handleActionButton = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleNextQuestion();
      return;
    }
    if (!sessionCompleted) {
      await stopBackendServices(); // Moved streaming stop to "Complete Session"
      setSessionCompleted(true);
      toast.success('You have completed the interview session!');
    } else {
      setShowCompletionAlert(true);
    }
  };

  const handleEndSession = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      navigate('/feedback');
    } catch (err) {
      console.error('Error ending session:', err);
      navigate('/feedback');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backendStreamActive && interviewId && !sessionCompleted) {
        stopBackendServices();
      }
    };
  }, [backendStreamActive, interviewId, sessionCompleted]);

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

  const getActionButtonStyles = () => {
    return sessionCompleted
      ? "bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
      : "bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md";
  };

  const getActionButtonText = () => {
    if (currentQuestionIndex < questions.length - 1) return "Next Question";
    if (!sessionCompleted) return "Complete Session";
    return "End Session";
  };

  return (
    <div className="h-screen w-full bg-emerald-50 flex flex-col">
      {serviceInitializing && !isServiceReady && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Initializing Interview</h2>
              <p className="text-gray-600">Please wait while the interview system prepares your session...</p>
              <p className="text-gray-500 text-sm">This may take a moment as we connect to your camera.</p>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Fullscreen Required</h2>
              <p className="text-gray-600">This interview session requires fullscreen mode. Please click the button below to continue.</p>
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

      {faceRecognitionError && (
        <div className="fixed top-4 right-4 z-40 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
          <p className="font-bold">Interview System Error</p>
          <p className="text-sm">{faceRecognitionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Restart Session
          </button>
        </div>
      )}

      {showCompletionAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">End Interview Session?</h2>
              <p className="text-gray-600">You have completed all questions. Are you ready to end the session and proceed to feedback?</p>
              {tabSwitches > 0 && (
                <div className="text-yellow-600 text-sm">Note: You switched tabs {tabSwitches} times during this session</div>
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

      <header className="w-full bg-white shadow-sm py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-emerald-800">
              {positionType ? `${positionType} Interview` : 'Loading...'}
            </h1>
            <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500">
              <span className="font-semibold text-sm md:text-base">
                {sessionCompleted ? "Session Completed" : "Session in Progress"}
              </span>
            </div>
            {faceRecognitionStarted && (
              <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700">
                <span className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  AI Analysis Active
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-emerald-100 px-4 py-2 rounded-lg">
            <Clock size={18} className="text-emerald-700" />
            <span className="font-medium text-emerald-800">{formatTime(timer)}</span>
            {interviewId && (
              <span className="text-xs text-emerald-600 ml-2">ID: {interviewId}</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4">
        <div className="w-full max-w-2xl aspect-video rounded-xl bg-black overflow-hidden shadow-2xl">
          <img
            ref={videoFeedRef}
            alt="Video Feed"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-emerald-600 border-4 border-white shadow-xl flex items-center justify-center">
            <Mic size={24} className="text-white" />
          </div>
        </div>
      </main>

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
                    <span className="text-emerald-600 font-medium">{formatTime(questionTimer)}</span>
                  </div>
                </div>
                <p className="text-gray-800 font-medium mt-2">{questions[currentQuestionIndex]?.content}</p>
              </div>

              <button
                onClick={handleActionButton}
                className={getActionButtonStyles()}
                disabled={!isServiceReady}
              >
                {getActionButtonText()}
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </div>
        </footer>
      )}

      {sessionCompleted && (
        <footer className="w-full bg-white border-t border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-emerald-700 font-medium text-lg mb-2">Interview Session Completed</div>
                <p className="text-gray-600">You have answered all questions. Ready to proceed to the feedback page?</p>
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