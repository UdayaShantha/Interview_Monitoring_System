import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import DOMPurify from "dompurify";
import axios from "../axiosInstance"; 

const CandidateForm = ({ onClose, onSuccess, editMode = false, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    email: "",
    address: "",
    contactNumber: "",
    dob: "",
    images: [],
    position: "",
    date: "",
    startTime: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  
  // Add validation errors state
  const [errors, setErrors] = useState({
    name: "",
    nic: "",
    email: "",
    address: "",
    contactNumber: "",
    dob: "",
    images: "",
    position: "",
    date: "",
    startTime: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (editMode && initialData) {
      console.log("Initial data received:", initialData);
      
      // Format dates properly
      const formattedBirthday = initialData.birthday 
        ? new Date(initialData.birthday).toISOString().split('T')[0] 
        : "";
      
      const formattedScheduleDate = initialData.scheduleDate 
        ? new Date(initialData.scheduleDate).toISOString().split('T')[0] 
        : "";
      
      // Format time properly (ensure it's in HH:MM format)
      let formattedStartTime = initialData.startTime || "";
      if (formattedStartTime && !formattedStartTime.includes(":")) {
        // If time is not in HH:MM format, try to format it
        try {
          const [hours, minutes] = formattedStartTime.split(":");
          if (hours && minutes) {
            formattedStartTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          }
        } catch (e) {
          console.error("Error formatting time:", e);
        }
      }
      
      console.log("Formatted dates:", {
        birthday: formattedBirthday,
        scheduleDate: formattedScheduleDate,
        startTime: formattedStartTime
      });
      
      setFormData({
        name: initialData.name || "",
        nic: initialData.nic || "",
        email: initialData.email || "",
        address: initialData.address || "",
        contactNumber: initialData.phone || "",
        dob: formattedBirthday,
        images: [],
        position: initialData.positionType || "",
        date: formattedScheduleDate,
        startTime: formattedStartTime,
        username: initialData.username || "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [editMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // Validate field on change
    validateField(name, value);
  };
  
  // Validate a single field
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 3) {
          error = "Name must be at least 3 characters";
        }
        break;
      case "nic":
        if (!value.trim()) {
          error = "NIC is required";
        } else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(value.trim())) {
          error = "Invalid NIC format (e.g., 123456789V or 123456789012)";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = "Invalid email format";
        }
        break;
      case "address":
        if (!value.trim()) {
          error = "Address is required";
        }
        break;
      case "contactNumber":
        if (!value.trim()) {
          error = "Contact number is required";
        } else if (!/^[0-9]{10}$/.test(value.trim())) {
          error = "Contact number must be 10 digits";
        }
        break;
      case "dob":
        if (!value) {
          error = "Date of birth is required";
        } else {
          const dob = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          
          if (age < 18) {
            error = "Candidate must be at least 18 years old";
          }
        }
        break;
      case "position":
        if (!value) {
          error = "Position is required";
        }
        break;
      case "date":
        if (!value) {
          error = "Interview date is required";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = "Interview date cannot be in the past";
          }
        }
        break;
      case "startTime":
        if (!value) {
          error = "Start time is required";
        }
        break;
      case "username":
        if (!value.trim()) {
          error = "Username is required";
        } else if (value.trim().length < 4) {
          error = "Username must be at least 4 characters";
        }
        break;
      case "password":
        if ((!editMode || showPasswordFields) && !value) {
          error = "Password is required";
        } else if (value && value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;
      case "confirmPassword":
        if ((!editMode || showPasswordFields) && !value) {
          error = "Please confirm your password";
        } else if (value && value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    
    setErrors({ ...errors, [name]: error });
    return !error;
  };

  const handleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files).filter(file => {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, images: "Only JPG, PNG, and GIF files are allowed" });
        return false;
      }
      if (file.size > maxSize) {
        setErrors({ ...errors, images: "File size must be less than 5MB" });
        return false;
      }
      return true;
    });
    
    // Clear image error if validation passes
    if (newFiles.length > 0) {
      setErrors({ ...errors, images: "" });
    }
    
    const updatedFiles = [...formData.images, ...newFiles].slice(0, 5);
    setFormData({ ...formData, images: updatedFiles });
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = formData.images.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, images: updatedImages });
  };

  // Validate all fields in a step
  const validateStep = (step) => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (step === 1) {
      // Validate step 1 fields
      isValid = validateField("name", formData.name) && isValid;
      isValid = validateField("nic", formData.nic) && isValid;
      isValid = validateField("email", formData.email) && isValid;
      isValid = validateField("address", formData.address) && isValid;
      isValid = validateField("contactNumber", formData.contactNumber) && isValid;
      isValid = validateField("dob", formData.dob) && isValid;
      
      // Only validate images in non-edit mode
      if (!editMode && formData.images.length !== 5) {
        newErrors.images = "Please upload exactly 5 images";
        isValid = false;
      } else {
        newErrors.images = "";
      }
      
      // For debugging
      console.log("validateStep(1) result:", isValid);
      console.log("isStep1Valid() result:", isStep1Valid());
      
      // If we're in edit mode and isStep1Valid() returns true, force isValid to true
      if (editMode && isStep1Valid()) {
        isValid = true;
      }
    } else if (step === 2) {
      // Validate step 2 fields
      isValid = validateField("position", formData.position) && isValid;
      isValid = validateField("date", formData.date) && isValid;
      isValid = validateField("startTime", formData.startTime) && isValid;
    } else if (step === 3) {
      // Validate step 3 fields
      isValid = validateField("username", formData.username) && isValid;
      
      if (!editMode || showPasswordFields) {
        isValid = validateField("password", formData.password) && isValid;
        isValid = validateField("confirmPassword", formData.confirmPassword) && isValid;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const isStep1Valid = () => {
    console.log("isStep1Valid called");
    console.log("Form data:", formData);
    console.log("Errors:", errors);
    console.log("Edit mode:", editMode);
    
    const nameValid = formData.name && !errors.name;
    const nicValid = formData.nic && !errors.nic;
    const emailValid = formData.email && !errors.email;
    const addressValid = formData.address && !errors.address;
    const contactValid = formData.contactNumber && !errors.contactNumber;
    const dobValid = formData.dob && !errors.dob;
    const imagesValid = editMode ? true : (formData.images.length === 5 && !errors.images);
    
    console.log("Validation results:", {
      nameValid, nicValid, emailValid, addressValid, contactValid, dobValid, imagesValid
    });
    
    return nameValid && nicValid && emailValid && addressValid && contactValid && dobValid && imagesValid;
  };

  const isStep2Valid = () => {
    console.log("isStep2Valid called");
    console.log("Form data:", formData);
    console.log("Errors:", errors);
    
    const positionValid = formData.position && !errors.position;
    const dateValid = formData.date && !errors.date;
    const timeValid = formData.startTime && !errors.startTime;
    
    console.log("Validation results:", {
      positionValid, dateValid, timeValid
    });
    
    return positionValid && dateValid && timeValid;
  };

  const isStep3Valid = () => {
    console.log("isStep3Valid called");
    console.log("Form data:", formData);
    console.log("Errors:", errors);
    console.log("Edit mode:", editMode);
    console.log("Show password fields:", showPasswordFields);
    
    const usernameValid = formData.username && !errors.username;
    
    if (editMode) {
      const passwordValid = !showPasswordFields || 
        (formData.password && 
         formData.password === formData.confirmPassword && 
         !errors.password && 
         !errors.confirmPassword);
      
      console.log("Edit mode validation results:", {
        usernameValid, passwordValid
      });
      
      return usernameValid && passwordValid;
    } else {
      const passwordValid = formData.password && 
        formData.password === formData.confirmPassword &&
        !errors.password &&
        !errors.confirmPassword;
      
      console.log("New candidate validation results:", {
        usernameValid, passwordValid
      });
      
      return usernameValid && passwordValid;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateStep(3) || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      const birthday = formData.dob ? formatDate(formData.dob) : null;
      const scheduleDate = formData.date ? formatDate(formData.date) : null;
  
      const candidateData = {
        username: formData.username,
        password: formData.password || undefined,
        name: formData.name,
        nic: formData.nic,
        email: formData.email,
        address: formData.address,
        phone: formData.contactNumber,
        birthday: birthday,
        positionType: formData.position,
        scheduleDate: scheduleDate,
        startTime: formData.startTime
      };

      console.log("Submitting candidate data:", candidateData);

      if (editMode) {
        const response = await axios.put(
          `/users/hr/candidate/${initialData.userId}`,
          candidateData
        );
        console.log("Update response:", response.data);
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('candidate', new Blob([JSON.stringify(candidateData)], {
          type: 'application/json'
        }));
  
        formData.images.forEach((file) => {
          formDataToSend.append('photos', file);
        });
  
        await axios.post(
          '/users/hr/candidate/save', 
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
  
      if (onSuccess) {
        await onSuccess();
      }
      
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

  // Function to move to next step with validation
  const goToNextStep = (nextStep) => {
    console.log("goToNextStep called with nextStep:", nextStep);
    console.log("Current step:", currentStep);
    console.log("Form data:", formData);
    console.log("Errors:", errors);
    
    // First check if the current step is valid using the appropriate validation function
    let isCurrentStepValid = false;
    
    if (currentStep === 1) {
      isCurrentStepValid = isStep1Valid();
    } else if (currentStep === 2) {
      isCurrentStepValid = isStep2Valid();
    } else if (currentStep === 3) {
      isCurrentStepValid = isStep3Valid();
    }
    
    console.log("Current step validation result:", isCurrentStepValid);
    
    // If the current step is valid, proceed to the next step
    if (isCurrentStepValid) {
      console.log("Moving to next step:", nextStep);
      setCurrentStep(nextStep);
    } else {
      console.log("Validation failed, staying on current step");
      // Run validateStep to update any error messages
      validateStep(currentStep);
    }
  };

  return (
    <div className="space-y-4">
      {currentStep === 1 ? (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">{editMode ? 'Edit Candidate' : 'Candidate Registration Form'}</h2>
          <div className="border-b-2 border-gray-300 w-full mb-4"></div>
          <form>
            <div className="space-y-3">
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.name}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">NIC</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.nic ? 'border-red-500' : ''}`}
                    placeholder="Enter NIC number"
                    required
                  />
                </div>
                {errors.nic && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.nic}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.email}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="Enter residential address"
                    required
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.address}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Contact No</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.contactNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                {errors.contactNumber && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.contactNumber}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.dob ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.dob && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.dob}</p>}
              </div>

              {!editMode && (
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
                    className={`text-xs ${errors.images ? 'border-red-500' : ''}`}
                    accept="image/*"
                    disabled={formData.images.length >= 5}
                    required
                  />
                  {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="px-5 py-2 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 focus:outline-none disabled:opacity-50"
                disabled={!isStep1Valid()}
                onClick={() => goToNextStep(2)}
              >
                Next
              </button>
            </div>
          </form>
        </>
      ) : currentStep === 2 ? (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">Interview Schedule Details</h2>
          <div className="border-b-2 border-gray-300 w-full mb-4"></div>
          <form>
            <div className="space-y-3">
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.position ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                    <option value="DATA_ANALYTICS">Data Analyst</option>
                    <option value="QA">QA</option>
                  </select>
                </div>
                {errors.position && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.position}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Interview Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.date ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.date}</p>}
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.startTime ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.startTime && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.startTime}</p>}
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
                onClick={() => goToNextStep(3)}
              >
                Next
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-center mb-4">Account Credentials</h2>
          <div className="border-b-2 border-gray-300 w-full mb-4"></div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-xs text-gray-700 w-1/3">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="Enter username"
                    required
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.username}</p>}
              </div>

              {editMode ? (
                <div className="flex justify-between items-center">
                  <div className="w-1/3"></div>
                  <div className="w-2/3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {showPasswordFields ? "Hide Password Fields" : "Update Password"}
                    </button>
                  </div>
                </div>
              ) : null}

              {(showPasswordFields || !editMode) && (
                <>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-xs text-gray-700 w-1/3">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Enter password"
                        required={!editMode || showPasswordFields}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.password}</p>}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-xs text-gray-700 w-1/3">Re-enter Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-2/3 border p-2 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm password"
                        required={!editMode || showPasswordFields}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-auto w-2/3">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>

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
                ) : editMode ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CandidateForm;