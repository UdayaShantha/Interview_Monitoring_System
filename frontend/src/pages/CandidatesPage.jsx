import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaTrash, FaPlus, FaEye, FaBars } from "react-icons/fa";
import { motion } from "framer-motion";
import CandidateForm from "./CandidateForm";
import axios from "../axiosInstance"; 
import "./App.css";

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);

  

  const fetchCandidates = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/candidate/all/paginated?page=${page}&size=10`);
      console.log("API Response:", response.data); 

      const fetchedData = response.data.data?.list || [];
      if (fetchedData.length > 0) {
        console.log("Candidate Data:", fetchedData);
      }

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
  }, [currentPage]);

  return (
    <div className="candidates-page">
      <nav className="navbar">
        <div className="navbar-toggle" onClick={toggleNavbar}>
          <FaBars />
        </div>
        <ul className={isNavbarOpen ? "navbar-links open" : "navbar-links"}>
          <li><Link to="/hr-dashboard">Home</Link></li>
          <li className="active"><Link to="/candidates">Candidates</Link></li>
        </ul>
      </nav>

      <motion.div
        className="header-section"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginTop: "60px" }}
      >
        <h2 className="page-title">Candidate Management</h2>
      </motion.div>

      <motion.div
        className="button-container"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button className="add-button" onClick={() => setShowForm(true)}>
          <FaPlus /> Add New Candidate
        </button>

        
      </motion.div>

      {showForm && <CandidateForm onClose={() => setShowForm(false)} />}

      <h3 className="subheading" style={{ marginTop: "20px", marginLeft: "10px", color: "#333" }}>Upcoming Today</h3>

      <motion.div className="table-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {loading ? (
          <p>Loading candidates...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : candidates.length === 0 ? (
          <p className="no-data">No candidates available</p>
        ) : (
          <>
            <table className="candidates-table">
              <thead>
                <tr>
                  <th className="left-align">Name</th>
                  <th className="center-align">Position</th>
                  <th className="right-align"></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.userId}>
                    <td className="left-align">{candidate.name}</td>
                    <td className="center-align">{candidate.positionType}</td>
                    <td className="right-align action-icons">
                      <FaEye className="view-icon" title="View Candidate" />
                      <FaTrash className="delete-icon" title="Delete Candidate" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </button>
              <span>Page {currentPage + 1} of {totalPages}</span>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              >
                Next
              </button>
            </div>
          </>
        )}
      </motion.div><br></br><br></br>

      <Footer />
    </div>
  );
};

export default CandidatesPage;
