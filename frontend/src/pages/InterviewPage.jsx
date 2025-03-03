import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function InterviewPage() {
  const [date, setDate] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Interviews',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: '#2D6A4F',
        backgroundColor: 'rgba(45, 106, 79, 0.2)',
        tension: 0.3,
      },
    ],
  };

  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-900 to-green-600 text-white p-4 md:p-6 flex justify-between items-center shadow-md">
        <h1 className="text-xl md:text-3xl font-extrabold tracking-wide">Interview Management</h1>
        
        {/* Mobile Navbar Toggle Button */}
        <div className="md:hidden">
          <button 
            className="text-white" 
            aria-label="Open Menu" 
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Navbar Links */}
        <ul className="hidden md:flex space-x-6 text-lg font-medium">
          <li><Link to="/hr-dashboard" className="hover:text-yellow-300 transition duration-300">Home</Link></li>
          <li><Link to="/interviews/upcoming" className="hover:text-yellow-300 transition duration-300">Upcoming</Link></li>
          <li><Link to="/interviews/completed" className="hover:text-yellow-300 transition duration-300">Completed</Link></li>
          <li><Link to="/interviews/postponed" className="hover:text-yellow-300 transition duration-300">Postponed</Link></li>
        </ul>
      </nav>

      {/* Mobile Navbar Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-green-900 to-green-600 text-white p-4 absolute top-16 left-0 w-full shadow-lg">
          <ul className="space-y-4 text-lg font-medium">
            <li><Link to="/hr-dashboard" className="hover:text-yellow-300 transition duration-300">Home</Link></li>
            <li><Link to="/interviews/upcoming" className="hover:text-yellow-300 transition duration-300">Upcoming</Link></li>
            <li><Link to="/interviews/completed" className="hover:text-yellow-300 transition duration-300">Completed</Link></li>
            <li><Link to="/interviews/postponed" className="hover:text-yellow-300 transition duration-300">Postponed</Link></li>
          </ul>
        </div>
      )}

      {/* Main Content Container */}
      <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Calendar Section */}
        <div className="bg-white p-6 shadow-lg rounded-lg transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-lg md:text-2xl font-semibold text-green-800 mb-4">Interview Schedule</h2>
          <Calendar
            onChange={setDate}
            value={date}
            className="border-2 border-gray-300 rounded-lg p-4"
          />
          <p className="mt-4 text-gray-600 text-center italic">Select a date to view scheduled interviews</p>
        </div>

        {/* Graph 1: Completed Interviews */}
        <div className="bg-white p-6 shadow-lg rounded-lg transition-all duration-300 hover:shadow-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-4">Completed Interviews</h3>
          <Line data={data} />
        </div>

        {/* Graph 2: Success Rate */}
        <div className="bg-white p-6 shadow-lg rounded-lg transition-all duration-300 hover:shadow-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-green-800 mb-4">Interview Success Rate</h3>
          <Line data={data} />
        </div>
      </div>

      {/* Upcoming Interviews Table */}
      <div className="mt-8 p-4 md:p-8 bg-white shadow-lg rounded-lg mx-4">
        <h3 className="text-xl md:text-2xl font-semibold text-green-800 mb-4">Upcoming Interviews</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Start Time</th>
                <th className="px-4 py-3 text-left">End Time</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-t hover:bg-gray-100 transition">
                <td className="px-4 py-3">Software Engineer</td>
                <td className="px-4 py-3">March 15, 2025</td>
                <td className="px-4 py-3">10:00 AM</td>
                <td className="px-4 py-3">11:00 AM</td>
                <td className="px-4 py-3 flex space-x-3">
                  <FaEye className="cursor-pointer text-green-500 hover:text-green-700 transition" />
                  <FaTrashAlt className="cursor-pointer text-red-500 hover:text-red-700 transition" />
                </td>
              </tr>
              <tr className="border-t hover:bg-gray-100 transition">
                <td className="px-4 py-3">Product Manager</td>
                <td className="px-4 py-3">March 18, 2025</td>
                <td className="px-4 py-3">2:00 PM</td>
                <td className="px-4 py-3">3:00 PM</td>
                <td className="px-4 py-3 flex space-x-3">
                  <FaEye className="cursor-pointer text-green-500 hover:text-green-700 transition" />
                  <FaTrashAlt className="cursor-pointer text-red-500 hover:text-red-700 transition" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default InterviewPage;
