
import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar () {
  return(
  <nav className="navbar">
    <ul>
      <li>
        <Link to="/login" className="nav-link">Home</Link>
      </li>
      <li>
        <Link to="/instructions" className="nav-link">Instructions</Link> {/* Correct Link */}
      </li>
      <li>
        <Link to="/about-us" className="nav-link">About Us</Link>
      </li>
    </ul>
  </nav>
  )
};

export default Navbar;

