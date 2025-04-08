import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Video, Clock, ChevronRight, AlertCircle, Square, Circle } from 'lucide-react';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

function VideoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [showNextQuestionWarning, setShowNextQuestionWarning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [positionType, setPositionType] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);

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

        const response = await axiosInstance.get(`/users/hr/candidate/position/${userId}`);
        if (response.data && response.data.data) {
          setPositionType(response.data.data);
        }
        
        // Fetch interview ID using the candidate ID
        const interviewResponse = await axiosInstance.get(`/interviews/get/interview-id/${userId}`);
        if (interviewResponse.data && interviewResponse.data.data) {
          setInterviewId(interviewResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching position type or interview ID:', error);
        toast.error('Failed to fetch required data');
      }
    };

    fetchPositionType();
  }, [navigate]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!positionType) return;

      try {
        const response = await axiosInstance.get(`/questions/get/interview/questions?positionType=${positionType}`);
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

  // Initialize audio recording
  useEffect(() => {
    const initializeAudioRecording = async () => {
      try {
        // First check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        // Request audio stream with specific settings for better quality
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
            channelCount: 1
          } 
        });
        
        console.log('Audio stream obtained:', stream.getAudioTracks()[0].label);
        audioStreamRef.current = stream;

        // Check for MediaRecorder support
        if (!window.MediaRecorder) {
          throw new Error('MediaRecorder is not supported in this browser');
        }
        
        // Try to use MP3 format since it's widely supported
        const mediaRecorder = new MediaRecorder(stream, {
          audioBitsPerSecond: 128000
        });
        
        mediaRecorderRef.current = mediaRecorder;
        
        // Set up event handlers
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log('Received audio chunk of size:', event.data.size);
            setAudioChunks(prev => [...prev, event.data]);
          }
        };
        
        mediaRecorderRef.current.onerror = (event) => {
          console.error('MediaRecorder error:', event.error);
          toast.error('Recording error: ' + event.error.message);
        };
        
        mediaRecorderRef.current.onstop = () => {
          console.log('MediaRecorder stopped');
          setIsRecording(false);
        };
        
        console.log('MediaRecorder initialized successfully');
        
      } catch (error) {
        console.error('Error initializing audio recording:', error);
        toast.error('Failed to initialize audio recording: ' + error.message);
      }
    };

    initializeAudioRecording();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (!mediaRecorderRef.current) {
      toast.error('Recording not initialized. Please refresh the page.');
      return;
    }

    try {
      if (mediaRecorderRef.current.state === 'recording') {
        stopRecording();
        // Wait a bit before starting new recording
        setTimeout(() => {
          setAudioChunks([]);
          mediaRecorderRef.current.start();
          setIsRecording(true);
          toast.info('Recording started');
        }, 100);
      } else {
        setAudioChunks([]);
        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast.info('Recording started');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('Attempting to stop recording');
    if (!mediaRecorderRef.current) {
      console.error('MediaRecorder not initialized');
      return;
    }

    try {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.info('Recording stopped');
        console.log('Recording stopped successfully');
      } else {
        console.log('MediaRecorder not in recording state:', mediaRecorderRef.current.state);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording: ' + error.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = async () => {
    try {
      // Stop current recording if active
      if (isRecording) {
        stopRecording();
        // Add a small delay to ensure recording is properly stopped
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get the current question data
      const currentQuestion = questions[currentQuestionIndex];
      
      // Create audio blob from chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      
      // Create form data for audio upload
      const formData = new FormData();
      formData.append('interview_id', interviewId);
      formData.append('question_id', currentQuestion.questionId);
      formData.append('audio_file', audioBlob, `answer_${interviewId}_${currentQuestion.questionId}.mp3`);

      // Log the data being sent
      console.log('Sending data:', {
        interview_id: interviewId,
        question_id: currentQuestion.questionId,
        audio_file: `answer_${interviewId}_${currentQuestion.questionId}.mp3`
      });

      try {
        // Send audio file to backend
        const transcribeResponse = await axios.post('http://localhost:8000/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Transcription response:', transcribeResponse.data);
        toast.success('Answer recorded successfully');
      } catch (transcribeError) {
        console.error('Transcription error:', transcribeError.response?.data || transcribeError);
        toast.error('Failed to send audio recording. Please try again.');
      }
      
      // Clear audio chunks for next question
      setAudioChunks([]);
      
      // Proceed with the original logic
      if (currentQuestionIndex === questions.length - 1) {
        setSessionCompleted(true);
        toast.success('You have completed the interview session!');
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionTimer(questions[currentQuestionIndex + 1]?.duration * 60 || 0);
      }
    } catch (error) {
      console.error('Error processing question data:', error);
      toast.error('Failed to process question data');
      
      // Still proceed with the original logic even if the API call fails
      if (currentQuestionIndex === questions.length - 1) {
        setSessionCompleted(true);
        toast.success('You have completed the interview session!');
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionTimer(questions[currentQuestionIndex + 1]?.duration * 60 || 0);
      }
    }
  };

  const handleActionButton = async () => {
    // Regular next question logic for non-final questions
    if (currentQuestionIndex < questions.length - 1) {
      setShowNextQuestionWarning(true);
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

  const handleConfirmNextQuestion = async () => {
    setShowNextQuestionWarning(false);
    await handleNextQuestion();
  };

  const handleEndSession = async () => {
    try {
      // Update interview duration in the backend
      if (interviewId) {
        // Convert seconds to minutes (round up to nearest minute)
        const durationInMinutes = Math.ceil(timer / 60);
        await axiosInstance.put(`/interviews/update/interview/duration?interviewId=${interviewId}&duration=${durationInMinutes}`);
        console.log('Interview duration updated successfully');
      } else {
        console.error('Interview ID not found, could not update duration');
      }
      
      // Automatically exit fullscreen mode
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      // Navigate to feedback page after exiting fullscreen
      navigate('/feedback');
    } catch (err) {
      console.error('Error updating interview duration or exiting fullscreen:', err);
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

      {/* Next Question Warning Modal */}
      {showNextQuestionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-emerald-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Proceed to Next Question?</h2>
              <p className="text-gray-600">
                You cannot return to this question once you proceed. Are you sure you want to continue?
              </p>
              <div className="flex gap-4 w-full mt-4">
                <button
                  onClick={() => setShowNextQuestionWarning(false)}
                  className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmNextQuestion}
                  className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Continue
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
          </div>
          
          <div className="flex items-center gap-3 bg-emerald-100 px-4 py-2 rounded-lg">
            <Clock size={18} className="text-emerald-700" />
            <span className="font-medium text-emerald-800">{formatTime(timer)}</span>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        {/* Removed the giant green gradient circle */}

        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-300 border-4 border-white shadow-xl flex items-center justify-center">
            <Video size={24} className="text-gray-500" />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-6 rounded-full shadow-lg transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isRecording ? (
              <Square size={32} className="text-white" />
            ) : (
              <Circle size={32} className="text-white" />
            )}
          </button>
          {isRecording && (
            <div className="bg-red-100 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Recording</span>
            </div>
          )}
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