import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const CandidateForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    email: "",
    address: "",
    contactNumber: "",
    dob: "",
    images: []
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    
    if (validFiles.length <= 5) {
      setFormData({ ...formData, images: validFiles });
    }
  };

  const isFormValid = () => {
    return formData.images.length === 5;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 relative max-h-[70vh] overflow-auto">
        <button className="absolute top-2 right-2 text-red-500" onClick={onClose}>
          <FaTimes size={18} />
        </button>
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
                placeholder="Enter your full name"
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
                placeholder="Enter your NIC"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium text-xs text-gray-700 w-1/3">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your email"
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
                placeholder="Enter your address"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="font-medium text-xs text-gray-700 w-1/3">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your contact number"
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

            <div className="flex justify-between items-center">
              <label className="font-medium text-xs text-gray-700 w-1/3">Upload Photos (5 required)</label>
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {formData.images.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-10 h-10 object-cover border rounded"
                />
              ))}
            </div>
            {formData.images.length < 5 && (
              <p className="text-red-500 text-xs mt-2">Please select exactly 5 images.</p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button className="px-5 py-2 border rounded-lg bg-gray-300 text-xs text-gray-700 hover:bg-gray-400 focus:outline-none">
              Previous
            </button>
            <button
              className="px-5 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-blue-600 focus:outline-none"
              disabled={!isFormValid()}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;
