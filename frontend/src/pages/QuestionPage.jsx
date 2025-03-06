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
      <header className="bg-green-500 text-white py-6 text-center shadow-lg">
        <h1 className="text-4xl font-bold tracking-wide">Question Management</h1>
      </header>

      {/* Graph Section */}
      <div className="flex justify-center my-10">
        <PieChart width={400} height={300}>
          <Pie data={chartData} cx={200} cy={150} outerRadius={100} fill="#8884d8" dataKey="value" label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Filters & Add Question Button */}
      <div className="flex justify-between items-center px-8 pb-4">
        <div className="flex space-x-4">
          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Filter by Category</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="QA">Quality Assurance</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Common">Common Questions</option>
          </select>

          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
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
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-500 transition duration-300"
        >
          <FaPlus className="mr-2" /> Add New Question
        </Link>
      </div>

      {/* Question Table */}
      <div className="px-8 pb-16">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Question</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Time</th>
              <th className="py-3 px-4 text-center">Actions</th>
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
                <td className="py-3 px-4">{q.question}</td>
                <td className="py-3 px-4">{q.category}</td>
                <td className="py-3 px-4">{q.time}</td>
                <td className="py-3 px-4 flex justify-center space-x-4">
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
