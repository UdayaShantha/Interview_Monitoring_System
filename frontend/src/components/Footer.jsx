import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-green-900 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        
        {/* Company Info */}
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-green-900 text-lg font-bold">LOGO</span>
            </div>
            <h3 className="text-lg font-semibold">Interview System</h3>
          </div>
          <p className="mt-3 opacity-80 leading-relaxed">
            Empowering companies with AI-driven interview solutions.
          </p>
          <div className="flex space-x-4 mt-4">
            <Link to="#" className="hover:text-green-400"><FaFacebookF size={18} /></Link>
            <Link to="#" className="hover:text-green-400"><FaTwitter size={18} /></Link>
            <Link to="#" className="hover:text-green-400"><FaLinkedinIn size={18} /></Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-green-500 pb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/hr-dashboard" className="hover:text-green-400 transition">Home</Link></li>
            <li><Link to="/interviews" className="hover:text-green-400 transition">Interviews</Link></li>
            <li><Link to="/candidates" className="hover:text-green-400 transition">Candidates</Link></li>
            <li><Link to="/about-us" className="hover:text-green-400 transition">About Us</Link></li>
            <li><Link to="/login" className="hover:text-green-400 transition">Logout</Link></li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-green-500 pb-2">Contact</h3>
          <p className="opacity-80">Need support? Get in touch.</p>
          <p className="mt-2 opacity-90">Email: <a href="mailto:support@interviewsystem.com" className="hover:text-green-400">support@interviewsystem.com</a></p>
          <p className="mt-1 opacity-90">Phone: <a href="tel:+1234567890" className="hover:text-green-400">+1 234 567 890</a></p>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="text-center mt-6 text-gray-300 text-xs">
        <p>© 2025 Interview Monitoring System. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link to="#" className="hover:text-green-400">Privacy Policy</Link>
          <Link to="#" className="hover:text-green-400">Terms of Service</Link>
          <Link to="#" className="hover:text-green-400">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
