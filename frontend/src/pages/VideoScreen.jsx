import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft, Play, CheckCircle, AlertCircle, Video, Home, Clock  } from 'lucide-react';

function VideoScreen() {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

  const startSession = () => {
    setShowInstructions(true);
  };

  return (
    <div className="h-screen w-full bg-emerald-50 relative flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/user-profile')}
            className="bg-white text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors duration-300 flex items-center gap-2 shadow-md w-full md:w-auto justify-center md:justify-start"
          >
            <ArrowLeft size={18} className="text-green-700" />
            <span className="font-semibold text-sm md:text-base">Back to Profile</span>
          </button>
          
          {/* Start Button */}
          <button 
            onClick={startSession} 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
          >
            <Play size={18} className="fill-current mt-0.5" />
            <span className="font-bold text-base">Start Session</span>
          </button>
        </div>
        </header>


      {/* Instruction Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-emerald-100">
          {/* Modal Header with Gradient */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 flex items-center gap-4 relative">
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-200 to-transparent opacity-30" />
            <CheckCircle className="text-emerald-600 w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">Interview Ready Checklist</h2>
              <p className="text-emerald-600 mt-1 text-sm md:text-base">Essential steps for a successful session</p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-semibold text-emerald-900 text-lg">Tech Setup</h3>
                  </div>
                  <p className="text-gray-600 text-sm pl-8">
                    Test your camera, microphone, and internet connection. Close unnecessary applications.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-semibold text-emerald-900 text-lg">Environment</h3>
                  </div>
                  <p className="text-gray-600 text-sm pl-8">
                    Ensure good lighting and a professional background. Eliminate background noise.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="bg-gradient-to-br from-emerald-300 to-emerald-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-semibold text-emerald-900 text-lg">Session Rules</h3>
                  </div>
                  <p className="text-gray-600 text-sm pl-8">
                    Be ready 5 minutes early. The session will auto-end after 45 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 p-4 rounded-lg flex gap-3 border border-amber-100">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-amber-800 font-medium">
                  <span className="font-bold block mb-1">Important Note:</span>
                  Recording will start immediately. By continuing, you consent to being recorded.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Modal Footer */}
          <div className="bg-emerald-50 px-6 py-4 flex flex-col sm:flex-row justify-between gap-3 border-t border-emerald-100">
            <button
              onClick={() => setShowInstructions(false)}
              className="px-6 py-2.5 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              
            <button
  onClick={() => {
    setShowInstructions(false);
    navigate('/video-session'); // Add this navigation
  }}
  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
>
  <Play size={18} className="fill-current mt-0.5" />
  <span className="font-bold text-base">Start Now</span>
</button>
            </div>
          </div>
        </div>
      </div>
    )}
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden m-4">
          {/* Video Preview Area */}
          <div className="aspect-video bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
            <div className="text-center space-y-6 p-6">
              <p className="text-2xl md:text-3xl font-bold text-emerald-900">
                Session Ready to Start
              </p>
              <div className="flex justify-center">
                <div className="animate-pulse">
                  <div className="h-20 w-20 bg-emerald-700 rounded-full flex items-center justify-center shadow-lg mx-auto border border-emerald-800">
                    <Mic size={32} className="text-emerald-50" />
                  </div>
                </div>
              </div>
              <p className="text-emerald-700 text-sm md:text-base max-w-md mx-auto font-medium">
                Click the start button to begin your video session. Ensure your microphone and camera are properly set up.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="flex items-center gap-4">
            <button className="h-14 w-14 md:h-16 md:w-16 bg-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-800 transition-all duration-300 shadow-lg hover:shadow-emerald-100/50 relative group border border-emerald-800">
              <Mic size={24} className="text-emerald-50" />
              <span className="absolute -bottom-8 text-xs md:text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded-md shadow-sm">
                Microphone Settings
              </span>
            </button>

            {/* New Video Settings Button */}
            <button className="h-14 w-14 md:h-16 md:w-16 bg-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-800 transition-all duration-300 shadow-lg hover:shadow-emerald-100/50 relative group border border-emerald-800">
              <Video size={24} className="text-emerald-50" />
              <span className="absolute -bottom-8 text-xs md:text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded-md shadow-sm">
                Video Settings
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>

    
  );

  
}

export default VideoScreen;
