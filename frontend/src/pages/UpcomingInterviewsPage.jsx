import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaTrashAlt, FaBars, FaTimes, FaUser, FaCalendarAlt } from "react-icons/fa";
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
import axios from "../axiosInstance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function UpcomingInterviewsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showViewForm, setShowViewForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCandidateToDelete, setSelectedCandidateToDelete] = useState(null);

  useEffect(() => {
    const fetchUpcomingInterviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/interviews/candidate-interview/UPCOMING");
        setUpcomingInterviews(response.data.data);
      } catch (error) {
        console.error("Error fetching upcoming interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUpcomingInterviews();
  }, []);

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowViewForm(true);
  };

  const handleDeleteCandidate = (candidate) => {
    setSelectedCandidateToDelete(candidate);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/interviews/${selectedCandidateToDelete.userId}`);
      setUpcomingInterviews(prev => 
        prev.filter(interview => interview.userId !== selectedCandidateToDelete.userId)
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedCandidateToDelete(null);
    }
  };

  const CancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedCandidateToDelete(null);
  };

  const CandidateViewForm = ({ candidate, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-green-200">
          <h2 className="text-2xl font-semibold text-green-800 flex items-center">
            <FaUser className="mr-2" /> Candidate Details
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-green-800">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="bg-green-100 p-2 rounded-lg mr-3">
                <FaUser className="text-green-800" />
              </span>
              <h3 className="text-lg font-semibold text-green-800">Personal Details</h3>
            </div>
            
            <DetailItem label="Name" value={candidate.name} />
            <DetailItem label="NIC Number" value={candidate.nic} />
            <DetailItem label="Contact Number" value={candidate.contactNumber} />
            <DetailItem label="Email Address" value={candidate.email} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="bg-green-100 p-2 rounded-lg mr-3">
                <FaCalendarAlt className="text-green-800" />
              </span>
              <h3 className="text-lg font-semibold text-green-800">Interview Details</h3>
            </div>

            <DetailItem label="Position" value={candidate.positionType} />
            <DetailItem 
              label="Interview Date" 
              value={new Date(candidate.scheduleDate).toLocaleDateString()} 
            />
            <DetailItem label="Start Time" value={candidate.startTime} />
            <DetailItem label="Duration" value={`${candidate.duration} hours`} />
          </div>
        </div>

        <div className="p-4 border-t border-green-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Confirm deletion?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              OK
            </button>
            <button
              onClick={CancelDelete}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
        <p className="text-gray-800">{value || 'N/A'}</p>
      </div>
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

  const statusChartData = {
    labels: ["Completed", "Pending", "Cancelled"],
    datasets: [{
      label: "Interview Status",
      data: [40, 30, 10],
      backgroundColor: ["#2D6A4F", "#A3B18A", "#FF6B6B"],
      borderWidth: 0,
    }],
  };

  const typeChartData = {
    labels: ["Technical", "HR", "Managerial"],
    datasets: [{
      data: [50, 30, 20],
      backgroundColor: ["#2D6A4F", "#A3B18A", "#FF6B6B"],
      borderWidth: 0,
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight">Interview Portal</h1>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/interviews" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="text-green-200 border-b-2 border-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="hover:text-green-200">Completed</Link>
                <Link to="/interviews/postponed" className="hover:text-green-200">Postponed</Link>
                <Link to="/interviews/cancelled" className="hover:text-green-200">Cancelled</Link>
              </div>
            </div>
            <button className="md:hidden p-2 text-green-200" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/interviews" className="text-green-200">Dashboard</Link>
              <Link to="/interviews/upcoming" className="text-green-200 border-l-4 pl-2">Upcoming</Link>
              <Link to="/interviews/completed" className="text-green-200">Completed</Link>
              <Link to="/interviews/postponed" className="text-green-200">Postponed</Link>
              <Link to="/interviews/cancelled" className="text-green-200">Cancelled</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Interview Status Overview</h3>
            <div className="h-64">
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Interview Type Distribution</h3>
            <div className="h-64">
              <Pie data={typeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Scheduled Interviews</h3>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">Loading interviews...</div>
            ) : upcomingInterviews.length === 0 ? (
              <div className="p-6 text-center">No upcoming interviews scheduled</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Candidate</th>
                    <th className="px-6 py-3 text-left">Position</th>
                    <th className="px-6 py-3 text-left">Date & Time</th>
                    <th className="px-6 py-3 text-left">Duration</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingInterviews.map((interview) => (
                    <tr key={interview.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{interview.name}</td>
                      <td className="px-6 py-4">{interview.positionType}</td>
                      <td className="px-6 py-4">
                        {new Date(interview.scheduleDate).toLocaleDateString()}
                        <br />({interview.startTime})
                      </td>
                      <td className="px-6 py-4">{interview.duration} hours</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewCandidate(interview)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                        >
                          <FaEye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCandidate(interview)}
                          className="text-red-600 hover:text-red-800 ml-2 p-2 rounded-lg hover:bg-red-50"
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

      {showViewForm && selectedCandidate && (
        <CandidateViewForm 
          candidate={selectedCandidate} 
          onClose={() => setShowViewForm(false)}
        />
      )}

      {showDeleteConfirmation && <DeleteConfirmationModal />}

      <Footer />
    </div>
  );
}

export default UpcomingInterviewsPage;