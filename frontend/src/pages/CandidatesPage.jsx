import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaTrash, FaPlus, FaEye, FaBars } from "react-icons/fa";
import { motion } from "framer-motion";
import CandidateForm from "./CandidateForm";
import "./App.css";

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); 

  useEffect(() => {
    fetch("https://your-api-endpoint/candidates")
      .then((response) => response.json())
      .then((data) => setCandidates(data))
      .catch((error) => console.error("Error fetching candidates:", error));
  }, []);

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen); 

  return (
    <div className="candidates-page">
      <nav className="navbar">
        <div className="navbar-toggle" onClick={toggleNavbar}>
          <FaBars />
        </div>
        <ul className={isNavbarOpen ? "navbar-links open" : "navbar-links"}>
          <li>
            <Link to="/hr-dashboard">Home</Link>
          </li>
          <li className="active">
            <Link to="/candidates">Candidates</Link>
          </li>
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

      <motion.div
        className="table-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data"></td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.position}</td>
                  <td className="action-icons">
                    <FaEye className="view-icon" title="View Candidate" />
                    <FaTrash className="delete-icon" title="Delete Candidate" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
      <br /><br />

      <Footer />
    </div>
  );
};

export default CandidatesPage;
