import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaCalendarAlt, FaChartPie, FaEye, FaTrashAlt } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function InterviewPage() {
  const [date, setDate] = useState(new Date());

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Interviews',
        data: [12, 19, 3, 5, 2, 3, 7],
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-900 to-green-700 text-white p-5 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">Interview Management</h1>
        <ul className="flex space-x-6">
          <li><Link to="/hr-dashboard" className="hover:text-red-400 transition duration-300 text-lg font-medium">Home</Link></li>
          <li><Link to="/interviews/upcoming" className="hover:text-green-300 transition duration-300 text-lg font-medium">Upcoming</Link></li>
          <li><Link to="/interviews/completed" className="hover:text-green-300 transition duration-300 text-lg font-medium">Completed</Link></li>
          <li><Link to="/interviews/postponed" className="hover:text-green-300 transition duration-300 text-lg font-medium">Postponed</Link></li>
        </ul>
      </nav>

      {/* Calendar */}
      <div className="p-8 bg-white shadow-lg rounded-lg mt-8 mx-4">
        <h2 className="text-2xl font-semibold mb-4">Interview Schedule</h2>
        <Calendar
          onChange={setDate}
          value={date}
          className="border-2 border-gray-300 rounded-lg p-4"
        />
       
      </div>

      {/* Graph Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Graph 1: Completed Interviews */}
        <div className="bg-white shadow-lg p-8 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Completed Interviews</h3>
          <Line data={data} />
        </div>

        {/* Graph 2: Success Rate */}
        <div className="bg-white shadow-lg p-8 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Interview Success Rate</h3>
          <Line data={data} />
        </div>
      </div>

      {/* Upcoming Interviews Table */}
      <div className="mt-8 p-8 bg-white shadow-lg rounded-lg mx-4">
        <h3 className="text-xl font-semibold mb-4">Upcoming Interviews</h3>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Start Time</th>
              <th className="px-4 py-2 text-left">End Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2">Software Engineer</td>
              <td className="px-4 py-2">March 15, 2025</td>
              <td className="px-4 py-2">10:00 AM</td>
              <td className="px-4 py-2">11:00 AM</td>
              <td className="px-4 py-2">
                <FaEye className="mr-4 cursor-pointer text-green-500 hover:text-green-700" />
                <FaTrashAlt className="cursor-pointer text-red-500 hover:text-red-700" />
              </td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2">Product Manager</td>
              <td className="px-4 py-2">March 18, 2025</td>
              <td className="px-4 py-2">2:00 PM</td>
              <td className="px-4 py-2">3:00 PM</td>
              <td className="px-4 py-2">
                <FaEye className="mr-4 cursor-pointer text-green-500 hover:text-green-700" />
                <FaTrashAlt className="cursor-pointer text-red-500 hover:text-red-700" />
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default InterviewPage;
