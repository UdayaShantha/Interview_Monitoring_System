import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const questionData = [
  { question: "What is React?", category: "Common", time: "10min" },
  { question: "Explain Agile methodology.", category: "Software Engineering", time: "15min" },
  { question: "What is unit testing?", category: "QA", time: "5min" },
  { question: "Define data normalization.", category: "Data Analytics", time: "10min" },
];

const chartData = [
  { name: "Common Questions", value: 30 },
  { name: "Software Engineering", value: 25 },
  { name: "QA Questions", value: 20 },
  { name: "Data Analytics", value: 25 },
];

const COLORS = ["#4CAF50", "#66BB6A", "#81C784", "#A5D6A7"];

function QuestionPage() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");

  const filteredQuestions = questionData.filter((q) =>
    (categoryFilter ? q.category === categoryFilter : true) &&
    (timeFilter ? q.time === timeFilter : true)
  );

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-gradient-to-b from-green-50 to-green-100">
      {/* Navbar */}
      <nav className="bg-green-500 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-lg md:text-2xl font-bold">Question Management</h1>
        <Link
          to="/technical-dashboard"
          className="bg-white text-green-600 px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 text-sm md:text-base"
        >
          Home
        </Link>
      </nav>

      {/* Graph Section */}
      <div className="flex justify-center my-6 md:my-10">
        <PieChart width={300} height={250}>
          <Pie data={chartData} cx={150} cy={125} outerRadius={80} fill="#8884d8" dataKey="value" label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Filters & Add Question Button */}
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 pb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0 w-full md:w-auto">
          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Filter by Category</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="QA">Quality Assurance</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Common">Common Questions</option>
          </select>

          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="">Filter by Time</option>
            <option value="5min">5min</option>
            <option value="10min">10min</option>
            <option value="15min">15min</option>
          </select>
        </div>

        <Link
          to="/add-question"
          className="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center justify-center hover:bg-green-500 transition duration-300 w-full md:w-auto"
        >
          <FaPlus className="mr-2" /> Add New Question
        </Link>
      </div>

      {/* Question Table */}
      <div className="px-4 md:px-8 pb-16 overflow-x-auto">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden text-sm md:text-base">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="py-2 px-3 md:py-3 md:px-4 text-left">Question</th>
              <th className="py-2 px-3 md:py-3 md:px-4 text-left">Category</th>
              <th className="py-2 px-3 md:py-3 md:px-4 text-left">Time</th>
              <th className="py-2 px-3 md:py-3 md:px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q, index) => (
              <motion.tr
                key={index}
                className="border-b hover:bg-green-100 transition duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <td className="py-2 px-3 md:py-3 md:px-4">{q.question}</td>
                <td className="py-2 px-3 md:py-3 md:px-4">{q.category}</td>
                <td className="py-2 px-3 md:py-3 md:px-4">{q.time}</td>
                <td className="py-2 px-3 md:py-3 md:px-4 flex justify-center space-x-3">
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuestionPage;
