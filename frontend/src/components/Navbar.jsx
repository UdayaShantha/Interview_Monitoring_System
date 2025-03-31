import React, { useState } from 'react';
import './Navbar.css';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <button className="mobile-menu-icon" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={menuOpen ? 'mobile-menu-open' : ''}>
        <li>
          <NavLink 
            to="/login" 
            className={({ isActive }) => 
              isActive ? 'nav-link active highlight-pop' : 'nav-link'
            }
            onClick={closeMenu}
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
            onClick={closeMenu}
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
            onClick={closeMenu}
          >
            About Us
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
