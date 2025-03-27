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

function UpcomingInterviewsPage() {
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUpcomingInterviews = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/interviews/upcoming"); // Update URL as needed
        if (!response.ok) {
          throw new Error("Failed to fetch upcoming interviews");
        }
        const data = await response.json();
        setUpcomingInterviews(data);
      } catch (error) {
        console.error("Error fetching upcoming interviews:", error);
      }
    };

    fetchUpcomingInterviews();
  }, []);

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
                <Link to="/hr-dashboard" className="hover:text-green-200">Dashboard</Link>
                <Link to="/interviews/upcoming" className="text-green-200 border-b-2 border-green-200">Upcoming</Link>
                <Link to="/interviews/completed" className="hover:text-green-200">Completed</Link>
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
              <Link to="/hr-dashboard" className="text-green-200">Dashboard</Link>
              <Link to="/interviews/upcoming" className="text-green-200 border-l-4 pl-2">Upcoming</Link>
              <Link to="/interviews/completed" className="text-green-200">Completed</Link>
              <Link to="/interviews/postponed" className="text-green-200">Postponed</Link>
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
            {upcomingInterviews.length === 0 ? (
              <div className="p-6 text-center">No upcoming interviews scheduled</div>
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
                <tbody>
                  {upcomingInterviews.map((interview) => (
                    <tr key={interview.id}>
                      <td className="px-6 py-4">{interview.name}</td>
                      <td className="px-6 py-4">{interview.position}</td>
                      <td className="px-6 py-4">{interview.date} ({interview.startTime} - {interview.endTime})</td>
                      <td className="px-6 py-4">
                        <button className="text-green-600 hover:text-green-800"><FaEye /></button>
                        <button className="text-red-600 hover:text-red-800 ml-4"><FaTrashAlt /></button>
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

export default UpcomingInterviewsPage;
