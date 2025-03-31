import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import axios from "../axiosInstance";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function QuestionPage() {
  // States for chart counts
  const [counts, setCounts] = useState({
    common: 0,
    softwareEngineering: 0,
    qa: 0,
    dataAnalytics: 0,
  });

  // Other states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const pageSize = 6;

  // Fetch counts for the chart
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const commonRes = await axios.get("questions/count/common-question");
        const seRes = await axios.get("questions/count/questionSE");
        const qaRes = await axios.get("questions/count/questionQA");
        const daRes = await axios.get("questions/count/questionDA");
        setCounts({
          common: commonRes.data,
          softwareEngineering: seRes.data,
          qa: qaRes.data,
          dataAnalytics: daRes.data,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  // Chart data based on counts state
  const chartData = [
    { name: "Common Questions", value: counts.common || 0 },
    { name: "Software Engineering", value: counts.softwareEngineering || 0},
    { name: "QA Questions", value: counts.qa || 0},
    { name: "Data Analytics", value: counts.dataAnalytics || 0},
  ];

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 w-80"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to remove this item?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedQuestionId(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition duration-300"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`questions/question/remove?questionId=${selectedQuestionId}`);
      toast.success("Question deleted successfully");
      fetchQuestions(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete question");
      console.error("Delete error:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedQuestionId(null);
    }
  };

  // Function to format category for ENUM format
  const formatCategory = (category) => {
    return category.replace(/\s+/g, "_").toUpperCase(); // Converts to ENUM format
  };

  // Fetch questions (filtered or unfiltered)
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      let url =
        categoryFilter || timeFilter
          ? `questions/filter/questions/paiginated?page=${currentPage}&size=${pageSize}`
          : `questions/get/questions/paiginated?page=${currentPage}&size=${pageSize}`;

      if (categoryFilter) {
        const formattedCategory = formatCategory(categoryFilter);
        url += `&category=${formattedCategory}`;
      }
      if (timeFilter) {
        url += `&duration=${timeFilter}`;
      }

      console.log("Request URL:", url); // Debugging log

      const response = await axios.get(url);
      // Update questions and pagination (adjust based on your API response structure)
      if (response.status === 200) {
        setQuestions(response.data.data.updateResponseDTOS || []);
        setTotalPages(Math.ceil(response.data.data.totalQuestions / pageSize));
      }
    } catch (error) {
      setError("Failed to load questions");
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount & when filters/page change
  useEffect(() => {
    fetchQuestions();
    if (location.state?.refresh) {
      fetchQuestions();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [currentPage, categoryFilter, timeFilter, location.state]);

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
      <div className="flex justify-center my-6 md:my-10 w-full px-4">
        <ResponsiveContainer width="90%" height={300}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#A5D6A7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#4CAF50" />
            <YAxis stroke="#4CAF50" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#388E3C"
              fillOpacity={1}
              fill="url(#colorGreen)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Filters & Add Question Button */}
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 pb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0 w-full md:w-auto">
          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Filter by Category</option>
            <option value="SOFTWARE_ENGINEERING">Software Engineering</option>
            <option value="QA">Quality Assurance</option>
            <option value="DATA_ANALYTICS">Data Analytics</option>
            <option value="COMMON">Common Questions</option>
          </select>

          <select
            className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="">Filter by Time</option>
            <option value="1">1min</option>
            <option value="2">2min</option>
            <option value="3">3min</option>
            <option value="4">4min</option>
            <option value="5">5min</option>
            <option value="6">6min</option>
            <option value="8">8min</option>
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
        {loading ? (
          <p className="text-center text-gray-500">Loading questions...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
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
              {questions.map((q, index) => (
                <motion.tr key={index} className="border-b hover:bg-green-100 transition duration-300">
                  <td className="py-2 px-3 md:py-3 md:px-4">{q.content || "No Content"}</td>
                  <td className="py-2 px-3 md:py-3 md:px-4">{q.category || "No Category"}</td>
                  <td className="py-2 px-3 md:py-3 md:px-4">
                    {q.duration ? `${q.duration} min` : "N/A"}
                  </td>
                  <td className="py-2 px-3 md:py-3 md:px-4 flex justify-center space-x-3">
                    <Link to={`/edit-question/${q.id}`} className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2 my-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition duration-300"
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-green-700 font-semibold">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition duration-300"
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>

      {showDeleteModal && <DeleteConfirmationModal />}
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuestionPage;
