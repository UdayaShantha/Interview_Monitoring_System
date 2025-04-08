import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import bobImage from '../assets/bob.jpg';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance';
import logo from '../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faReact, 
  faNodeJs, 
  faPython, 
  faAws, 
  faDocker 
} from '@fortawesome/free-brands-svg-icons';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

function UserProfilePage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('00D 00H 00M 00S');
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState('Loading...');
  const [userId, setUserId] = useState(null);
  const [userImage, setUserImage] = useState(null);

  // Company information
  const companyInfo = {
    name: "Us",
    description: "Leading the industry in sustainable technology solutions and innovative software development.",
    techStack: [
      { name: "React", icon: faReact },
      { name: "Node.js", icon: faNodeJs },
      { name: "Python", icon: faPython },
      { name: "AWS", icon: faAws },
      { name: "Docker", icon: faDocker },
      { name: "MongoDB", icon: faDatabase }
    ],
    departments: [
      { name: "Engineering", employees: 50 },
      { name: "Product", employees: 25 },
      { name: "Design", employees: 15 },
      { name: "HR", employees: 10 },
      { name: "Marketing", employees: 20 }
    ]
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        setUsername(decodedToken.sub || 'User');
        // Extract user ID from token if available
        if (decodedToken.userId) {
          setUserId(decodedToken.userId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setUsername('User');
      }
    }
  }, []);

  // Fetch user image from backend
  useEffect(() => {
    const fetchUserImage = async () => {
      if (!userId) return;

      try {
        const response = await axiosInstance.get(`users/hr/get/candidate/photos?userId=${userId}`);
        if (response.data && response.data.data && response.data.data.photos && response.data.data.photos.length > 0) {
          // Get the first photo from the array
          setUserImage(response.data.data.photos[0]);
        }
      } catch (error) {
        console.error('Error fetching user image:', error);
      }
    };

    fetchUserImage();
  }, [userId]);

  // Fetch position from backend
  useEffect(() => {
    const fetchPosition = async () => {
      if (!userId) return;

      try {
        const response = await axiosInstance.get(`users/hr/candidate/position/${userId}`);
        if (response.data && response.data.data) {
          setPosition(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching position:', error);
        setPosition('Position not available');
      }
    };

    fetchPosition();
  }, [userId]);

  useEffect(() => {
    const interviewStartTime = new Date('2025-02-10T10:00:00').getTime();

    function updateTimer() {
      const now = Date.now();
      const diff = interviewStartTime - now;

      if (diff <= 0) {
        setTimeLeft('00D 00H 00M 00S');
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
    }

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }

  function handleStartInterview() {
    navigate('/video-screen');
  }

  function handleHRDashboard() {
    navigate('/hr-dashboard');
  }

  return (
    <div className="user-container flex flex-col min-h-screen bg-white text-green-700 font-sans">
      {/* Header */}
      <header className="user-header bg-gradient-to-r from-green-300 to-green-500 p-6 shadow-lg flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Company Logo" 
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
          />
        </div>
        <div className="flex space-x-2">
          
          <button
            className="logout-btn bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>
      
      <section className="welcome-banner text-center py-8 bg-green-200">
        <h2 className="text-3xl font-bold text-white-700 animate__animated animate__fadeIn">Welcome, {username}!</h2>
      </section>

      {/* Main Content */}
      <main className="profile-section flex-grow p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-green-50">
        <div className="profile-card bg-white p-6 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl">
          <h2 className="profile-title text-2xl font-semibold text-green-700 mb-4">{position} Interview</h2>
          <p className="profile-description text-gray-700 mb-6">
            Experience AI-driven hiring with real-time facial and emotion analysis.
          </p>
          <button
            className="start-btn bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
            onClick={handleStartInterview}
          >
            Start Interview
          </button>
          <p className="time-left text-xl text-green-600 mt-6">
            Time Left: {timeLeft}
          </p>
        </div>
        <div className="profile-picture flex justify-center items-center">
          <img
            src={userImage ? `data:image/jpeg;base64,${userImage}` : bobImage}
            alt="User Profile"
            className="profile-img w-48 h-48 rounded-full shadow-lg object-cover"
          />
        </div>
      </main>

      {/* Company Information Section */}
      <section className="company-info-section bg-gradient-to-b from-green-50 to-green-100 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">About {companyInfo.name}</h2>
          
          <div className="company-description mb-12 text-center">
            <p className="text-lg text-gray-700">{companyInfo.description}</p>
          </div>
          
          {/* Tech Stack */}
  <div className="mb-12">
    <h3 className="text-2xl font-semibold text-green-600 mb-6 text-center">Our Technology Stack</h3>
    <div className="tech-stack grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {companyInfo.techStack.map((tech, index) => (
        <div key={index} className="tech-item bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
          <FontAwesomeIcon 
            icon={tech.icon} 
            className="text-3xl text-green-500 mb-2" 
            style={{ width: '2em', height: '2em' }}
          />
          <p className="font-medium">{tech.name}</p>
        </div>
      ))}
    </div>
  </div>
          {/* Company Structure */}
          <div>
            <h3 className="text-2xl font-semibold text-green-600 mb-6 text-center">Company Structure</h3>
            <div className="departments-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {companyInfo.departments.map((dept, index) => (
                <div key={index} className="department-card bg-white p-4 rounded-lg shadow-md text-center hover:bg-green-50 transition duration-300">
                  <h4 className="font-bold text-green-600 text-lg">{dept.name}</h4>
                  <p className="text-gray-600">{dept.employees} employees</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Access Tools */}
      <section className="tools-section bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold text-green-700 mb-4 text-center">Quick Access Tools</h3>
          <div className="tools-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="tool-btn bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center transition duration-300">
              <i className="fas fa-calendar-alt text-2xl mb-2"></i>
              <span>Schedule Interview</span>
            </button>
            <button className="tool-btn bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center transition duration-300">
              <i className="fas fa-file-alt text-2xl mb-2"></i>
              <span>View Resources</span>
            </button>
            <button className="tool-btn bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center transition duration-300">
              <i className="fas fa-users text-2xl mb-2"></i>
              <span>Team Directory</span>
            </button>
            <button className="tool-btn bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center transition duration-300">
              <i className="fas fa-question-circle text-2xl mb-2"></i>
              <span>Support</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserProfilePage;