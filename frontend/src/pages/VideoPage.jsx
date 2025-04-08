import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Video, Clock, ChevronRight, AlertCircle } from 'lucide-react';
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
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds between retries

  // Create a separate axios instance for the Python service to avoid CORS issues
  const pythonServiceAxios = axios.create({
    baseURL: 'http://localhost:8001',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });

  // Get position type and candidate ID from backend using user ID from token
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
        const positionResponse = await axios.get(`/users/hr/candidate/position/${userId}`);
        if (positionResponse.data && positionResponse.data.data) {
          setPositionType(positionResponse.data.data);
        }

        // Set candidate ID (assuming the decoded token contains it)
        setCandidateId(userId);
        console.log("Candidate ID set:", userId);
        
        // Map candidateId to interviewId
        if (userId) {
          try {
            // Try to fetch the interview ID from the API
            const interviewResponse = await axios.get(`http://localhost:9191/api/v1/interviews/get/interviewId/by/candidateId?candidateId=${userId}`);
            console.log("Interview ID response:", interviewResponse.data);
            
            if (interviewResponse.data && interviewResponse.data.interviewId) {
              setInterviewId(interviewResponse.data.interviewId);
              console.log("Interview ID set:", interviewResponse.data.interviewId);
            } else {
              // If no interview ID is returned, use the candidate ID
              console.warn("No interview ID received, using candidateId instead");
              setInterviewId(userId);
            }
          } catch (error) {
            console.error('Error fetching interview ID:', error);
            toast.error('Failed to fetch interview ID, using candidate ID instead');
            // Use the candidateId as the interviewId if API call fails
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

  // Check if the Python service is ready before initializing webcam
  useEffect(() => {
    if (!interviewId || serviceInitializing) return;

    const checkPythonService = async () => {
      setServiceInitializing(true);
      let retries = 0;
      
      // Show a toast when starting to check service
      toast.info("Checking if face recognition service is ready...");
      
      const checkService = async () => {
        try {
          const response = await fetch('http://localhost:8001/health', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            // Set a timeout to prevent hanging
            signal: AbortSignal.timeout(3000)
          });
          
          if (response.ok) {
            console.log("Python service is ready!");
            setIsServiceReady(true);
            toast.success("Face recognition service is ready");
            initializeWebcam();
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
      
      // First immediate check
      const isReady = await checkService();
      if (isReady) return;
      
      // If not ready, start polling
      toast.info("Waiting for face recognition service to initialize...", {
        autoClose: false,
        toastId: "waiting-service"
      });
      
      const intervalId = setInterval(async () => {
        if (retries >= maxRetries) {
          console.error("Max retries reached. Service may not be available.");
          toast.dismiss("waiting-service");
          toast.error("Face recognition service could not be reached. Using fallback mode.");
          setIsServiceReady(true); // Proceed anyway in fallback mode
          initializeWebcam();
          clearInterval(intervalId);
          return;
        }
        
        const result = await checkService();
        if (result) {
          toast.dismiss("waiting-service");
          clearInterval(intervalId);
        } else {
          retries++;
          console.log(`Retry attempt ${retries}/${maxRetries}...`);
        }
      }, retryDelay);
      
      // Clean up interval if component unmounts
      return () => clearInterval(intervalId);
    };
    
    checkPythonService();
  }, [interviewId, serviceInitializing]);

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

  // Initialize webcam and start face recognition
  const initializeWebcam = async () => {
    if (faceRecognitionStarted) return;
    
    try {
      console.log("Initializing webcam...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Webcam stream connected to video element");
      }

      console.log("Webcam initialized, now starting face recognition...");
      // Start face recognition only after webcam is ready
      startFaceRecognition();
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast.error('Failed to access webcam. Please ensure you have given camera permissions.');
    }
  };

  // Updated startFaceRecognition function with better retry and timeout handling
  const startFaceRecognition = async () => {
    if (!interviewId) {
      console.error("Cannot start face recognition: No interview ID available");
      setFaceRecognitionError("No interview ID available");
      return;
    }

    try {
      console.log(`Starting face recognition for interview ID: ${interviewId}`);
      toast.info("Starting face recognition...", { toastId: "starting-face" });
      
      // Create an AbortController for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(
          `http://localhost:8001/load/model/face-recognition/${interviewId}?emotion_library=deepface&min_face_detection=0.5&min_face_presence=0.5&min_tracking=0.5`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        toast.dismiss("starting-face");
        
        if (response.ok) {
          const data = await response.json();
          console.log("Face recognition started successfully:", data);
          setFaceRecognitionStarted(true);
          toast.success('Face recognition active');
        } else {
          // Try to get error details
          let errorMessage = "Unknown error";
          try {
            const errorData = await response.text();
            errorMessage = errorData;
            console.error("Face recognition error response:", errorData);
          } catch (e) {
            console.error("Could not read error details:", e);
          }
          
          setFaceRecognitionError(`Face recognition error: ${errorMessage}`);
          
          // Although there was an error, we'll still set recognition as started
          // to allow the interview to continue in "simulated mode"
          setFaceRecognitionStarted(true);
          toast.warning("Using simulated face recognition mode due to service error");
        }
      } catch (error) {
        clearTimeout(timeoutId);
        toast.dismiss("starting-face");
        
        console.error('Error connecting to face recognition service:', error);
        setFaceRecognitionError(`Connection error: ${error.message}`);
        
        // Use simulated mode when service is unreachable
        setFaceRecognitionStarted(true);
        toast.warning("Using simulated face recognition mode due to connection issues");
      }
    } catch (error) {
      console.error('Unexpected error in face recognition setup:', error);
      setFaceRecognitionError(`Unexpected error: ${error.message}`);
      setFaceRecognitionStarted(true); // Continue in simulated mode
    }
  };

  // Updated stopFaceRecognition function
  const stopFaceRecognition = async () => {
    if (!interviewId || !faceRecognitionStarted) return;

    try {
      console.log(`Stopping face recognition for interview ID: ${interviewId}`);
      toast.info("Stopping face recognition...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`http://localhost:8001/stop/face-recognition/${interviewId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Face recognition stopped successfully:", data);
          toast.success('Face recognition stopped');
        } else {
          const errorText = await response.text();
          console.warn("Error stopping face recognition:", errorText);
          toast.warning('Face recognition may not have stopped properly');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("Failed to communicate with face recognition service when stopping:", error.message);
        toast.warning("Could not confirm if face recognition was stopped properly");
      }
    } catch (error) {
      console.error('Error stopping face recognition:', error);
    } finally {
      // Always consider face recognition stopped from frontend perspective
      setFaceRecognitionStarted(false);
    }
  };

  // Stop webcam and face recognition
  const stopWebcamAndFaceRecognition = async () => {
    try {
      // Stop face recognition first
      await stopFaceRecognition();
      
      // Then stop webcam stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      console.log("Webcam and face recognition stopped");
    } catch (error) {
      console.error('Error cleaning up resources:', error);
    }
  };

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
      
      // Clean up video stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
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
      // First stop the webcam and face recognition
      await stopWebcamAndFaceRecognition();
      
      // Then exit fullscreen mode
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      // Navigate to feedback page
      navigate('/feedback');
    } catch (err) {
      console.error('Error ending session:', err);
      // Navigate anyway if there's an error
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
      {/* Service Initializing Message */}
      {serviceInitializing && !isServiceReady && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Initializing Service</h2>
              <p className="text-gray-600">
                Please wait while the face recognition service is initializing...
              </p>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Face Recognition Status */}
      {faceRecognitionError && (
        <div className="fixed top-4 right-4 z-40 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md">
          <p className="font-bold">Face Recognition Error</p>
          <p className="text-sm">{faceRecognitionError}</p>
          <button 
            onClick={startFaceRecognition}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
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
                  Face Recognition Active
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

      {/* Main Video Area */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        <div className="w-full max-w-2xl aspect-video rounded-xl bg-black overflow-hidden shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-emerald-600 border-4 border-white shadow-xl flex items-center justify-center">
            <Mic size={24} className="text-white" />
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