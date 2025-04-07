import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft, Play, CheckCircle, AlertCircle, Video, XCircle, Radio, Waves, Volume2, Sun, Headphones, User } from 'lucide-react';

function VideoScreen() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [mediaStates, setMediaStates] = useState({
    camera: { 
      active: false, 
      error: null, 
      stream: null, 
      deviceName: null, 
      success: false, 
      tested: false 
    },
    microphone: { 
      active: false, 
      error: null, 
      stream: null, 
      deviceName: null, 
      success: false, 
      tested: false 
    }
  });
  
  const [notification, setNotification] = useState({ type: null, message: null, visible: false });
  const [deviceOptions, setDeviceOptions] = useState({ cameras: [], microphones: [] });
  const [selectedDevices, setSelectedDevices] = useState({ camera: null, microphone: null });
  const [audioLevel, setAudioLevel] = useState(0);
  const [showSuccess, setShowSuccess] = useState({ camera: false, microphone: false });
  const [showPrepModal, setShowPrepModal] = useState(false);

  // Video element initialization
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('playsinline', 'true');
    }
    
    // Enumerate available devices when component mounts
    enumerateDevices();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load video stream into video element when available
  useEffect(() => {
    if (mediaStates.camera.stream && videoRef.current) {
      videoRef.current.srcObject = mediaStates.camera.stream;
      
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
          handleMediaError('camera', err);
        });
      };
    }
  }, [mediaStates.camera.stream]);

  // Handle success message timeouts
  useEffect(() => {
    if (showSuccess.camera) {
      const timer = setTimeout(() => {
        setShowSuccess(prev => ({ ...prev, camera: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess.camera]);

  useEffect(() => {
    if (showSuccess.microphone) {
      const timer = setTimeout(() => {
        setShowSuccess(prev => ({ ...prev, microphone: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess.microphone]);

  const enumerateDevices = async () => {
    try {
      // Request permission to access media devices which helps get proper labels
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          // Stop all tracks immediately after getting labels
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.warn("Initial permission request failed, continuing with enumeration", err);
        });

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({ 
          id: device.deviceId, 
          label: device.label || `Camera ${index + 1}` 
        }));
      
      const microphones = devices
        .filter(device => device.kind === 'audioinput')
        .map((device, index) => ({ 
          id: device.deviceId, 
          label: device.label || `Microphone ${index + 1}` 
        }));
      
      setDeviceOptions({ cameras, microphones });
      
      // Set defaults
      if (cameras.length > 0 && !selectedDevices.camera) {
        setSelectedDevices(prev => ({ ...prev, camera: cameras[0].id }));
      }
      
      if (microphones.length > 0 && !selectedDevices.microphone) {
        setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].id }));
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
      showNotification('error', 'Failed to detect media devices');
    }
  };

  const stopAllMedia = () => {
    Object.values(mediaStates).forEach(state => {
      if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
      }
    });
  };

  const showNotification = (type, message, duration = 4000) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  const checkMedia = async (type) => {
    try {
      const mediaType = type === 'camera' ? 'video' : 'audio';
      const deviceConstraint = {};
      
      if (type === 'camera' && selectedDevices.camera) {
        deviceConstraint.deviceId = { exact: selectedDevices.camera };
      } else if (type === 'microphone' && selectedDevices.microphone) {
        deviceConstraint.deviceId = { exact: selectedDevices.microphone };
      }
      
      const constraints = { 
        [mediaType]: type === 'camera' 
          ? { ...deviceConstraint, facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
          : deviceConstraint
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(err => {
          throw new Error(`Failed to access ${type}: ${err.message}`);
        });

      // Find the device name
      const tracks = type === 'camera' ? stream.getVideoTracks() : stream.getAudioTracks();
      const deviceName = tracks.length > 0 ? tracks[0].label : null;

      if (type === 'camera') {
        if (!stream.getVideoTracks().length) {
          throw new Error('No video tracks found in camera stream');
        }

        setMediaStates(prev => ({
          ...prev,
          camera: { 
            active: true, 
            error: null, 
            stream, 
            deviceName, 
            success: true,
            tested: true
          }
        }));
        
        setShowSuccess({ ...showSuccess, camera: true });
        showNotification('success', `Camera working: ${deviceName || 'Webcam'}`);
      }

      if (type === 'microphone') {
        if (!stream.getAudioTracks().length) {
          throw new Error('No audio tracks found in microphone stream');
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        audioAnalyserRef.current = analyser;
        
        setMediaStates(prev => ({
          ...prev,
          microphone: { 
            active: true, 
            error: null, 
            stream, 
            deviceName, 
            success: true,
            tested: true
          }
        }));
        
        setShowSuccess({ ...showSuccess, microphone: true });
        visualizeAudio();
        showNotification('success', `Microphone working: ${deviceName || 'Mic'}`);
      }

    } catch (error) {
      handleMediaError(type, error);
    }
  };

  const visualizeAudio = () => {
    const analyser = audioAnalyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    analyser.fftSize = 2048;
    
    const drawWaveform = () => {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
      analyser.getByteTimeDomainData(dataArray);

      // Calculate audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = Math.abs(dataArray[i] / 128.0 - 1);
        sum += amplitude;
      }
      const avgAmplitude = sum / bufferLength;
      setAudioLevel(avgAmplitude * 5); // Scale for better visualization

      ctx.fillStyle = 'rgba(240, 253, 250, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0d9488';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height/2);
      ctx.stroke();
    };

    drawWaveform();
  };

  const handleMediaError = (type, error) => {
    console.error(`Media error (${type}):`, error);
    let errorMessage = error.message;
    
    if (error.name === 'NotAllowedError') {
      errorMessage = `Permission denied for ${type}. Please allow access in browser settings.`;
    } else if (error.name === 'NotFoundError') {
      errorMessage = `No ${type} device found. Please connect a ${type}.`;
    } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
      errorMessage = `${type} is already in use by another application. Please close other applications and try again.`;
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = `The requested ${type} settings are not supported by your device.`;
    }

    setMediaStates(prev => ({
      ...prev,
      [type]: { 
        ...prev[type], 
        active: false, 
        error: errorMessage, 
        success: false,
        tested: true 
      }
    }));
    
    showNotification('error', errorMessage);
  };

  const stopMedia = (type) => {
    const stream = mediaStates[type].stream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setMediaStates(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          active: false, 
          error: null, 
          stream: null,
          // Keep tested state, success state and deviceName
          tested: prev[type].tested,
          success: prev[type].success,
          deviceName: prev[type].deviceName
        }
      }));
  
      if (type === 'camera' && videoRef.current) {
        videoRef.current.srcObject = null;
      }
  
      if (type === 'microphone') {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setAudioLevel(0);
      }
      
      showNotification('info', `${type === 'camera' ? 'Camera' : 'Microphone'} test stopped`);
    }
  };
  
  const handleDeviceChange = (type, deviceId) => {
    setSelectedDevices(prev => ({ ...prev, [type]: deviceId }));
    
    // If device is active, restart with new device
    if (mediaStates[type].active) {
      stopMedia(type);
      setTimeout(() => checkMedia(type), 300);
    }
  };

  const getStatusText = (type) => {
    const state = mediaStates[type];
    if (!state.tested) {
      return 'Not Tested';
    }
    if (state.error) {
      return 'Test Failed';
    }
    if (state.active && state.success) {
      return 'Active';
    }
    if (state.tested && state.success) {
      return '';
    }
    return 'Unknown Status';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-cyan-50 relative flex flex-col overflow-hidden">
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-md flex items-center gap-3 transition-all ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 
          notification.type === 'error' ? 'bg-rose-600 text-white' : 
          'bg-cyan-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Radio className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Device Configuration
            </h1>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="relative bg-white rounded-2xl p-6 border-2 border-emerald-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Video className="w-8 h-8 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-800">Camera Test</h2>
                {mediaStates.camera.active && mediaStates.camera.success && (
                  <div className="ml-auto bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-600 font-medium">Live</span>
                  </div>
                )}
                {mediaStates.camera.error && (
                  <AlertCircle className="ml-auto w-6 h-6 text-rose-600 animate-pulse" />
                )}
              </div>
              
              {deviceOptions.cameras.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Select Camera</label>
                  <select 
                    value={selectedDevices.camera || ''}
                    onChange={(e) => handleDeviceChange('camera', e.target.value)}
                    className="w-full bg-white border-2 border-emerald-100 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  >
                    {deviceOptions.cameras.map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-50 relative">
                {mediaStates.camera.active ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />
                    
                    {showSuccess.camera && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 animate-fadeIn">
                        <div className="bg-emerald-600 rounded-lg p-4 flex items-center gap-3 shadow-md">
                          <CheckCircle className="w-6 h-6 text-white" />
                          <div>
                            <p className="text-white font-medium text-sm">Camera verified</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xs text-emerald-600 flex items-center gap-2 border border-emerald-100">
                      <CheckCircle className="w-3 h-3" />
                      <span>Connected</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Video className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 text-sm">
                        {mediaStates.camera.error || "Camera preview will appear here"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!mediaStates.camera.active ? (
                  <button
                    onClick={() => checkMedia('camera')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <Radio className="w-4 h-4" />
                    <span className="text-sm">Start Test</span>
                  </button>
                 ) : (
                  <button
                    onClick={() => stopMedia('camera')}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Stop Test</span>
                  </button>
                )}
              </div>
            </div>

            {/* Microphone Section */}
            <div className="relative bg-white rounded-2xl p-6 border-2 border-emerald-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Mic className="w-8 h-8 text-cyan-600" />
                <h2 className="text-xl font-semibold text-gray-800">Microphone Test</h2>
                {mediaStates.microphone.active && mediaStates.microphone.success && (
                  <div className="ml-auto bg-cyan-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-600 font-medium">Live</span>
                  </div>
                )}
                {mediaStates.microphone.error && (
                  <AlertCircle className="ml-auto w-6 h-6 text-rose-600 animate-pulse" />
                )}
              </div>

              {deviceOptions.microphones.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Select Microphone</label>
                  <select 
                    value={selectedDevices.microphone || ''}
                    onChange={(e) => handleDeviceChange('microphone', e.target.value)}
                    className="w-full bg-white border-2 border-emerald-100 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                  >
                    {deviceOptions.microphones.map(mic => (
                      <option key={mic.id} value={mic.id}>
                        {mic.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-50 relative">
                <canvas ref={canvasRef} className="w-full h-full" />
                
                {mediaStates.microphone.active ? (
                  <>
                    {showSuccess.microphone && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 animate-fadeIn">
                        <div className="bg-cyan-600 rounded-lg p-4 flex items-center gap-3 shadow-md">
                          <CheckCircle className="w-6 h-6 text-white" />
                          <div>
                            <p className="text-white font-medium text-sm">Microphone verified</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xs text-cyan-600 flex items-center gap-2 border border-cyan-100">
                      <CheckCircle className="w-3 h-3" />
                      <span>Connected</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Waves className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 text-sm">
                        {mediaStates.microphone.error || "Audio visualization will appear here"}
                      </p>
                    </div>
                  </div>
                )}
                
                {mediaStates.microphone.active && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <Volume2 className={`w-4 h-4 ${audioLevel > 0.5 ? 'text-cyan-600' : 'text-gray-400'}`} />
                    <div className="flex-1 h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-600 transition-all duration-100"
                        style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!mediaStates.microphone.active ? (
                  <button
                    onClick={() => checkMedia('microphone')}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <Radio className="w-4 h-4" />
                    <span className="text-sm">Start Test</span>
                  </button>
                ) : (
                  <button
                    onClick={() => stopMedia('microphone')}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Stop Test</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 p-6 bg-white rounded-xl border-2 border-emerald-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Device Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className={`p-2 rounded-md ${
                  mediaStates.camera.success ? 'bg-emerald-600' : 'bg-gray-200'
                }`}>
                  {mediaStates.camera.success ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Video className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Camera</p>
                  <p className={`text-sm font-medium ${
                    mediaStates.camera.success ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {mediaStates.camera.deviceName || 'Not tested'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className={`p-2 rounded-md ${
                  mediaStates.microphone.success ? 'bg-cyan-600' : 'bg-gray-200'
                }`}>
                  {mediaStates.microphone.success ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Microphone</p>
                  <p className={`text-sm font-medium ${
                    mediaStates.microphone.success ? 'text-cyan-600' : 'text-gray-500'
                  }`}>
                    {mediaStates.microphone.deviceName || 'Not tested'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Session Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={() => {
            if (!(mediaStates.camera.tested && mediaStates.camera.success) || 
                !(mediaStates.microphone.tested && mediaStates.microphone.success)) {
              showNotification('error', 'Please complete both camera and microphone tests first');
            } else {
              setShowPrepModal(true);
            }
          }}
          className={`px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl shadow-lg flex items-center gap-2 transition-all ${
            (!(mediaStates.camera.tested && mediaStates.camera.success) || 
             !(mediaStates.microphone.tested && mediaStates.microphone.success)) ? 
            'opacity-50 cursor-not-allowed' : 
            'hover:from-emerald-700 hover:to-cyan-700 hover:shadow-xl hover:scale-105'
          }`}
        >
          <Play className="w-5 h-5" />
          <span className="font-medium">Start Session</span>
        </button>
      </div>

      {/* Interview Preparation Modal */}
      {showPrepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-emerald-100">
            <div className="flex flex-col space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Preparation</h2>
                <p className="text-gray-600">Please ensure you're ready for the interview by following these guidelines:</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sun className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Good Lighting</h3>
                    <p className="text-gray-600">Find a well-lit area with natural or bright artificial lighting. Avoid backlighting and ensure your face is clearly visible.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Headphones className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Quiet Environment</h3>
                    <p className="text-gray-600">Choose a quiet location with minimal background noise. Close windows and doors to reduce external sounds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Professional Setup</h3>
                    <p className="text-gray-600">Position yourself in a professional setting. Ensure your background is clean and appropriate for an interview.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Important: Fullscreen Mode Required</h3>
                    <p className="text-gray-600">The interview must be conducted in fullscreen mode. If you accidentally exit fullscreen mode:</p>
                    <ul className="list-disc ml-4 mt-2 text-gray-600 space-y-1">
                      <li>Your audio and video will not be recorded</li>
                      <li>You must return to fullscreen mode to continue the interview</li>
                      <li>Do not attempt to exit fullscreen mode during the interview</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowPrepModal(false)}
                  className="flex-1 px-6 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    setShowPrepModal(false);
                    navigate('/video-session');
                  }}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-colors"
                >
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoScreen;