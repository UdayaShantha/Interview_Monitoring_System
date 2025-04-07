import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageSquare, ArrowLeft, Loader, Star } from 'lucide-react';
import axios from '../axiosInstance';
import { jwtDecode } from 'jwt-decode';

function FeedbackPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Navigation blocking - Prevent back button usage
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

  const getUserIdFromToken = () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const decodedToken = jwtDecode(accessToken);
      const userId = decodedToken.userId;

      if (!userId) {
        throw new Error('User ID not found in token');
      }

      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userId = getUserIdFromToken();
      
      const response = await axios.post('/users/candidate/feedback', null, {
        params: {
          user_id: userId,
          rate: rating,
          comment: feedback
        }
      });

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // Check if the response indicates success
      if (response.status === 201 || response.status === 200) {
        setIsSubmitted(true);
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 transition-all duration-300 hover:shadow-2xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Home</span>
        </button>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 animate-bounce" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">
            Thank You for Participating!
          </h1>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="text-left">
                <label className="block text-sm font-medium text-emerald-700 mb-2">
                  Rate your experience
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 rounded-full transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star
                        size={32}
                        className="hover:scale-110 transition-transform"
                        fill={star <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-left">
                <label htmlFor="feedback" className="block text-sm font-medium text-emerald-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  rows="4"
                  placeholder="How was your interview experience? Any suggestions for improvement?"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                disabled={isLoading || rating === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin text-white" size={20} />
                    <span className="text-white">Submitting...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={20} className="text-white" />
                    <span className="font-semibold text-white">Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <p className="text-emerald-700 font-medium">
                      Thank you for your feedback!
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm text-center">
                    Your response has been recorded successfully.
                  </p>
                  <button
                    onClick={() => {
                      // Clear tokens
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      // Navigate to login
                      navigate('/login');
                    }}
                    className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
                  >
                    <span className="font-semibold">Exit to Login</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;