import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaTrashAlt, FaBars, FaTimes } from 'react-icons/fa';
import Footer from '../components/Footer';
import axios from '../axiosInstance';
import { toast } from 'react-toastify';

function InterviewStatusPage({ status }) {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Status display mapping
  const statusDisplay = {
    UPCOMING: 'Upcoming',
    COMPLETED: 'Completed',
    POSTPONED: 'Postponed',
    CANCELLED: 'Cancelled'
  };

  // Status color mapping
  const statusColors = {
    UPCOMING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    POSTPONED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/interviews/by-status/${status}`);
        setInterviews(response.data.data || []);
      } catch (error) {
        toast.error(`Failed to load ${statusDisplay[status]} interviews`);
        console.error(`Error fetching ${status} interviews:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [status]);

  const handleViewInterview = (interview) => {
    setSelectedInterview(interview);
    setShowViewModal(true);
  };

  const handleDeleteInterview = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedInterview?.id) return;
    
    try {
      await axios.delete(`/interviews/${selectedInterview.id}`);
      setInterviews(prev => 
        prev.filter(i => i.id !== selectedInterview.id)
      );
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error('Failed to delete interview');
      console.error('Error deleting interview:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedInterview(null);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight">Interview Portal</h1>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/interviews" className="hover:text-green-200">Dashboard</Link>
                <Link 
                  to="/interviews/upcoming" 
                  className={`${status === 'UPCOMING' ? 'text-green-200 border-b-2 border-green-200' : 'hover:text-green-200'}`}
                >
                  Upcoming
                </Link>
                <Link 
                  to="/interviews/completed" 
                  className={`${status === 'COMPLETED' ? 'text-green-200 border-b-2 border-green-200' : 'hover:text-green-200'}`}
                >
                  Completed
                </Link>
                <Link 
                  to="/interviews/postponed" 
                  className={`${status === 'POSTPONED' ? 'text-green-200 border-b-2 border-green-200' : 'hover:text-green-200'}`}
                >
                  Postponed
                </Link>
                <Link 
                  to="/interviews/cancelled" 
                  className={`${status === 'CANCELLED' ? 'text-green-200 border-b-2 border-green-200' : 'hover:text-green-200'}`}
                >
                  Cancelled
                </Link> 
              </div>
            </div>
            <button 
              className="md:hidden p-2 text-green-200" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/interviews" className="text-green-200">Dashboard</Link>
              <Link 
                to="/interviews/upcoming" 
                className={`${status === 'UPCOMING' ? 'text-green-200 border-l-4 pl-2 border-green-200' : 'text-green-200'}`}
              >
                Upcoming
              </Link>
              <Link 
                to="/interviews/completed" 
                className={`${status === 'COMPLETED' ? 'text-green-200 border-l-4 pl-2 border-green-200' : 'text-green-200'}`}
              >
                Completed
              </Link>
              <Link 
                to="/interviews/postponed" 
                className={`${status === 'POSTPONED' ? 'text-green-200 border-l-4 pl-2 border-green-200' : 'text-green-200'}`}
              >
                Postponed
              </Link>
              <Link 
                to="/interviews/cancelled" 
                className={`${status === 'CANCELLED' ? 'text-green-200 border-l-4 pl-2 border-green-200' : 'text-green-200'}`}
              >
                Cancelled
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Interviews Table */}
        <div className="bg-white rounded-xl shadow-md h-full">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">{statusDisplay[status]} Interviews</h3>
            <span className="text-sm text-gray-600">
              {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'} found
            </span>
          </div>
          
          <div className="overflow-x-auto h-[calc(100vh-16rem)]">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No {status.toLowerCase()} interviews found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (minutes)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.candidateId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.scheduleDate ? new Date(interview.scheduleDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTime(interview.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.duration ? parseFloat(interview.duration.toFixed(1)) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[interview.status]}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewInterview(interview)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                          title="View details"
                        >
                          <FaEye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteInterview(interview)}
                          className="text-red-600 hover:text-red-800 ml-2 p-2 rounded-lg hover:bg-red-50"
                          title="Delete interview"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* View Interview Modal */}
      {showViewModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-green-200">
              <h2 className="text-2xl font-semibold text-green-800">Interview Details</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-green-800"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">Basic Information</h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Candidate ID</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-800">{selectedInterview.candidateId || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedInterview.status]}`}>
                      {selectedInterview.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800">Schedule Information</h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Schedule Date</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-800">
                      {selectedInterview.scheduleDate ? new Date(selectedInterview.scheduleDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-800">{formatTime(selectedInterview.startTime)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-800">
                      {selectedInterview.duration ? `${parseFloat(selectedInterview.duration.toFixed(1))} minutes` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-green-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm deletion of this interview?
              </h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InterviewStatusPage;