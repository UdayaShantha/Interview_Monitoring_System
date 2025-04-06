import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageSquare, ArrowLeft, Loader } from 'lucide-react';

function FeedbackPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Navigation blocking - Prevent back button usage
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = (e) => {
      // Push the current URL back onto the history stack to prevent back navigation
      window.history.pushState(null, null, window.location.href);
    };

    // Push current URL to history stack to handle initial back button press
    window.history.pushState(null, null, window.location.href);
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      // Clean up event listeners when component unmounts
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call with 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the feedback to your backend
      console.log('Feedback submitted:', feedback);
      
      setIsSubmitted(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
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
                <label htmlFor="feedback" className="block text-sm font-medium text-emerald-700 mb-2">
                  Optional Feedback
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
              
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md"
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
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <p className="text-emerald-700 font-medium">
                  Thank you for your feedback! Redirecting to login...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;