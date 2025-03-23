import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import { FaBars, FaTimes, FaReact, FaAngular, FaNodeJs, FaCode, FaTools, FaCogs, FaDatabase } from "react-icons/fa";
import { SiNextdotjs, SiDocker } from "react-icons/si";
import { motion } from "framer-motion";
import employeeImage from "../assets/employee.jpg";
import interviewImage from "../assets/interview.jpg";
import reportImage from "../assets/report.jpg";

function HRDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-gradient-to-b from-green-50 to-green-100">
      <nav className="bg-gradient-to-r from-green-500 to-green-300 text-white p-5 flex justify-between items-center shadow-xl">
        <h1 className="text-4xl font-extrabold text-white tracking-wider hover:text-yellow-300 transition duration-300">Technical Dashboard</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li>
            <NavLink 
              to="/technical-dashboard" 
              className={({ isActive }) => 
                `hover:text-red-400 transition duration-300 ${isActive ? 'text-red-400 font-bold underline' : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/interviews" 
              className={({ isActive }) => 
                `hover:text-red-400 transition duration-300 ${isActive ? 'text-red-400 font-bold underline' : ''}`
              }
            >
              Interviews
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/questions" 
              className={({ isActive }) => 
                `hover:text-red-400 transition duration-300 ${isActive ? 'text-red-400 font-bold underline' : ''}`
              }
            >
              Questions
            </NavLink>
          </li>
          <li>
            <Link to="/login" className="hover:text-red-400 transition duration-300">
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
        <ul className="md:hidden bg-green-400 text-white space-y-6 text-center py-5 absolute top-16 left-0 w-full shadow-md z-10">
          {["Home", "Questions", "Interviews"].map((text, index) => (
            <li key={index}>
              <NavLink 
                to={`/${text.toLowerCase()}`} 
                className={({ isActive }) => 
                  `block py-2 text-lg font-medium hover:text-green-800 transition duration-300 ${isActive ? 'text-red-400 font-bold' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {text}
              </NavLink>
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
          className="text-4xl sm:text-5xl font-extrabold text-green-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Streamline Technical Operations Efficiently
        </motion.h2>
        <p className="mt-4 text-lg sm:text-xl text-green-900 max-w-3xl mx-auto">
          Our AI-powered system enhances technical efficiency through intelligent automation.
        </p>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-8 py-16">
        {[{
          image: employeeImage, 
          title: "Technical Database",
          desc: "Manage technical documents, resources, and logs.",
          link: "#"
        },
        {
          image: interviewImage, 
          title: "Question Management",
          desc: "Create, edit, and manage technical interview questions.",
          link: "#"
        },
        {
          image: reportImage, 
          title: "Reports & Performance Analytics",
          desc: "Track system performance and technical metrics.",
          link: "#"
        }].map((item, index) => (
          <motion.div 
            key={index} 
            className="bg-white shadow-xl rounded-xl p-8 text-center transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
          >
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-md mb-4 transition-transform duration-300 hover:scale-105" />
            <h3 className="text-xl sm:text-2xl font-semibold text-green-800 hover:text-green-600 transition duration-300">{item.title}</h3>
            <p className="text-gray-700 mt-2">{item.desc}</p>
            <Link to={item.link} className="block mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition duration-300">
              View More
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Staff We Provide Section */}
      <div className="bg-green-100 py-12 text-center">
        <h2 className="text-4xl font-extrabold text-green-900 tracking-wide">Staff We Provide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 px-10 mt-6">
          {["Fullstack Engineers", "Quality Assurance", "Data Engineers", "Business Analysts", "DevOps Engineers", "Frontend Engineers"].map((role, index) => (
            <motion.div key={index} 
              className="bg-white shadow-md rounded-xl p-4 text-center hover:bg-green-300 transform transition duration-300 hover:scale-105"
              whileHover={{ scale: 1.1 }}
            >
              <p className="text-lg font-semibold text-green-900">{role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specialized Technologies Section */}
      <div className="bg-emerald-700 text-white py-12 text-center">
        <h2 className="text-4xl font-extrabold text-green-400">Specialized Technologies</h2>
        <div className="flex flex-wrap justify-center gap-10 mt-6">
          {[{ icon: <FaReact />, name: "React" },
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
              className="bg-white text-green-900 shadow-md rounded-xl p-6 flex flex-col items-center hover:bg-green-400 transition duration-300 transform hover:scale-105"
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
