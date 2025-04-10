import React, { useState } from "react";

const InterviewPage2 = ({ username }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleStartClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center w-full p-4 bg-gray-300">
        <div className="flex items-center">
          <button className="text-lg font-bold mr-2">&#8592;</button>
          <span className="text-lg font-semibold">Hi {username}!</span>
        </div>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md"
          onClick={handleStartClick}
        >
          Start
        </button>
      </div>

      {/* Video Content */}
      <div className="flex justify-center items-center p-6">
        <div className="bg-black w-4/5 h-96 rounded-lg relative overflow-hidden">
          {/* Placeholder video */}
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            src="path/to/your/video.mp4"
          ></video>
          <div className="absolute bottom-2 left-2 bg-white px-4 py-2 rounded-md shadow-md">
            Not Started Yet
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-100 w-96 p-6 rounded-lg shadow-lg relative">
            <h2 className="text-center text-lg font-semibold mb-4">
              Instructions
            </h2>
            <p className="text-gray-700 mb-6">
              Please follow the instructions to proceed with the interview.
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleClosePopup}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Back
              </button>
              <button
                onClick={handleClosePopup}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage2;
