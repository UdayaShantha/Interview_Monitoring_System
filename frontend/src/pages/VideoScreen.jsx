import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft, Play, CheckCircle, AlertCircle, Video, XCircle, Radio, Waves, Volume2 } from 'lucide-react';

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

      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22d3ee';
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
    <div className="min-h-screen w-full bg-slate-900 relative flex flex-col overflow-hidden">
      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 transition-all ${
          notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 
          notification.type === 'error' ? 'bg-rose-500/90 text-white' : 
          'bg-blue-500/90 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Radio className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_50%)] z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)] z-0"></div>
      
      {/* Main Content */}
      <main className="flex-1 z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Device Setup
            </h1>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Video className="w-8 h-8 text-emerald-400" />
                <h2 className="text-xl font-semibold text-slate-100">Camera Test</h2>
                {mediaStates.camera.active && mediaStates.camera.success && (
                  <div className="ml-auto bg-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                )}
                {mediaStates.camera.error && (
                  <AlertCircle className="ml-auto w-6 h-6 text-rose-400 animate-pulse" />
                )}
              </div>
              
              {deviceOptions.cameras.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Select Camera</label>
                  <select 
                    value={selectedDevices.camera || ''}
                    onChange={(e) => handleDeviceChange('camera', e.target.value)}
                    className="w-full bg-slate-700/40 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {deviceOptions.cameras.map(camera => (
                      <option key={camera.id} value={camera.id}>
                        {camera.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                {mediaStates.camera.active ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />
                    
                    {/* Floating success message */}
                    {showSuccess.camera && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 animate-fadeIn">
                        <div className="bg-emerald-500/90 rounded-xl p-6 flex items-center gap-4 shadow-lg animate-scaleIn">
                          <CheckCircle className="w-8 h-8 text-white" />
                          <div>
                            <p className="text-white font-medium">Camera is working properly!</p>
                            <p className="text-emerald-100 text-sm">Video stream detected</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Camera working properly</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Video className="w-12 h-12 text-slate-500 mx-auto" />
                      <p className="text-slate-400">
                        {mediaStates.camera.error || "Camera preview will appear here"}
                      </p>
                      {mediaStates.camera.tested && !mediaStates.camera.success && !mediaStates.camera.error && (
                        <div className="px-4 py-2 bg-amber-500/20 rounded-lg mt-2">
                          <p className="text-amber-400 text-sm">Camera test completed but no stream was detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center gap-4">
                {!mediaStates.camera.active ? (
                  <button
                    onClick={() => checkMedia('camera')}
                    className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-xl text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-all"
                    disabled={mediaStates.camera.error?.includes('Permission')}
                  >
                    <Radio className="w-5 h-5" />
                    <span>Start Camera Test</span>
                  </button>
                 ) : (
                  !mediaStates.microphone.active && (
                  <button
                    onClick={() => stopMedia('camera')}
                    className="px-6 py-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 rounded-xl text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-all"
                    disabled={mediaStates.microphone.error?.includes('Permission')}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Stop Camera Test</span>
                  </button>
                  )
                )}
              </div>
            </div>

            {/* Microphone Section */}
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Mic className="w-8 h-8 text-cyan-400" />
                <h2 className="text-xl font-semibold text-slate-100">Microphone Test</h2>
                {mediaStates.microphone.active && mediaStates.microphone.success && (
                  <div className="ml-auto bg-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-cyan-400 font-medium">Live</span>
                  </div>
                )}
                {mediaStates.microphone.error && (
                  <AlertCircle className="ml-auto w-6 h-6 text-rose-400 animate-pulse" />
                )}
              </div>

              {deviceOptions.microphones.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-2">Select Microphone</label>
                  <select 
                    value={selectedDevices.microphone || ''}
                    onChange={(e) => handleDeviceChange('microphone', e.target.value)}
                    className="w-full bg-slate-700/40 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {deviceOptions.microphones.map(mic => (
                      <option key={mic.id} value={mic.id}>
                        {mic.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                <canvas ref={canvasRef} className="w-full h-full" />
                
                {mediaStates.microphone.active ? (
                  <>
                    {/* Floating success message */}
                    {showSuccess.microphone && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 animate-fadeIn">
                        <div className="bg-cyan-500/90 rounded-xl p-6 flex items-center gap-4 shadow-lg animate-scaleIn">
                          <CheckCircle className="w-8 h-8 text-white" />
                          <div>
                            <p className="text-white font-medium">Microphone is working properly!</p>
                            <p className="text-cyan-100 text-sm">Audio input detected</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>Microphone working properly</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Waves className="w-12 h-12 text-slate-500 mx-auto" />
                      <p className="text-slate-400">
                        {mediaStates.microphone.error || "Microphone activity will show here"}
                      </p>
                      {mediaStates.microphone.tested && !mediaStates.microphone.success && !mediaStates.microphone.error && (
                        <div className="px-4 py-2 bg-amber-500/20 rounded-lg mt-2">
                          <p className="text-amber-400 text-sm">Microphone test completed but no audio was detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {mediaStates.microphone.active && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <Volume2 className={`w-5 h-5 ${audioLevel > 0.5 ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-100"
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
                    className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 rounded-xl text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-all"
                    disabled={mediaStates.microphone.error?.includes('Permission')}
                  >
                    <Radio className="w-5 h-5" />
                    <span>Start Mic Test</span>
                  </button>
                ) : (
                  <button
                    onClick={() => stopMedia('microphone')}
                    className="px-6 py-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 rounded-xl text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Stop Mic Test</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-12 p-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Device Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  mediaStates.camera.active && mediaStates.camera.success ? 'bg-emerald-500/20' : 
                  mediaStates.camera.error ? 'bg-rose-500/20' :
                  mediaStates.camera.tested && mediaStates.camera.success ? 'bg-emerald-500/20' :
                  'bg-slate-600/20'
                }`}>
                  {mediaStates.camera.active && mediaStates.camera.success ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : mediaStates.camera.error ? (
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  ) : mediaStates.camera.tested && mediaStates.camera.success ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Video className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Camera Status</p>
                  <p className={`text-sm font-medium ${
                    (mediaStates.camera.active && mediaStates.camera.success) || 
                    (mediaStates.camera.tested && mediaStates.camera.success) ? 'text-emerald-400' : 
                    mediaStates.camera.error ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {mediaStates.camera.tested && mediaStates.camera.success ? 
                      mediaStates.camera.deviceName ? `Tested Successfully: ${mediaStates.camera.deviceName}` : 'Tested Successfully' : 
                      getStatusText('camera')}
                  </p>
                  {mediaStates.camera.error && (
                    <p className="text-xs text-rose-400 mt-1">{mediaStates.camera.error}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-700/20 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  mediaStates.microphone.active && mediaStates.microphone.success ? 'bg-emerald-500/20' : 
                  mediaStates.microphone.error ? 'bg-rose-500/20' :
                  mediaStates.microphone.tested && mediaStates.microphone.success ? 'bg-emerald-500/20' :
                  'bg-slate-600/20'
                }`}>
                  {mediaStates.microphone.active && mediaStates.microphone.success ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : mediaStates.microphone.error ? (
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  ) : mediaStates.microphone.tested && mediaStates.microphone.success ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Video className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">Microphone Status</p>
                  <p className={`text-sm font-medium ${
                    (mediaStates.microphone.active && mediaStates.microphone.success) || 
                    (mediaStates.microphone.tested && mediaStates.microphone.success) ? 'text-emerald-400' : 
                    mediaStates.microphone.error ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {mediaStates.microphone.tested && mediaStates.microphone.success ? 
                      mediaStates.microphone.deviceName ? `Tested Successfully: ${mediaStates.microphone.deviceName}` : 'Tested Successfully' : 
                      getStatusText('microphone')}
                  </p>
                  {mediaStates.microphone.error && (
                    <p className="text-xs text-rose-400 mt-1">{mediaStates.microphone.error}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Troubleshooting Tips */}
            {(mediaStates.camera.error || mediaStates.microphone.error) && (
              <div className="mt-4 p-4 bg-slate-700/20 rounded-lg border border-slate-600/50">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Troubleshooting Tips:</h4>
                <ul className="text-xs text-slate-400 space-y-1 ml-5 list-disc">
                  {mediaStates.camera.error?.includes('Permission') || mediaStates.microphone.error?.includes('Permission') ? (
                    <li>Check your browser permissions settings and allow access to camera/microphone</li>
                  ) : null}
                  {mediaStates.camera.error?.includes('in use') || mediaStates.microphone.error?.includes('in use') ? (
                    <li>Close other applications that might be using your camera or microphone</li>
                  ) : null}
                  <li>Try refreshing the page and testing again</li>
                  <li>Make sure your devices are properly connected and not disabled in your system settings</li>
                  <li>Try using a different browser if problems persist</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Start Session Button */}
      <div className="fixed bottom-8 right-8 z-20">
      <button 
    onClick={() => {
      if (!(mediaStates.camera.tested && mediaStates.camera.success) || 
          !(mediaStates.microphone.tested && mediaStates.microphone.success)) {
        showNotification('error', 'Please complete both camera and microphone tests first');
      } else {
        navigate('/video-session');
      }
    }}
    className={`px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all transform shadow-xl ${
      (!(mediaStates.camera.tested && mediaStates.camera.success) || 
       !(mediaStates.microphone.tested && mediaStates.microphone.success)) ?
      'opacity-50 cursor-not-allowed' :
      'hover:from-emerald-600 hover:to-cyan-600 hover:scale-105'
    }`}
  >
          <Play className="w-6 h-6" />
          <span>Start Session</span>
        </button>
      </div>
    </div>
  );
}

export default VideoScreen;