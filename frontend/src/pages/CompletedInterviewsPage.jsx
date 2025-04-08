import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaTrashAlt, FaDownload, FaBars, FaTimes } from "react-icons/fa";
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
import logo from "../assets/logo.png";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function CompletedInterviewsPage() {
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedInterviewToDelete, setSelectedInterviewToDelete] = useState(null);

  useEffect(() => {
    const fetchCompletedInterviews = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/interviews/completed");
        if (!response.ok) throw new Error("Failed to fetch completed interviews");
        const data = await response.json();
        setCompletedInterviews(data);
      } catch (error) {
        console.error("Error fetching completed interviews:", error);
      }
    };
    fetchCompletedInterviews();
  }, []);

  const handleDeleteClick = (interview) => {
    setSelectedInterviewToDelete(interview);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/interviews/${selectedInterviewToDelete.id}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete interview');
      
      setCompletedInterviews(prev => 
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    }
  };

  const statusChartData = {
    labels: ['Passed', 'Failed', 'Pending Review'],
    datasets: [{
      label: 'Interview Outcomes',
      data: [65, 15, 20],
      backgroundColor: ['#2D6A4F', '#A3B18A', '#588157'],
      borderWidth: 0
    }]
  };

  const typeChartData = {
    labels: ['Technical', 'Behavioral', 'Final'],
    datasets: [{
      data: [45, 30, 25],
      backgroundColor: ['#2D6A4F', '#A3B18A', '#588157'],
      borderWidth: 0
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Company Logo" 
                className="h-10 w-10 object-contain rounded-md"
              />
              <h1 className="text-2xl font-bold tracking-tight">Interview Portal</h1>
            </div>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/interviews" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="hover:text-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="text-green-200 border-b-2 border-green-200">Completed</Link>
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
              <Link to="/interviews/upcoming" className="text-green-200">Upcoming</Link>
              <Link to="/interviews/completed" className="text-green-200 border-l-4 pl-2">Completed</Link>
              <Link to="/interviews/postponed" className="text-green-200">Postponed</Link>
              <Link to="/interviews/cancelled" className="text-green-200">Cancelled</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Interview Outcomes</h3>
            <div className="h-64">
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold">Interview Types</h3>
            <div className="h-64">
              <Pie data={typeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b">
            <h3 className="text-xl font-semibold">Completed Interviews</h3>
          </div>
          <div className="overflow-x-auto">
            {completedInterviews.length === 0 ? (
              <div className="p-6 text-center">No completed interviews found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">Candidate</th>
                    <th className="px-6 py-3 text-left">Position</th>
                    <th className="px-6 py-3 text-left">Date & Time</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedInterviews.map(interview => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{interview.candidateName}</td>
                      <td className="px-6 py-4">{interview.position}</td>
                      <td className="px-6 py-4">
                        {new Date(interview.date).toLocaleDateString()} 
                        ({interview.startTime} - {interview.endTime})
                      </td>
                      <td className="px-6 py-4 flex space-x-4">
                        <button className="text-green-600 hover:text-green-800">
                          <FaEye />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <FaDownload />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(interview)}
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

      {showDeleteConfirmation && <DeleteConfirmationModal />}

      <Footer />
    </div>
  );
}

export default CompletedInterviewsPage;