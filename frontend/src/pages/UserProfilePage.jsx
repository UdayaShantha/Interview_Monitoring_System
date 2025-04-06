import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import Footer from "../components/Footer";
import bobImage from '../assets/bob.jpg';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../axiosInstance';

function UserProfilePage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [timeLeft, setTimeLeft] = useState('00D 00H 00M 00S');
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState('Loading...');
  const [userId, setUserId] = useState(null);

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
      const now = new Date().getTime();
      const difference = interviewStartTime - now;

      if (difference <= 0) {
        setTimeLeft('00D 00H 00M 00S');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
    }

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

  return (
    <div className="user-container bg-white text-green-700 font-sans">
      <header className="user-header bg-gradient-to-r from-green-300 to-green-500 p-6 shadow-lg">
        <h1 className="company-name text-white text-2xl font-bold tracking-wide">LOGO</h1>
        <nav className="header-buttons flex justify-between items-center">
          <button 
            className="logout-btn bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300" 
            onClick={handleLogout}
          >
            Log Out
          </button>
        </nav>
      </header>
      
      <section className="welcome-banner text-center py-10 bg-green-200">
        <h2 className="text-3xl font-bold text-white-700 animate__animated animate__fadeIn">Welcome, {username}!</h2>
      </section>

      <main className="profile-section p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-green-50">
        <div className="profile-card bg-white p-6 rounded-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
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
          <p className="time-left text-xl text-green-600 mt-6">Time Left: {timeLeft}</p>
        </div>

        <div className="profile-picture flex justify-center items-center">
          <img src={bobImage} alt="User Profile" className="profile-img w-48 h-48 rounded-full shadow-lg" />
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserProfilePage;