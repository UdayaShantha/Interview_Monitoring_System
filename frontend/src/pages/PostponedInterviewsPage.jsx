import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaTrashAlt, FaBars, FaTimes } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Footer from "../components/Footer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function PostponedInterviewsPage() {
  const [postponedInterviews, setPostponedInterviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchPostponedInterviews = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/interviews/postponed");
        if (!response.ok) throw new Error("Failed to fetch postponed interviews");
        const data = await response.json();
        setPostponedInterviews(data);
      } catch (error) {
        console.error("Error fetching postponed interviews:", error);
      }
    };
    fetchPostponedInterviews();
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/interviews/${selectedInterviewId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete interview');
      
      setPostponedInterviews(prev => 
        prev.filter(interview => interview.id !== selectedInterviewId)
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };

  const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="p-2 bg-gray-50 rounded-lg text-gray-700">{value || 'N/A'}</div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    }
  };

  const reasonsData = {
    labels: ['Weather', 'Health', 'Technical', 'Other'],
    datasets: [{
      label: 'Postponement Reasons',
      data: [25, 40, 20, 15],
      backgroundColor: ['#2D6A4F', '#A3B18A', '#588157', '#3A5A40'],
      borderWidth: 0
    }]
  };

  const departmentData = {
    labels: ['Engineering', 'HR', 'Management', 'Sales'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#2D6A4F', '#A3B18A', '#588157', '#3A5A40'],
      borderWidth: 0
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* View Candidate Modal */}
      {isViewModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsViewModalOpen(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-green-800">Candidate Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-green-800"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-green-700 mb-4 border-b-2 border-green-100 pb-2">
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="NIC" value={selectedInterview?.nic} />
                  <DetailItem label="Address" value={selectedInterview?.address} />
                  <DetailItem label="Contact Number" value={selectedInterview?.contactNumber} />
                  <DetailItem label="Email" value={selectedInterview?.email} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-green-700 mb-4 border-b-2 border-green-100 pb-2">
                  Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="Position" value={selectedInterview?.position} />
                  <DetailItem 
                    label="Duration" 
                    value={selectedInterview?.duration ? `${selectedInterview.duration} mins` : 'N/A'} 
                  />
                  <DetailItem 
                    label="Original Date" 
                    value={selectedInterview?.originalDate ? 
                      new Date(selectedInterview.originalDate).toLocaleDateString() : 'N/A'} 
                  />
                  <DetailItem label="Original Time" value={selectedInterview?.originalTime} />
                </div>
              </div>

              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Confirm Deletion?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this interview record?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight">Interview Portal</h1>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/interviews" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="hover:text-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="hover:text-green-200">Completed</Link>
                <Link to="/interviews/postponed" className="text-green-200 border-b-2 border-green-200">Postponed</Link>
                <Link to="/interviews/cancelled" className="hover:text-green-200">Cancelled</Link>
              </div>
            </div>
            <button className="md:hidden p-2 text-green-200" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden px-4 pb-4">
              <div className="flex flex-col space-y-4">
                <Link to="/interviews" className="text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="text-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="text-green-200">Completed</Link>
                <Link to="/interviews/postponed" className="text-green-200 border-l-4 pl-2">Postponed</Link>
                <Link to="/interviews/cancelled" className="text-green-200">Cancelled</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Postponement Reasons</h3>
            <div className="h-64">
              <Bar data={reasonsData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Department Distribution</h3>
            <div className="h-64">
              <Pie data={departmentData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Postponed Interviews</h3>
          </div>
          <div className="overflow-x-auto">
            {postponedInterviews.length === 0 ? (
              <div className="p-6 text-center">No postponed interviews found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Candidate</th>
                    <th className="px-6 py-3 text-left">Position</th>
                    <th className="px-6 py-3 text-left">Original Date</th>
                    <th className="px-6 py-3 text-left">New Date</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {postponedInterviews.map(interview => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{interview.candidateName}</td>
                      <td className="px-6 py-4">{interview.position}</td>
                      <td className="px-6 py-4">
                        {new Date(interview.originalDate).toLocaleDateString()} 
                        ({interview.originalTime})
                      </td>
                      <td className="px-6 py-4">
                        {interview.newDate ? 
                          `${new Date(interview.newDate).toLocaleDateString()} (${interview.newTime})` : 
                          'Not rescheduled'}
                      </td>
                      <td className="px-6 py-4 flex space-x-4">
                        <button 
                          onClick={() => {
                            setSelectedInterview(interview);
                            setIsViewModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedInterviewId(interview.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrashAlt />
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
      <Footer />
    </div>
  );
}

export default PostponedInterviewsPage;