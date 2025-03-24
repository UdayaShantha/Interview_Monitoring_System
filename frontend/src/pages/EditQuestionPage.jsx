import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "../axiosInstance";
import { toast } from "react-toastify";

function EditQuestionPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    question: "",
    category: "",
    time: "",
    keywords: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/get/question?questionId=${id}`);
        const data = response.data.data;
        
        setFormData({
          question: data.content,
          category: data.category.toString(),
          time: data.duration.toString(),
          keywords: data.keywords.join(", ")
        });
      } catch (error) {
        toast.error("Failed to load question");
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`put/update/question/${id}`, {
        content: formData.question,
        category: formData.category,
        duration: formData.time,
        keywords: formData.keywords.split(",").map(k => k.trim())
      });
      
      toast.success("Question updated successfully!");
      navigate("/questions", { state: { refresh: true } });
    } catch (error) {
      toast.error("Failed to update question");
      console.error("Error updating question:", error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading question...</div>;

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-gradient-to-b from-green-50 to-green-100">
      <nav className="bg-green-500 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-lg md:text-2xl font-bold">Edit Question</h1>
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
                <option value="SOFTWARE_ENGINEER">Software Engineering</option>
                <option value="QA">Quality Assurance</option>
                <option value="DATA_ANALYTICS">Data Analytics</option>
                <option value="COMMON">Common Questions</option>
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
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div className="flex justify-end">
            <button
  type="submit"
  onClick={() => navigate("/questions")}
  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition duration-300 font-semibold shadow-md"
>
  Update Question
</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EditQuestionPage;