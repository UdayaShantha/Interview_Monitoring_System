import React, { useState, useEffect } from "react";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "./App.css";

const CandidateForm = ({ onClose }) => {
  const [step, setStep] = useState(1); 
  const [showSuccess, setShowSuccess] = useState(false); // Success message state
  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    email: "",
    address: "",
    contactNumber: "",
    dob: "",
    images: Array(5).fill(null),
    position: "",
    interviewDate: "",
    startTime: "",
    username: "",
    password: "",
    rePassword: "",
  });

  useEffect(() => {
    document.body.classList.add("hide-navbar"); 
    return () => {
      document.body.classList.remove("hide-navbar"); 
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleImageUpload = (index, event) => {
    const newImages = [...formData.images];
    const imageUrl = URL.createObjectURL(event.target.files[0]);
    if (isValidURL(imageUrl)) {
      newImages[index] = imageUrl;
      setFormData({ ...formData, images: newImages });
    } else {
      console.error("Invalid image URL");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); 
    setShowSuccess(true); // Show success message

    setTimeout(() => {
      setShowSuccess(false);
      navigate("/candidates"); // Redirect to candidate page
    }, 2000); // Delay of 2 seconds before redirecting
  };

  return (
    <motion.div
      className="modal"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        className="modal-content"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {showSuccess ? (
          <div className="success-popup">
            <h2>New Candidate Added Successfully!</h2>
          </div>
        ) : (
          <>
            {step === 1 && (
              <>
                <h2 className="form-title">Candidate Form</h2>
                <h3 className="form-subtitle">Personal Details</h3>
                <form>
                  <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>NIC:</label>
                    <input type="text" name="nic" placeholder="Enter NIC" value={formData.nic} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Address:</label>
                    <input type="text" name="address" placeholder="Enter Address" value={formData.address} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Contact Number:</label>
                    <input type="tel" name="contactNumber" placeholder="Enter Contact Number" value={formData.contactNumber} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Date Of Birth:</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Photos:</label>
                    <div className="image-upload">
                      {formData.images.map((image, index) => (
                        <div key={index} className="image-box">
                          {image ? <img src={image} alt="Preview" /> : <FaPlus className="plus-icon" />}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-buttons">
                    <motion.button type="button" className="back-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose}>
                      <FaArrowLeft /> Back
                    </motion.button>

                    <motion.button type="button" className="next-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep(2)}>
                      Next
                    </motion.button>
                  </div>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="form-title">Interview Schedule</h2>
                <form>
                  <div className="form-group">
                    <label>Position:</label>
                    <select name="position" onChange={handleChange} className="dropdown" value={formData.position}>
                      <option value="">Select Position</option>
                      <option value="Data Analytics">Data Analytics</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date:</label>
                    <input type="date" name="interviewDate" value={formData.interviewDate} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Start Time:</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                  </div>

                  <div className="form-buttons">
                    <motion.button type="button" className="back-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep(1)}>
                      <FaArrowLeft /> Back
                    </motion.button>

                    <motion.button type="button" className="next-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep(3)}>
                      Next
                    </motion.button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="form-title">Account Details</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Username:</label>
                    <input type="text" name="username" placeholder="Enter Username" value={formData.username} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Password:</label>
                    <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Re-enter Password:</label>
                    <input type="password" name="rePassword" placeholder="Re-enter Password" value={formData.rePassword} onChange={handleChange} />
                  </div>

                  <div className="form-buttons">
                    <motion.button type="button" className="back-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setStep(2)}>
                      <FaArrowLeft /> Back
                    </motion.button>

                    <motion.button type="submit" className="next-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      Submit
                    </motion.button>
                  </div>
                </form>
                
              </>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CandidateForm;



