
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProcessingScreen from "./ProcessingScreen";

function FarmAnalyzer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if we're editing an existing farm
  const editFarm = location.state?.editFarm;
  
  const [formData, setFormData] = useState({
    "farm-id": "",
    "farmer-id": "",
    "farmer-name": "",
    latitude: "",
    longitude: "",
    area: "",
    village: "",
    district: "",
    state: "",
    "main-crop": "",
  });

  useEffect(() => {
    // Load data in priority order: edit farm > saved data > user defaults
    if (editFarm) {
      // Pre-populate form with existing farm data
      setFormData({
        "farm-id": editFarm.farm_id || generateFarmId(),
        "farmer-id": editFarm.user_id || (user?.user_id || ""),
        "farmer-name": editFarm.farmer_name || (user?.name || ""),
        latitude: editFarm.latitude?.toString() || "",
        longitude: editFarm.longitude?.toString() || "",
        area: editFarm.area?.toString() || "",
        village: editFarm.village || "",
        district: editFarm.district || "",
        state: editFarm.state || "",
        "main-crop": editFarm.main_crop || "",
      });
    } else {
      // Try to load saved form data from localStorage
      const savedData = localStorage.getItem('farmAnalyzerFormData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(prevData => ({
            ...prevData,
            ...parsedData,
            // Always use current user info if available
            "farmer-id": user?.user_id || parsedData["farmer-id"] || "",
            "farmer-name": user?.name || parsedData["farmer-name"] || "",
          }));
        } catch (e) {
          console.error('Error loading saved form data:', e);
          // Fallback to user defaults
          setDefaultUserData();
        }
      } else {
        // Set default user data for new forms
        setDefaultUserData();
      }
    }
  }, [user, editFarm]);

  const setDefaultUserData = () => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        "farmer-id": user.user_id,
        "farmer-name": user.name,
        "farm-id": generateFarmId()
      }));
    }
  };

  // Save form data to localStorage whenever it changes (except when editing existing farm)
  useEffect(() => {
    if (!editFarm && formData["farm-id"]) {
      localStorage.setItem('farmAnalyzerFormData', JSON.stringify(formData));
    }
  }, [formData, editFarm]);

  const generateFarmId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `F${timestamp}${random}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'farmer-name', 'latitude', 'longitude', 'area',
      'village', 'district', 'state', 'main-crop'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        alert(`Please fill in the ${field.replace('-', ' ')} field.`);
        return false;
      }
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Latitude must be a number between -90 and 90');
      return false;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('Longitude must be a number between -180 and 180');
      return false;
    }

    // Validate area
    const area = parseFloat(formData.area);
    if (isNaN(area) || area <= 0) {
      alert('Area must be a positive number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    console.log("Form submitted:", formData);

    try {
      const response = await fetch("http://localhost:5000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Backend response:", result);

      // Clear saved form data on successful submission (only for new farms)
      if (!editFarm) {
        localStorage.removeItem('farmAnalyzerFormData');
      }

      // Navigate to processing screen
      navigate("/processing", {
        state: {
          task_id: result.task_id,
          initialProcessingStatus: result
        }
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      setIsProcessing(false);
      alert("Failed to submit farm data. Please try again.");
    }
  };

  const handleRegenerateFarmId = () => {
    setFormData(prevData => ({
      ...prevData,
      "farm-id": generateFarmId()
    }));
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      localStorage.removeItem('farmAnalyzerFormData');
      setFormData({
        "farm-id": generateFarmId(),
        "farmer-id": user?.user_id || "",
        "farmer-name": user?.name || "",
        latitude: "",
        longitude: "",
        area: "",
        village: "",
        district: "",
        state: "",
        "main-crop": "",
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prevData => ({
            ...prevData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          alert("Unable to get current location. Please enter coordinates manually.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (isProcessing) {
    return <ProcessingScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm flex justify-between items-start flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            {editFarm ? 'Edit Farm Details' : 'Farm Analysis'}
          </h1>
          <p className="text-slate-600 text-lg">
            {editFarm
              ? 'Update your farm information and run a new analysis'
              : 'Help us understand your farm to provide personalized recommendations'
            }
          </p>
        </div>

        {!editFarm && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 hover:text-slate-900 transition-all"
            >
              <i className="fas fa-broom"></i>
              Clear Form
            </button>
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6">

          {/* Basic Information Section */}
          <div className="mb-8">
            <div className="mb-4 pb-4 border-b border-slate-200">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <i className="fas fa-user text-teal-500"></i>
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="farm-id" className="block text-sm font-medium text-slate-700 mb-2">
                  Farm ID *
                  <span className="text-xs text-slate-500 font-normal">Unique identifier for your farm</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="farm-id"
                    name="farm-id"
                    value={formData["farm-id"]}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                    placeholder="Auto-generated ID"
                    required
                    readOnly={!!editFarm}
                  />
                  {!editFarm && (
                    <button
                      type="button"
                      onClick={handleRegenerateFarmId}
                      className="px-3 py-2 text-sm bg-transparent border border-slate-200 text-slate-700 rounded-md hover:bg-slate-100 transition-all"
                      title="Generate new Farm ID"
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="farmer-name" className="block text-sm font-medium text-slate-700 mb-2">
                  Farmer Name *
                </label>
                <input
                  type="text"
                  id="farmer-name"
                  name="farmer-name"
                  value={formData["farmer-name"]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-8">
            <div className="mb-4 pb-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-teal-500"></i>
                Farm Location
              </h3>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-transparent border border-slate-200 text-slate-700 rounded-md hover:bg-slate-100 transition-all"
              >
                <i className="fas fa-crosshairs"></i>
                Use Current Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 mb-2">
                  Latitude *
                  <span className="text-xs text-slate-500 font-normal">Decimal degrees (-90 to 90)</span>
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="e.g., 28.6139"
                  step="0.000001"
                  min="-90"
                  max="90"
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 mb-2">
                  Longitude *
                  <span className="text-xs text-slate-500 font-normal">Decimal degrees (-180 to 180)</span>
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="e.g., 77.2090"
                  step="0.000001"
                  min="-180"
                  max="180"
                  required
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-2">
                  Farm Area *
                  <span className="text-xs text-slate-500 font-normal">In hectares</span>
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="e.g., 5.5"
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-8">
            <div className="mb-4 pb-4 border-b border-slate-200">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <i className="fas fa-home text-teal-500"></i>
                Address Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-slate-700 mb-2">
                  Village/Town *
                </label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="Enter village or town name"
                  required
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-slate-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="Enter district name"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
                  placeholder="Enter state name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Crop Information Section */}
          <div className="mb-8">
            <div className="mb-4 pb-4 border-b border-slate-200">
              <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <i className="fas fa-seedling text-teal-500"></i>
                Crop Information
              </h3>
            </div>

            <div>
              <div>
                <label htmlFor="main-crop" className="block text-sm font-medium text-slate-700 mb-2">
                  Main Crop *
                  <span className="text-xs text-slate-500 font-normal">Primary crop you want to grow or are currently growing</span>
                </label>
                <select
                  id="main-crop"
                  name="main-crop"
                  value={formData["main-crop"]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
                  required
                >
                  <option value="">Select main crop</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Spices">Spices</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex gap-4 justify-between items-center mb-4 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 hover:text-slate-900 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-rocket"></i>
                    {editFarm ? 'Update & Analyze' : 'Start Analysis'}
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 flex items-start gap-2">
                <i className="fas fa-info-circle text-teal-500 mt-0.5 flex-shrink-0"></i>
                Your farm data is securely stored and will help us provide personalized recommendations
                based on your location, soil conditions, and climate patterns.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FarmAnalyzer;
