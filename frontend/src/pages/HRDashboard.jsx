import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaBars, FaTimes, FaUsers, FaCalendarCheck, FaChartBar, FaReact, FaAngular, FaNodeJs, FaCode, FaTools, FaCogs, FaDatabase } from "react-icons/fa";
import { SiNextdotjs, SiDocker } from "react-icons/si";
import { motion } from "framer-motion";
import backgroundImage from "../assets/HRbg.jpg";

function HRDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div 
      className="min-h-screen flex flex-col font-['Poppins']" 
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      
      <nav className="bg-gradient-to-r from-green-900 to-green-700 text-white p-5 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">HR Dashboard</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">

        <li>
            <Link to="/hr-dashboard" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Home
            </Link>
          </li>
          

          <li>
            <Link to="/interviews" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Interviews
            </Link>
          </li>

          <li>
            <Link to="/candidates" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Candidates
            </Link>
          </li>

          
          <li>
            <Link to="/login" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Logout
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white text-3xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <ul className="md:hidden bg-green-800 text-white space-y-6 text-center py-5 absolute top-16 left-0 w-full shadow-md z-10">
          {["Home", "Candidates", "Interviews"].map((text, index) => (
            <li key={index}>
              <Link 
                to={`/${text.toLowerCase()}`} 
                className="block py-2 text-lg font-medium hover:text-green-300 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text}
              </Link>
            </li>
          ))}
          <li>
            <Link 
              to="/login" 
              className="block py-2 text-lg font-medium hover:text-red-400 transition duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Logout
            </Link>
          </li>
        </ul>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-green-300 to-green-500 p-12 text-center">
        <motion.h2 
          className="text-5xl font-extrabold text-green-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Building Teams Quickly and Affordably
        </motion.h2>
        <p className="mt-4 text-xl text-green-900 max-w-3xl mx-auto">
          Our AI-powered system streamlines interview management, ensuring efficiency and accuracy.
        </p>
      </div>

      {/* Dashboard Sections */}
      <div className="grid md:grid-cols-3 gap-10 px-8 py-16">
        {[
          {
            icon: <FaUsers className="text-green-700 text-6xl mx-auto" />, 
            title: "Employee Database", 
            desc: "Manage employee profiles, details, and job positions.", 
            link: "#"
          },
          {
            icon: <FaCalendarCheck className="text-green-700 text-6xl mx-auto" />, 
            title: "Interview Schedules", 
            desc: "Check and manage upcoming interview schedules.", 
            link: "#"
          },
          {
            icon: <FaChartBar className="text-green-700 text-6xl mx-auto" />, 
            title: "Reports & Analytics", 
            desc: "View HR analytics and interview performance reports.", 
            link: "#"
          }
        ].map((item, index) => (
          <motion.div 
            key={index} 
            className="bg-white shadow-lg rounded-xl p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
          >
            {item.icon}
            <h3 className="text-2xl font-semibold mt-4 text-green-900">{item.title}</h3>
            <p className="text-gray-700 mt-2">{item.desc}</p>
            <Link to={item.link} className="block mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 transition duration-300">
              View More
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Staff We Provide Section */}
      <div className="bg-green-100 py-12 text-center">
        <h2 className="text-3xl font-bold text-green-900">Staff We Provide</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-10 mt-6">
          {["Fullstack Engineers", "Quality Assurance", "Data Engineers", "Business Analysts", "DevOps Engineers", "Frontend Engineers"].map((role, index) => (
            <motion.div key={index} 
              className="bg-white shadow-md rounded-xl p-4 text-center hover:bg-green-300 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <p className="text-lg font-semibold text-green-900">{role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specialized Technologies Section */}
      <div className="bg-green-800 text-white py-12 text-center">
        <h2 className="text-3xl font-bold">Specialized Technologies</h2>
        <div className="flex flex-wrap justify-center gap-10 mt-6">
          {[
            { icon: <FaReact />, name: "React" },
            { icon: <FaAngular />, name: "Angular" },
            { icon: <SiNextdotjs />, name: "Next.js" },
            { icon: <FaNodeJs />, name: "Node.js" },
            { icon: <SiDocker />, name: "Docker" },
            { icon: <FaCode />, name: "Python" },
            { icon: <FaTools />, name: "Terraform" },
            { icon: <FaCogs />, name: "Kubernetes" },
            { icon: <FaDatabase />, name: "PostgreSQL" }
          ].map((tech, index) => (
            <motion.div key={index} 
              className="bg-white text-green-900 shadow-md rounded-xl p-6 flex flex-col items-center hover:bg-green-400 transition duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-6xl">{tech.icon}</div>
              <p className="text-lg font-semibold mt-2">{tech.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HRDashboard;
