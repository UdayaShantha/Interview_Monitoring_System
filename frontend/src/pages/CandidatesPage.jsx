import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaTrash, FaPlus, FaEye, FaBars, FaSearch, FaFilter, FaTimes, FaUser, FaCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CandidateForm from "./CandidateForm";
import axios from "../axiosInstance";
import "./App.css";
import logo from "../assets/logo.png";

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [candidatePhoto, setCandidatePhoto] = useState(null);

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);

  const fetchCandidates = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`users/hr/candidate/all/paginated?page=${page}&size=10`);
      const fetchedData = response.data.data?.list || [];

      if (response.status === 200) {
        setCandidates(fetchedData);
        setTotalPages(Math.ceil(response.data.data?.totalCandidates / 10));
      }
    } catch (error) {
      setError("Failed to load candidates");
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage, refreshTrigger]);

  const handleCandidateAdded = () => {
    setRefreshTrigger(prev => !prev);
    setShowForm(false);
  };

  const handleViewCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setShowViewModal(true);
    try {
      const response = await axios.get(`/users/hr/get/candidate/photos?userId=${candidate.userId}`);
      if (response.status === 200 && response.data.data && response.data.data.photos && response.data.data.photos.length > 0) {
        setCandidatePhoto(response.data.data.photos[0]);
      }
    } catch (error) {
      console.error("Error fetching candidate photo:", error);
    }
  };

  const handleDeleteClick = (candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/users/hr/candidate/${candidateToDelete.userId}`);
      setCandidates(prev => prev.filter(c => c.userId !== candidateToDelete.userId));
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCandidateToDelete(null);
  };

  const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
        <p className="text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.positionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="candidates-page bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
              {/* Updated logo section */}
              <div className="flex items-center space-x-3">
    <img 
      src={logo} 
      alt="Company Logo" 
      className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 object-contain rounded-md" 
    />
    <Link to="/hr-dashboard" className="text-xl font-bold text-gray-800">
      HR Portal
    </Link>
  </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/hr-dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link to="/candidates" className="bg-gray-100 text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Candidates</Link>
              </div>
            </div>
            
            <div className="md:hidden">
              <button 
                onClick={toggleNavbar}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isNavbarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/hr-dashboard" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                <Link to="/candidates" className="bg-gray-100 text-gray-900 block px-3 py-2 rounded-md text-base font-medium">Candidates</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="container mx-auto px-4 pt-20 pb-6">
        <motion.div
          className="header-section mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Candidate Management</h1>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center justify-center"
              onClick={() => setShowForm(true)}
            >
              <FaPlus className="mr-2" /> Add New Candidate
            </motion.button>
          </div>
        </motion.div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FaSearch />
              </div>
            </div>
            <button className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
              <FaFilter className="mr-2" /> Filter
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading candidates...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No candidates available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candidate.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 rounded-full">
                            {candidate.positionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleViewCandidate(candidate)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(candidate)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage + 1}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage + 1 >= totalPages}
                      className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage + 1 >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
              <div className="flex sm:hidden justify-between w-full">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 0 ? 'text-gray-300 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage + 1 >= totalPages}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage + 1 >= totalPages ? 'text-gray-300 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Add New Candidate</h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-4">
                <CandidateForm onClose={() => setShowForm(false)} onSuccess={handleCandidateAdded} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showViewModal && selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header Section */}
              <div className="bg-emerald-400 p-4 flex items-center">
                <div className="flex items-center flex-grow">
                  <div className="relative">
                    {candidatePhoto ? (
                      <img 
                        src={`data:image/jpeg;base64,${candidatePhoto}`} 
                        alt="Candidate" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                        <FaUser className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-white">
                    <h2 className="text-xl font-semibold">{selectedCandidate.name}</h2>
                    <p className="text-emerald-50">{selectedCandidate.positionType} Application</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-emerald-100"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Personal Details Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <FaUser className="text-emerald-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">NIC:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.nic}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Address:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.address}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Contact No:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.phone}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Email:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Birthday:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.birthday ? new Date(selectedCandidate.birthday).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Details Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <FaCalendarAlt className="text-emerald-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Interview Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Position:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.positionType}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Schedule Date:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.scheduleDate ? new Date(selectedCandidate.scheduleDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Start Time:</label>
                        <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded-md">
                          {selectedCandidate.startTime || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete {candidateToDelete?.name}? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default CandidatesPage;