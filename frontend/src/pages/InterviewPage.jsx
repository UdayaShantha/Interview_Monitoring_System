import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { 
  FaChartLine, 
  FaCalendarAlt, 
  FaUserTie, 
  FaRegClock,
  FaSignOutAlt
} from "react-icons/fa";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
         LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from "../axiosInstance";
import { jwtDecode } from 'jwt-decode';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement, BarElement
);

function InterviewPage() {
  const [date, setDate] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [successRate, setSuccessRate] = useState(0);
  const [statusPercentages, setStatusPercentages] = useState([]);
  const [interviewCount, setInterviewCount] = useState(0);
  const navigate = useNavigate();

  const handleHomeClick = (e) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const userType = decodedToken.userType;
        
        if (userType === 'HR') {
          navigate('/hr-dashboard');
        } else if (userType === 'TECHNICAL') {
          navigate('/technical-dashboard');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchSuccessRate();
    fetchStatusPercentages();
    fetchInterviewCount();
  }, []);

  const fetchSuccessRate = async () => {
    try {
      const response = await axios.get('/interviews/success-rate');
      if (response.data.code === 200) {
        setSuccessRate(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching success rate:', error);
    }
  };

  const fetchStatusPercentages = async () => {
    try {
      const response = await axios.get('/interviews/get/precentages/status');
      if (response.data.code === 200) {
        setStatusPercentages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching status percentages:', error);
    }
  };

  const fetchInterviewCount = async () => {
    try {
      const response = await axios.get('/interviews/get/interview/count');
      if (response.data.code === 200) {
        setInterviewCount(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching interview count:', error);
    }
  };

  // Chart Data Configurations
  const completionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Completed Interviews',
      data: [12, 19, 8, 15, 12, 17],
      borderColor: '#2D6A4F',
      backgroundColor: 'rgba(45, 106, 79, 0.2)',
      tension: 0.4,
    }]
  };

  const successRateData = {
    labels: ['Software Engineer', 'QA Engineer', 'Data Analyst'],
    datasets: [{
      label: 'Success Rate %',
      data: [78, 82, 65],
      backgroundColor: ['#2D6A4F', '#40916C', '#52B788'],
      borderWidth: 0,
    }]
  };

  // Create status distribution data from real data
  const statusDistributionData = {
    labels: statusPercentages.map(item => item.status),
    datasets: [{
      data: statusPercentages.map(item => item.percentage),
      backgroundColor: [
        '#2D6A4F', // Completed - Green
        '#EF4444', // Cancelled - Red
        '#3B82F6', // Upcoming - Blue
        '#D97706'  // Postponed - Orange
      ],
      borderColor: [
        '#1B4332', // Darker Green
        '#B91C1C', // Darker Red
        '#1D4ED8', // Darker Blue
        '#B45309'  // Darker Orange
      ],
      borderWidth: 1,
      hoverOffset: 4
    }]
  };

  // Add chart options for percentage display
  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    cutout: '60%'
  };

  // Mock recent interviews data
  const recentInterviews = [
    { id: 1, position: 'Senior Developer', date: '2024-03-15', status: 'Completed' },
    { id: 2, position: 'Product Manager', date: '2024-03-18', status: 'Upcoming' },
    { id: 3, position: 'UX Designer', date: '2024-03-20', status: 'Postponed' }
  ];

  // Statistics Cards Data
  const stats = [
    { title: 'Total Interviews', value: interviewCount.toString(), icon: <FaUserTie />, color: 'bg-green-100' },
    { title: 'Avg. Duration', value: '45m', icon: <FaRegClock />, color: 'bg-blue-100' },
    { title: 'Success Rate', value: `${successRate}%`, icon: <FaChartLine />, color: 'bg-emerald-100' }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 🟩 UPDATED NAVBAR */}
      <nav className="bg-gradient-to-r from-green-900 to-green-600 text-white p-4 md:p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
          <span className="bg-white text-green-800 px-3 py-1 rounded-md mr-2">AI</span>
          Interview Management
        </h1>
        
        {/* 🟩 MOBILE MENU TOGGLE */}
        <div className="md:hidden">
          <button 
            className="text-white" 
            aria-label="Open Menu" 
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 🟩 DESKTOP NAVIGATION */}
        <ul className="hidden md:flex space-x-6 text-lg font-medium">
          <li><Link to="#" onClick={handleHomeClick} className="hover:text-yellow-300 transition duration-300">Home</Link></li>
          <li><Link to="/interviews/upcoming" className="hover:text-yellow-300 transition duration-300">Upcoming</Link></li>
          <li><Link to="/interviews/completed" className="hover:text-yellow-300 transition duration-300">Completed</Link></li>
          <li><Link to="/interviews/postponed" className="hover:text-yellow-300 transition duration-300">Postponed</Link></li>
          <li><Link to="/interviews/cancelled" className="hover:text-yellow-300 transition duration-300">Cancelled</Link></li>
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center hover:text-yellow-300 transition duration-300"
            >
              <FaSignOutAlt className="mr-1" />
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* 🟩 MOBILE NAVIGATION */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-green-900 to-green-600 text-white p-4 absolute top-16 left-0 w-full shadow-lg">
          <ul className="space-y-4 text-lg font-medium">
            <li><Link to="#" onClick={handleHomeClick} className="hover:text-yellow-300 transition duration-300">Home</Link></li>
            <li><Link to="/interviews/upcoming" className="hover:text-yellow-300 transition duration-300">Upcoming</Link></li>
            <li><Link to="/interviews/completed" className="hover:text-yellow-300 transition duration-300">Completed</Link></li>
            <li><Link to="/interviews/postponed" className="hover:text-yellow-300 transition duration-300">Postponed</Link></li>
            <li><Link to="/interviews/cancelled" className="hover:text-yellow-300 transition duration-300">Cancelled</Link></li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center hover:text-yellow-300 transition duration-300 w-full text-left"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="p-4 md:p-8 space-y-8">
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl text-green-800">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Calendar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-green-800 mr-2 text-xl" />
              <h2 className="text-xl font-semibold">Interview Calendar</h2>
            </div>
            <Calendar
              onChange={setDate}
              value={date}
              className="border-2 border-gray-100 rounded-lg"
            />
          </div>

          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaChartLine className="mr-2 text-green-800" />
              Monthly Completion Trends
            </h3>
            <Line data={completionData} />
          </div>
        </div>

        {/* Bottom Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Success Rate by Department</h3>
            <Bar data={successRateData} />
          </div>

          {/* Doughnut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Status Distribution</h3>
            <div className="max-w-xs mx-auto">
              <Doughnut data={statusDistributionData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Recent Interviews Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Recent Interviews</h3>
          <div className="space-y-4">
            {recentInterviews.map(interview => (
              <div key={interview.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-semibold">{interview.position}</h4>
                  <p className="text-sm text-gray-600">{new Date(interview.date).toDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  interview.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {interview.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default InterviewPage;