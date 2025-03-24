import React, { useState } from 'react';
import './App.css';
import Navbar from '../components/Navbar';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/img.svg';
import axios from '../axiosInstance';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleClear() {
    setUsername('');
    setPassword('');
    setPosition('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Please select a position before logging in.');
      return;
    }
    try {
      const response = await axios.post('/auth/login', { username, password });
      const { accessToken, refreshToken } = response.data;
  
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
  
      if (position === 'Candidate') {
        navigate('/user-profile');
      } else if (position === 'HR') {
        navigate('/hr-dashboard');
      } else if (position === 'Technical') {
        navigate('/technical-dashboard');
      }
    } catch (error) {
      if (error.response && error.response.status === 500 && error.response.data.data === "Bad credentials") {
        setError("Invalid username or password");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      console.error("Login failed:", error);
    }
  };

  return (
    <div 
      className="login-container" 
      style={{ backgroundImage: `url(${loginBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Navbar />
      <div className="login-form">
        <h2 className="welcome-text">Welcome</h2>
        <p className="subtitle">Please log in to your account</p>
  
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <div className="input-with-icon">
              <FaUser className="icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
          </div>
  
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <FaLock className="icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>
  
          <div className="input-group">
            <label>Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            >
              <option value="" disabled hidden style={{ color: 'black' }}>Select your position</option>
              <option value="Candidate" style={{ color: '#2E7D32', fontWeight: 'bold' }}>Candidate</option>
              <option value="HR" style={{ color: '#2E7D32', fontWeight: 'bold' }}>HR</option>
              <option value="Technical" style={{ color: '#2E7D32', fontWeight: 'bold' }}>Technical</option>
            </select>
          </div>
  
          {/* Add error message display here */}
          {error && <p className="error-message">{error}</p>}
  
          <div className="button-group">
            <button type="reset" onClick={handleClear} className="clear-btn">
              Clear
            </button>
            <button type="submit" className="login-btn">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
