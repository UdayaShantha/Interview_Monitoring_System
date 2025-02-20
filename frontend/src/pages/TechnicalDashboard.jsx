import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import { FaDatabase, FaChartBar, FaCode, FaTools, FaCogs, FaReact, FaAngular, FaNodeJs, FaBars, FaTimes } from "react-icons/fa";
import { SiNextdotjs, SiDocker } from "react-icons/si";
import { motion } from "framer-motion";
import backgroundImage from "../assets/HRbg.jpg";

const TechnicalDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu toggle state

  return (
    <div
      className="min-h-screen flex flex-col font-['Poppins']"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-900 to-green-700 text-white p-5 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Technical Dashboard</h1>

        {/* Desktop Navbar */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link to="/technical-dashboard" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Home
            </Link>
          </li>
          {["Question", "Interviews"].map((text, index) => (
            <li key={index}>
              <Link to={`/${text.toLowerCase().replace(/ /g, "-")}`} className="hover:text-green-300 transition duration-300 text-lg font-medium">
                {text}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/login" className="hover:text-red-400 transition duration-300 text-lg font-medium">
              Logout
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-800 text-white py-4 px-6 flex flex-col space-y-4">
          <Link to="/technical-dashboard" className="hover:text-red-400 transition duration-300 text-lg font-medium">
            Home
          </Link>
          {["Question", "Interviews"].map((text, index) => (
            <Link key={index} to={`/${text.toLowerCase().replace(/ /g, "-")}`} className="hover:text-green-300 transition duration-300 text-lg font-medium">
              {text}
            </Link>
          ))}
          <Link to="/login" className="hover:text-red-400 transition duration-300 text-lg font-medium">
            Logout
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-green-300 to-green-500 p-12 text-center">
        <motion.h2
          className="text-5xl font-extrabold text-green-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Streamline Technical Operations Efficiently
        </motion.h2>
        <p className="mt-4 text-xl text-green-900 max-w-3xl mx-auto">
          Our AI-powered system enhances technical efficiency through intelligent automation.
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="grid md:grid-cols-3 gap-10 px-8 py-16">
        {[
          {
            icon: <FaDatabase className="text-green-700 text-6xl mx-auto" />,
            title: "Technical Database",
            desc: "Manage technical documents, resources, and logs.",
            link: "#"
          },
          {
            icon: <FaCode className="text-green-700 text-6xl mx-auto" />,
            title: "Question Management",
            desc: "Create, edit, and manage technical interview questions.",
            link: "#"
          },
          {
            icon: <FaChartBar className="text-green-700 text-6xl mx-auto" />,
            title: "Performance Analytics",
            desc: "Track system performance and technical metrics.",
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

      {/* Technical Teams */}
      <div className="bg-green-100 py-12 text-center">
        <h2 className="text-3xl font-bold text-green-900">Technical Teams</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-10 mt-6">
          {["Software Engineers", "AI Engineers", "Security Experts", "Cloud Architects", "DevOps Engineers", "System Analysts"].map((role, index) => (
            <motion.div key={index}
              className="bg-white shadow-md rounded-xl p-4 text-center hover:bg-green-300 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <p className="text-lg font-semibold text-green-900">{role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Technologies Used */}
      <div className="bg-green-800 text-white py-12 text-center">
        <h2 className="text-3xl font-bold">Technologies Used</h2>
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
};

export default TechnicalDashboard;
