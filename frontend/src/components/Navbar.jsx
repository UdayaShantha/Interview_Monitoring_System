import React from 'react';
import './Navbar.css';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              isActive ? 'nav-link active highlight-pop' : 'nav-link'
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/instructions" 
            className={({ isActive }) => 
              isActive ? 'nav-link active highlight-pop' : 'nav-link'
            }
          >
            Instructions
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about-us" 
            className={({ isActive }) => 
              isActive ? 'nav-link active highlight-pop' : 'nav-link'
            }
          >
            About Us
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
