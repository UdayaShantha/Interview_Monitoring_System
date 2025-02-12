import React, { useState } from 'react';
import './App.css';
import Navbar from '../components/Navbar';
import { FaUser, FaLock, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login.png';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const navigate = useNavigate();

  function handleClear() {
    setUsername('');
    setPassword('');
    setPosition('');
    setIsCompany(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ username, password, position, isCompany });

    if (!position) {
      alert('Please select a position before logging in.');
      return;
    }

    if (position === 'Candidate') {
      navigate('/user-profile');
    } else if (position === 'HR') {
      navigate('/hr-dashboard');
    } else if (position === 'Technical') {
      navigate('/technical-dashboard');
    }
  };

    

  return (
      <div 
      className="login-container" 
      style={{ backgroundImage: `url(${loginBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
      <Navbar />
      <div className="login-form">
        <h2>Welcome</h2>
        <p className="subtitle">Login to manage your interviews</p>

        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={isCompany}
            onChange={(e) => setIsCompany(e.target.checked)}
          />
          <FaBuilding className="icon" /> Login as a Company
        </label>

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
              <option value="" disabled hidden>Select your position</option>
              <option value="Candidate">Candidate</option>
              <option value="HR">HR</option>
              <option value="Technical">Technical</option>
            </select>
          </div>

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
