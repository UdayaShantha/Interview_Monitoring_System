import React from 'react';
import Navbar from '../components/Navbar';
import { FaUsers, FaRocket, FaStar, FaLightbulb, FaHandshake, FaBriefcase } from 'react-icons/fa';


function AboutUs() {
  return (
    <div>
      <Navbar />   

      {/* Hero Section */}
      <section className="text-center py-12 bg-green-900 text-white">
        <h1 className="text-4xl font-extrabold">
          <FaRocket className="inline-block mr-2" /> Empowering Teams for Success
        </h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          We help you build skilled teams of developers, testers, and leaders with speed and efficiency.
        </p>
      </section>

      {/* Core Values */}
      <section className="py-12 text-center bg-green-100">
        <h2 className="text-3xl font-bold text-green-900"><FaLightbulb className="inline-block mr-2" /> Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 mt-6">
          {[
            { icon: <FaUsers />, title: "Collaboration", desc: "Teamwork and transparency drive our success." },
            { icon: <FaStar />, title: "Excellence", desc: "We strive for innovation and high-quality solutions." },
            { icon: <FaHandshake />, title: "Trust", desc: "Integrity and honesty build strong partnerships." }
          ].map((value, index) => (
            <div key={index} className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300">
              <div className="text-green-900 text-4xl">{value.icon}</div>
              <h3 className="text-xl font-semibold mt-4">{value.title}</h3>
              <p className="text-gray-700 mt-2">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 text-center bg-green-300">
        <h2 className="text-3xl font-bold text-green-900"><FaBriefcase className="inline-block mr-2" /> Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 mt-6">
          {['Alice', 'Bob', 'Charlie'].map((member, index) => (
            <div key={index} className="bg-white shadow-md rounded-xl p-6 hover:shadow-xl transition duration-300">
              <img src={`/team-${index + 1}.jpg`} alt={member} className="w-24 h-24 rounded-full mx-auto" />
              <h3 className="text-xl font-semibold mt-4">{member}</h3>
              <p className="text-gray-700">{['Developer', 'Tester', 'Team Lead'][index]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white text-center py-4">
        <p>&copy; 2025 AI Interview Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AboutUs;
