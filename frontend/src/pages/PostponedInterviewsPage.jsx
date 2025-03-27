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
      <nav className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight">Interview Portal</h1>
            <div className="hidden md:block">
              <div className="flex space-x-8">
                <Link to="/hr-dashboard" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="hover:text-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="hover:text-green-200">Completed</Link>
                <Link to="/interviews/postponed" className="text-green-200 border-b-2 border-green-200">Postponed</Link>
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
              <Link to="/hr-dashboard" className="text-green-200">Dashboard</Link>
              <Link to="/interviews/upcoming" className="text-green-200">Upcoming</Link>
              <Link to="/interviews/completed" className="text-green-200">Completed</Link>
              <Link to="/interviews/postponed" className="text-green-200 border-l-4 pl-2">Postponed</Link>
            </div>
          </div>
        )}
      </nav>

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
                        <button className="text-green-600 hover:text-green-800">
                          <FaEye />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
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