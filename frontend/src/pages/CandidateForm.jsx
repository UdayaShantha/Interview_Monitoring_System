import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import DOMPurify from "dompurify";
import axios from "../axiosInstance"; 

const CandidateForm = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1 Data
    name: "",
    nic: "",
    email: "",
    address: "",
    contactNumber: "",
    dob: "",
    images: [],
    // Step 2 Data
    position: "",
    date: "",
    startTime: "",
    // Step 3 Data
    username: "",
    password: "",
    confirmPassword: ""
  });
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files).filter(file => {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type) || file.size > maxSize) {
        return false;
      }
      return true;
    });
    const updatedFiles = [...formData.images, ...newFiles].slice(0, 5);
    setFormData({ ...formData, images: updatedFiles });
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = formData.images.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, images: updatedImages });
  };

  // Validation functions
  const isStep1Valid = () => 
    formData.name &&
    formData.nic &&
    formData.email &&
    formData.address &&
    formData.contactNumber &&
    formData.dob &&
    formData.images.length === 5;

  const isStep2Valid = () => 
    formData.position && 
    formData.date && 
    formData.startTime;

  const isStep3Valid = () => 
    formData.username && 
    formData.password && 
    formData.password === formData.confirmPassword;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep3Valid() || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      // Convert dates to ISO format
      const birthday = formData.dob ? formatDate(formData.dob) : null;
      const scheduleDate = formData.date ? formatDate(formData.date) : null;
  
      // Match EXACT field names from CandidateSaveDTO
      const candidateData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        nic: formData.nic,
        email: formData.email,
        address: formData.address,
        phone: formData.contactNumber, // Map to 'phone' field
        birthday: birthday, // Map to 'birthday' field
        positionType: formData.position, // Ensure this matches enum values
        scheduleDate: scheduleDate,
        startTime: formData.startTime
      };
  
      const formDataToSend = new FormData();
      
      // Match backend's expected field names
      formDataToSend.append('candidate', new Blob([JSON.stringify(candidateData)], {
        type: 'application/json'
      }));
  
      formData.images.forEach((file) => {
        formDataToSend.append('photos', file);
      });
  
      const response = await axios.post(
        '/users/hr/candidate/save', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log('Success:', response.data);
      onClose();
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      alert(`Error: ${error.response?.data?.message || 'Failed to save candidate'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 relative max-h-[70vh] overflow-auto">
        <button className="absolute top-2 right-2 text-red-500" onClick={onClose}>
          <FaTimes size={18} />
        </button>

        {currentStep === 1 ? (
          // Step 1: Personal Information
          <>
            <h2 className="text-xl font-semibold text-center mb-4">Candidate Registration Form</h2>
            <div className="border-b-2 border-gray-300 w-full mb-4"></div>
            <form>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter NIC number"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter residential address"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Contact No</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-medium text-xs text-gray-700 mb-2">Upload Images (5 required)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={file ? DOMPurify.sanitize(URL.createObjectURL(file)) : ""}
                          alt={`upload ${index}`}
                          className="h-12 w-12 object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    className="text-xs"
                    accept="image/*"
                    disabled={formData.images.length >= 5}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-5 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 focus:outline-none disabled:opacity-50"
                  disabled={!isStep1Valid()}
                  onClick={() => setCurrentStep(2)}
                >
                  Next
                </button>
              </div>
            </form>
          </>
        ) : currentStep === 2 ? (
          // Step 2: Interview Details
          <>
            <h2 className="text-xl font-semibold text-center mb-4">Interview Schedule Details</h2>
            <div className="border-b-2 border-gray-300 w-full mb-4"></div>
            <form>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Position</option>
                    <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                    <option value="DATA_ANALYTICS">Data Analyst</option>
                    <option value="QA">QA</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Interview Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="px-5 py-2 border rounded-lg bg-gray-300 text-xs text-gray-700 hover:bg-gray-400 focus:outline-none"
                  onClick={() => setCurrentStep(1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 focus:outline-none disabled:opacity-50"
                  disabled={!isStep2Valid()}
                  onClick={() => setCurrentStep(3)}
                >
                  Next
                </button>
              </div>
            </form>
          </>
        ) : (
          // Step 3: Credentials
          <>
            <h2 className="text-xl font-semibold text-center mb-4">Account Credentials</h2>
            <div className="border-b-2 border-gray-300 w-full mb-4"></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter username"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Re-enter Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {formData.password && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-2">Passwords do not match</p>
              )}

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="px-5 py-2 border rounded-lg bg-gray-300 text-xs text-gray-700 hover:bg-gray-400 focus:outline-none"
                  onClick={() => setCurrentStep(2)}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 focus:outline-none ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!isStep3Valid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateForm; 