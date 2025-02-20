import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InstructionPage from './pages/InstructionPage';
import AboutUs from './pages/AboutUs';
import './pages/App.css';

function App() {
  return (

    <div>
      <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/instructions" element={<InstructionPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        </Routes>
    </Router>
    </div>
    
  );
}

export default App;
