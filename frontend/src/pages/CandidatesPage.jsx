import { useState, useEffect } from "react";
import { getCandidates } from "../api/axios"; // Importing API function
import CandidateTable from "../components/CandidateTable"; // Candidate table component
import "./App.css";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchCandidates();
  }, [currentPage]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCandidates(currentPage, pageSize);

      if (response.code === 200 && response.data) { 
        setCandidates(response.data.list || []);
        setTotalCandidates(response.data.totalCandidates || 0);
      } else {
        setError(response.message || "Unexpected server response");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to fetch candidates");
      setCandidates([]);
      setTotalCandidates(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold">LOGO</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-b-2 border-transparent hover:border-gray-300 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Home
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Upcoming Today
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center space-x-2">
              <span>+</span>
              <span>Add New Candidate</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span>Hi! Bob</span>
            </div>
          </div>

          {/* Loading & Error Handling */}
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">{error}</div>
          ) : (
            <CandidateTable candidates={candidates} />
          )}

          {/* Pagination */}
          {!loading && !error && candidates.length > 0 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={candidates.length < pageSize}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
