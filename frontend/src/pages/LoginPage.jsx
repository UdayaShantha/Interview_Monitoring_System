import React, { useState } from 'react';
import './App.css';
import Navbar from '../components/Navbar';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/img.svg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const navigate = useNavigate();

  function handleClear() {
    setUsername('');
    setPassword('');
    setPosition('');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
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
