import React from "react";
import { Link } from "react-router-dom";

function Footer  ()  {
  return (
    <footer className="bg-gradient-to-r from-green-900 via-green-800 to-green-700 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center">
              <span className="text-green-900 text-2xl font-bold">LOGO</span>
            </div>
          </div>
          <p className="mt-4 text-sm opacity-90 leading-relaxed">
            Have a comment or a problem? Let us know—we value your feedback!
          </p>
          <div className="mt-4">
            <select className="w-full p-3 bg-green-800 text-white rounded outline-none">
              <option>HR</option>
              <option>Technical</option>

            </select>
            <textarea className="w-full mt-3 p-3 bg-green-800 text-white rounded outline-none resize-none" placeholder="Comment..."></textarea>
            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-3 mt-3 rounded transition-all duration-300">
              Submit
            </button>
          </div>
        </div>

       
        <div>
          <h3 className="text-lg font-semibold border-b border-green-500 pb-2">Product</h3>
          <ul className="mt-4 space-y-3">
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Employee Database</Link></li>
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Shift Planner</Link></li>
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Pay Roll</Link></li>
          </ul>
        </div>

       
        <div>
          <h3 className="text-lg font-semibold border-b border-green-500 pb-2">Quick Links</h3>
          <ul className="mt-4 space-y-3">
            <li><Link to="/login" className="hover:text-green-300 transition duration-300">Home</Link></li>
            <li><Link to="TechnicalDashboard" className="hover:text-green-300 transition duration-300">Questions</Link></li>
            <li><Link to="/user-profile" className="hover:text-green-300 transition duration-300">Candidate</Link></li>
            <li><Link to="/about-us" className="hover:text-green-300 transition duration-300">About Us</Link></li>
            <li><Link to="/hr-dashboard" className="hover:text-green-300 transition duration-300">Interview</Link></li>
            <li><Link to="/login" className="hover:text-green-300 transition duration-300">Logout</Link></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-lg font-semibold border-b border-green-500 pb-2">Company</h3>
          <ul className="mt-4 space-y-3">
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Careers</Link></li>
            <li><Link to="/about-us" className="hover:text-green-300 transition duration-300">About Us</Link></li>
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-green-300 transition duration-300">Company Name</Link></li>
          </ul>
        </div>
      </div>

      
      <div className="text-center mt-12 text-gray-300 text-sm">
        <p>© 2025 Interview Monitoring System, All rights reserved.</p>
        <div className="mt-3 space-x-6">
          <Link to="#" className="hover:text-green-300 transition duration-300">Privacy Policy</Link>
          <Link to="#" className="hover:text-green-300 transition duration-300">Terms of Service</Link>
          <Link to="#" className="hover:text-green-300 transition duration-300">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
