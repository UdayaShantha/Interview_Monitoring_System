import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaCalendarTimes,
  FaTimes,
  FaBars,
  FaChartBar,
  FaChartPie,
  FaUserSlash,
  FaUndo,
  FaEye,
  FaTrashAlt,
  FaCalendarAlt,
  FaUser

} from "react-icons/fa";
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

function CancelledInterviewsPage() {
  const [cancelledInterviews, setCancelledInterviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedInterviewToDelete, setSelectedInterviewToDelete] = useState(null);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [selectedInterviewToReschedule, setSelectedInterviewToReschedule] = useState(null);
  const [showViewForm, setShowViewForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchCancelledInterviews = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/interviews/cancelled");
        if (response.status === 200) {
          setCancelledInterviews(response.data);
        }
      } catch (error) {
        console.error("Error fetching cancelled interviews:", error);
      }
    };
    fetchCancelledInterviews();
  }, []);

  const handleDeleteClick = (interview) => {
    setSelectedInterviewToDelete(interview);
    setShowDeleteConfirmation(true);
  };

  const handleRescheduleClick = (interview) => {
    setSelectedInterviewToReschedule(interview);
    setShowRescheduleForm(true);
  };

  const handleViewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowViewForm(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        newDate: e.target.elements.newDate.value,
        newStartTime: e.target.elements.newStartTime.value,
        newEndTime: e.target.elements.newEndTime.value,
        interviewId: selectedInterviewToReschedule.id
      };

      const response = await axios.put(
        `http://localhost:8080/api/interviews/${selectedInterviewToReschedule.id}/reschedule`,
        formData
      );

      if (response.status === 200) {
        setCancelledInterviews(prev => 
          prev.filter(interview => interview.id !== selectedInterviewToReschedule.id)
        );
        setShowRescheduleForm(false);
      }
    } catch (error) {
      console.error("Reschedule failed:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/interviews/${selectedInterviewToDelete.id}`);
      setCancelledInterviews(prev => 
        prev.filter(interview => interview.id !== selectedInterviewToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedInterviewToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedInterviewToDelete(null);
  };

  const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
        <p className="text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );

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
            <div className="flex items-center mb-4">
              <span className="bg-green-100 p-2 rounded-lg mr-3">
                <FaUser className="text-green-800" />
              </span>
              <h3 className="text-lg font-semibold text-green-800">Personal Details</h3>
            </div>
            
            <DetailItem label="NIC Number" value={candidate.nic} />
            <DetailItem label="Address" value={candidate.address} />
            <DetailItem label="Contact Number" value={candidate.contactNumber} />
            <DetailItem label="Email Address" value={candidate.email} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 p-2 rounded-lg mr-3">
                <FaCalendarAlt className="text-green-800" />
              </span>
              <h3 className="text-lg font-semibold text-green-800">Interview Details</h3>
            </div>

            <DetailItem label="Position" value={candidate.position} />
            <DetailItem label="Interview Date" value={new Date(candidate.date).toLocaleDateString()} />
            <DetailItem 
              label="Time Duration" 
              value={`${candidate.startTime} - ${candidate.endTime}`} 
            />
            <DetailItem label="Interview Duration" value={candidate.duration} />
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

  const RescheduleForm = ({ interview, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center p-4 border-b border-green-200">
          <h2 className="text-2xl font-semibold text-green-800 flex items-center">
            <FaCalendarAlt className="mr-2" /> Reschedule Form
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-green-800">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleRescheduleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Candidate Name</label>
            <input
              type="text"
              value={interview.candidateName}
              readOnly
              className="w-full p-2 bg-green-50 border border-green-200 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={interview.email}
              readOnly
              className="w-full p-2 bg-green-50 border border-green-200 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">NIC</label>
            <input
              type="text"
              value={interview.nic}
              readOnly
              className="w-full p-2 bg-green-50 border border-green-200 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New Date</label>
            <input
              name="newDate"
              type="date"
              required
              className="w-full p-2 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New Start Time</label>
            <input
              name="newStartTime"
              type="time"
              required
              className="w-full p-2 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New End Time</label>
            <input
              name="newEndTime"
              type="time"
              required
              className="w-full p-2 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reschedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Confirm deletion of cancelled interview?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={cancelDelete}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Chart Data
  const cancellationStats = {
    totalInterviews: 185,
    cancelledCount: 32,
    cancellationRate: ((32 / 185) * 100).toFixed(1)
  };

  const cancellationData = {
    labels: ['Completed', 'Cancelled', 'Upcoming'],
    datasets: [{
      label: 'Interview Status Distribution',
      data: [120, 32, 33],
      backgroundColor: ['#2D6A4F', '#DC2626', '#A3B18A'],
      borderWidth: 0
    }]
  };

  const cancellationReasonData = {
    labels: ['Candidate', 'Company', 'Rescheduled'],
    datasets: [{
      data: [18, 9, 5],
      backgroundColor: ['#DC2626', '#2D6A4F', '#A3B18A']
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-gradient-to-r from-green-900 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight">Interview Management</h1>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/interviews" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="hover:text-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="hover:text-green-200">Completed</Link>
                <Link to="/interviews/cancelled" className="text-green-200 border-b-2 border-green-200">Cancelled</Link>
                <Link to="/interviews/postponed" className="hover:text-green-200">Postponed</Link>
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
              <Link to="/interviews/upcoming" className="text-green-200">Upcoming</Link>
              <Link to="/interviews/completed" className="text-green-200">Completed</Link>
              <Link to="/interviews/cancelled" className="text-green-200 border-l-4 pl-2">Cancelled</Link>
              <Link to="/interviews/postponed" className="text-green-200">Postponed</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Header */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
            <div className="bg-red-100 p-4 rounded-lg mr-4">
              <FaCalendarTimes className="text-red-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cancelled Interviews</p>
              <p className="text-3xl font-bold">{cancellationStats.cancelledCount}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
            <div className="bg-green-100 p-4 rounded-lg mr-4">
              <FaChartPie className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cancellation Rate</p>
              <p className="text-3xl font-bold">{cancellationStats.cancellationRate}%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
            <div className="bg-gray-100 p-4 rounded-lg mr-4">
              <FaUserSlash className="text-gray-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Candidates</p>
              <p className="text-3xl font-bold">{cancellationStats.totalInterviews}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartPie className="mr-2 text-green-600" />
              Cancellation Distribution
            </h3>
            <div className="h-64">
              <Pie data={cancellationData} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartBar className="mr-2 text-green-600" />
              Cancellation Reasons
            </h3>
            <div className="h-64">
              <Bar 
                data={cancellationReasonData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                }}
              />
            </div>
          </div>
        </div>

        {/* Cancelled Interviews Table */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Cancelled Interviews List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Candidate</th>
                  <th className="px-6 py-3 text-left">Position</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Scheduled Time</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cancelledInterviews.map(interview => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{interview.candidateName}</td>
                    <td className="px-6 py-4">{interview.position}</td>
                    <td className="px-6 py-4">{new Date(interview.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{interview.startTime} - {interview.endTime}</td>
                    <td className="px-6 py-4 flex space-x-4">
                      <button 
                        onClick={() => handleRescheduleClick(interview)}
                        className="text-green-600 hover:text-green-800 tooltip"
                        data-tip="Reschedule"
                      >
                        <FaUndo className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleViewClick(interview)}
                        className="text-blue-600 hover:text-blue-800 tooltip"
                        data-tip="View Details"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(interview)}
                        className="text-red-600 hover:text-red-800 tooltip"
                        data-tip="Delete Record"
                      >
                        <FaTrashAlt className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showDeleteConfirmation && <DeleteConfirmationModal />}
      {showRescheduleForm && selectedInterviewToReschedule && (
        <RescheduleForm 
          interview={selectedInterviewToReschedule}
          onClose={() => {
            setShowRescheduleForm(false);
            setSelectedInterviewToReschedule(null);
          }}
        />
      )}
      {showViewForm && selectedCandidate && (
        <CandidateViewForm 
          candidate={selectedCandidate} 
          onClose={() => setShowViewForm(false)}
        />
      )}
      <Footer />
    </div>
  );
}

export default CancelledInterviewsPage;