import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../axiosInstance";


function AddQuestionPage() {
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    time: "",
    keywords: ""
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/questions/save", {
        content: formData.question,
        category: formData.category,
        duration: formData.time,
        keywords: formData.keywords.split(",").map(k => k.trim())
      });
      navigate("/questions");
    } catch (error) {
      console.error("Error creating question:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-gradient-to-b from-green-50 to-green-100">
      <nav className="bg-green-500 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-lg md:text-2xl font-bold">Add New Question</h1>
        <Link
          to="/questions"
          className="bg-white text-green-600 px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 text-sm md:text-base"
        >
          Back to Questions
        </Link>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-green-700 text-sm font-semibold mb-2">
                Question
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Enter the question"
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-green-700 text-sm font-semibold mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Select Category</option>
                <option value="QA">QA Engineer</option>
                <option value="SOFTWARE_ENGINEERING">Software Engineer</option>
                <option value="DATA_ANALYTICS">Data Analyst</option>
                <option value="COMMON">Common</option>
              </select>
            </div>

            <div>
              <label className="block text-green-700 text-sm font-semibold mb-2">
                Time (minutes)
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Select Duration</option>
                {[1, 2, 3, 4, 5, 6, 8].map((min) => (
                  <option key={min} value={min}>{min} min</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-green-700 text-sm font-semibold mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="Enter keywords (e.g., Java, Testing, SQL)"
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div className="flex justify-end">
            <button
  type="submit"
  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition duration-300 font-semibold shadow-md"
>
  Submit Question
</button>
              
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default AddQuestionPage;