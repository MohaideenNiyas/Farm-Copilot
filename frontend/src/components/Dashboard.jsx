
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import nabardDatabase from "../data/nabard_complete_database_147_varieties.json";

// Add CSS animations
const fadeInStyle = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

function Dashboard() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [userFarms, setUserFarms] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalReports: 0,
    avgCarbonPotential: 0,
    lastAnalysis: null
  });

  // Function to match recommended crops with actual variety data from JSON
  const getVarietyData = (cropName, cropType) => {
    if (!cropName) return null;

    let searchArray = [];
    switch (cropType) {
      case 'rice':
        searchArray = nabardDatabase.rice_varieties || [];
        break;
      case 'agroforestry':
        searchArray = nabardDatabase.agroforestry_species || [];
        break;
      case 'crops':
        searchArray = nabardDatabase.crop_varieties || [];
        break;
      default:
        return null;
    }

    // Try exact name match first
    let variety = searchArray.find(item =>
      item.name?.toLowerCase() === cropName?.toLowerCase() ||
      item.variety_name?.toLowerCase() === cropName?.toLowerCase()
    );

    // If no exact match, try partial match
    if (!variety) {
      variety = searchArray.find(item =>
        item.name?.toLowerCase().includes(cropName?.toLowerCase()) ||
        item.variety_name?.toLowerCase().includes(cropName?.toLowerCase()) ||
        cropName?.toLowerCase().includes(item.name?.toLowerCase()) ||
        cropName?.toLowerCase().includes(item.variety_name?.toLowerCase())
      );
    }

    return variety;
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's farms
      const farmsResponse = await fetch('http://localhost:5000/api/farms', {
        headers: getAuthHeaders()
      });
      
      if (farmsResponse.ok) {
        const farms = await farmsResponse.json();
        setUserFarms(farms);
        
        // Fetch reports for each farm
        const allReports = [];
        for (const farm of farms) {
          try {
            const reportsResponse = await fetch(`http://localhost:5000/api/farms/${farm.farm_id}/reports`, {
              headers: getAuthHeaders()
            });
            if (reportsResponse.ok) {
              const reports = await reportsResponse.json();
              allReports.push(...reports.map(report => ({ ...report, farm })));
            }
          } catch (err) {
            console.error(`Error fetching reports for farm ${farm.farm_id}:`, err);
          }
        }
        
        setRecentReports(allReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
        
        // Calculate stats
        const totalCarbonPotential = allReports.reduce((sum, report) => {
          const carbonData = report.report_data?.report?.carbon_revenue?.realistic_carbon_potential_t_ha || 0;
          return sum + carbonData;
        }, 0);
        
        setStats({
          totalFarms: farms.length,
          totalReports: allReports.length,
          avgCarbonPotential: allReports.length > 0 ? (totalCarbonPotential / allReports.length).toFixed(2) : 0,
          lastAnalysis: allReports.length > 0 ? new Date(allReports[0].created_at).toLocaleDateString() : null
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFarm = () => {
    navigate("/farm-analyzer");
  };

  const handleExploreZones = () => {
    navigate("/zone-analysis");
  };

  const handleViewReport = (report) => {
    const newReport = selectedReport?.report_id === report.report_id ? null : report;
    setSelectedReport(newReport);
    setSelectedCropDetail(null); // Reset crop detail when changing reports

    // Add smooth animation to the farm details section
    if (newReport) {
      // Animate the entire farm details section entrance
      setTimeout(() => {
        const farmDetailsSection = document.querySelector('.farm-details-section');
        if (farmDetailsSection) {
          farmDetailsSection.style.opacity = '0';
          farmDetailsSection.style.transform = 'translateY(30px)';
          farmDetailsSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

          // Trigger reflow
          farmDetailsSection.offsetHeight;

          setTimeout(() => {
            farmDetailsSection.style.opacity = '1';
            farmDetailsSection.style.transform = 'translateY(0)';
          }, 50);
        }

        // Animate the crop recommendations section specifically
        const cropSection = document.getElementById('crop-recommendations-section');
        if (cropSection) {
          cropSection.style.opacity = '0';
          cropSection.style.transform = 'translateY(20px) scale(0.95)';
          cropSection.style.transition = 'all 0.3s ease-out 0.2s';

          setTimeout(() => {
            cropSection.style.opacity = '1';
            cropSection.style.transform = 'translateY(0) scale(1)';
          }, 300);
        }

        // Smooth scroll to farm details section
        setTimeout(() => {
          const farmDetailsSection = document.querySelector('.farm-details-section');
          if (farmDetailsSection) {
            // Add visual highlight effect
            farmDetailsSection.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
            farmDetailsSection.style.transition = 'box-shadow 0.3s ease';

            // Scroll to the section with offset
            const yOffset = -90; // 20px offset from top
            const elementTop = farmDetailsSection.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementTop + yOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Remove highlight after animation
            setTimeout(() => {
              farmDetailsSection.style.boxShadow = '';
            }, 1000);
          }
        }, 200);
      }, 10);
    }
  };

  const handleViewFullReport = (report) => {
    navigate("/recommendations", {
      state: {
        rawReportContent: {
          farm_id: report.farm_id,
          report: report.report_data.report,
          visualization: report.report_data.visualization
        }
      }
    });
  };

  const handleCropClick = (crop) => {
    // Show detailed crop information in modal similar to Database Explorer
    

    if (crop && selectedReport) {
      // Determine crop type and get actual data from JSON
      let cropType = 'rice';
      if (crop.crop_name || (!crop.variety_name && !crop.tree_name)) {
        cropType = 'crops';
      } else if (crop.tree_name) {
        cropType = 'agroforestry';
      }

      const actualCropData = getVarietyData(crop.variety_name || crop.crop_name || crop.tree_name || crop.name, cropType);

      // Use the actual crop data from JSON with recommendation data as fallback
      const cropData = {
        ...crop,
        // Use actual data from the crop object
        name: crop.variety_name || crop.crop_name || crop.tree_name || crop.name,
        type: crop.variety_name ? 'Rice Variety' : crop.crop_name ? 'Crop' : 'Agroforestry',
        category: crop.variety_name ? 'rice' : crop.crop_name ? 'crops' : 'agroforestry',
        // Use actual fields from the crop data - map correct field names based on crop type
        suitability_score: crop.suitability_score || crop.confidence_level || 0,
        confidence_score: crop.confidence_score || crop.suitability_score || 0,

        // Map duration field correctly based on crop type - prefer JSON data
        duration_days: actualCropData?.duration_days || actualCropData?.maturity_years || crop.duration_days || crop.maturity_years || null,
        growth_duration: (actualCropData?.duration_days || crop.duration_days) ? `${actualCropData?.duration_days || crop.duration_days} days` :
                        (actualCropData?.maturity_years || crop.maturity_years) ? `${actualCropData?.maturity_years || crop.maturity_years} years` :
                        'Not specified',

        // Map yield field correctly based on crop type - prefer JSON data
        yield_potential: actualCropData?.yield_potential || actualCropData?.density_per_ha || crop.yield_potential || crop.density_per_ha || null,
        expected_yield: (actualCropData?.yield_potential || crop.yield_potential) ? `${actualCropData?.yield_potential || crop.yield_potential}` :
                        (actualCropData?.density_per_ha || crop.density_per_ha) ? `${actualCropData?.density_per_ha || crop.density_per_ha} trees/ha` : 'Not specified',

        // Other fields - prefer JSON data over recommendation data
        market_price: actualCropData?.market_value || crop.market_value || 'Not specified',
        carbon_potential: actualCropData?.carbon_potential || crop.carbon_potential || 'Not specified',
        water_requirement: actualCropData?.water_requirement || crop.water_requirement || 'Not specified',
        soil_preference: actualCropData?.soil_preference || actualCropData?.soil_requirement || crop.soil_preference || crop.soil_requirement || 'Not specified',
        planting_season: actualCropData?.planting_season || actualCropData?.season || crop.planting_season || crop.season || 'Not specified',
        spacing: actualCropData?.spacing || crop.spacing || 'Not specified',
        management: actualCropData?.management || crop.management || 'Not specified',
        special_features: actualCropData?.special_features || crop.special_features || 'Not specified',

        // Use actual description if available, otherwise create from available data
        description: crop.description || `This ${crop.variety_name ? 'rice variety' : crop.crop_name ? 'crop' : 'agroforestry species'} is recommended for your farm based on soil analysis, climate conditions, and carbon sequestration potential.`,
        // Use actual benefits if available
        key_benefits: crop.key_benefits || crop.benefits || crop.advantages || [
          `Suitable for your farm conditions`,
          `Good yield potential`,
          `Carbon sequestration benefits`
        ]
      };

      setSelectedCropDetail(cropData);
      setShowCropModal(true);

      // Smooth scroll to crop information section with improved timing
      const scrollToCropInfo = () => {
        const cropInfoSection = document.getElementById('crop-info-section');
        if (cropInfoSection) {
          // Add a small visual highlight effect
          cropInfoSection.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.3)';
          cropInfoSection.style.borderColor = 'rgb(34, 197, 94)';
          cropInfoSection.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';

          // Scroll to the element with a small offset from top for better UX
          const yOffset = -75; // 20px offset from top
          const elementTop = cropInfoSection.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementTop + yOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Remove the highlight after animation completes
          setTimeout(() => {
            cropInfoSection.style.boxShadow = '';
            cropInfoSection.style.borderColor = '';
          }, 1000);
        } else {
          // If element doesn't exist yet, retry after a short delay
          setTimeout(scrollToCropInfo, 50);
        }
      };

      // Initial attempt after component likely renders
      setTimeout(scrollToCropInfo, 150);
    }
  };

  const handleViewFarm = (farm) => {
    // Navigate to farm details or analysis
    navigate("/farm-analyzer", { state: { editFarm: farm } });
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style>{fadeInStyle}</style>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user?.name}! 🌾
          </h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Revolutionary recommendation engine with complete 147-variety database,
            true variety matching algorithms, comprehensive 15-zone analysis,
            and dynamic carbon potential calculations.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              🏭
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalFarms}</div>
              <div className="text-gray-600 text-sm font-medium">Total Farms</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalReports}</div>
              <div className="text-gray-600 text-sm font-medium">Analyses Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
              🌱
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgCarbonPotential}</div>
              <div className="text-gray-600 text-sm font-medium">Avg Carbon Potential (t/ha)</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
              📅
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.lastAnalysis || 'None'}</div>
              <div className="text-gray-600 text-sm font-medium">Last Analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          Quick Actions
          <div className="w-2 h-8 bg-green-500 rounded-full"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            className="bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg group"
            onClick={handleAnalyzeFarm}
          >
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔬
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze Farm</h3>
            <p className="text-gray-600">Get AI-powered recommendations with 147 varieties</p>
          </button>

          <button
            className="bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg group"
            onClick={handleExploreZones}
          >
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
              🗺️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Zones</h3>
            <p className="text-gray-600">Comprehensive analysis of all 15 agro-climatic zones</p>
          </button>

          <button
            className="bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg group"
            onClick={() => navigate("/database-explorer")}
          >
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
              🗃️
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Database Explorer</h3>
            <p className="text-gray-600">Search and compare from 147 varieties database</p>
          </button>
        </div>
      </div>


      {/* Recent Reports Section */}
      {recentReports.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            Recent Analysis Reports
            <div className="w-2 h-8 bg-green-500 rounded-full"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <div key={report.report_id} className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                selectedReport?.report_id === report.report_id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}>
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">{report.farm_id}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Carbon Potential:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {report.report_data?.report?.carbon_revenue?.realistic_carbon_potential_t_ha || 'N/A'} t/ha
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {report.farm?.village}, {report.farm?.district}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 font-medium px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedReport?.report_id === report.report_id
                        ? 'border-2 border-green-500 text-green-600 bg-green-100 shadow-lg'
                        : 'border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 hover:shadow-md'
                    }`}
                    onClick={() => handleViewReport(report)}
                  >
                    <i className={`fas ${selectedReport?.report_id === report.report_id ? 'fa-eye-slash' : 'fa-eye'} mr-2`}></i>
                    {selectedReport?.report_id === report.report_id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    onClick={() => handleViewFullReport(report)}
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    View Full Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farm Details Section */}
      {selectedReport && (
        <div className="mb-8 animate-fadeIn farm-details-section">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            Farm Analysis Details
            <div className="w-2 h-8 bg-green-500 rounded-full"></div>
          </h2>

          {/* Farm Summary */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="fas fa-file-alt text-green-500"></i>
              Analysis Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedReport.report_data?.report?.final_summary ||
               selectedReport.report_data?.metadata?.summary ||
               "This farm shows excellent potential for sustainable agriculture with diversified crop recommendations. The analysis considers soil health, climate conditions, and carbon sequestration potential to provide personalized farming recommendations."}
            </p>
          </div>

          {/* Farm Overview - Simplified */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-farm text-green-500"></i>
              Farm Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Farm ID</div>
                <div className="font-semibold text-gray-900">{selectedReport.farm_id}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Location</div>
                <div className="font-semibold text-gray-900">
                  {selectedReport.farm?.village}, {selectedReport.farm?.district}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Area</div>
                <div className="font-semibold text-gray-900">{selectedReport.farm?.area || 'N/A'} ha</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Main Crop</div>
                <div className="font-semibold text-gray-900">{selectedReport.farm?.main_crop || 'N/A'}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg md:col-span-1">
                <div className="text-sm text-green-600 mb-1">Carbon Potential</div>
                <div className="font-semibold text-green-600">
                  {selectedReport.report_data?.report?.carbon_revenue?.realistic_carbon_potential_t_ha || 'N/A'} t/ha
                </div>
              </div>
            </div>
          </div>

          {/* Crop Recommendations */}
          {selectedReport.report_data?.report?.recommendations && (
            <div id="crop-recommendations-section" className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-seedling text-green-500"></i>
                Recommended Crops for This Farm
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rice Varieties */}
                {selectedReport.report_data.report.recommendations.rice_varieties && selectedReport.report_data.report.recommendations.rice_varieties.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-teal-600 mb-3 flex items-center gap-2">
                      <i className="fas fa-seedling text-teal-500"></i>
                      Rice Varieties
                    </h4>
                    <div className="space-y-3">
                      {selectedReport.report_data.report.recommendations.rice_varieties.slice(0, 3).map((variety, index) => {
                        // Get actual variety data from JSON
                        const actualVarietyData = getVarietyData(variety.variety_name || variety.name, 'rice');

                        return (
                          <div
                            key={index}
                            className="bg-teal-50 border border-teal-200 rounded-lg p-3 cursor-pointer hover:bg-teal-100 hover:border-teal-300 transition-all duration-200 hover:shadow-md"
                            onClick={() => handleCropClick(variety)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-teal-800">
                                {variety.variety_name || variety.name || `Variety ${index + 1}`}
                              </h5>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                                variety.suitability_score > 0.8 ? 'bg-green-500' :
                                variety.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              }`}>
                                {variety.suitability_score > 0.8 ? 'High' : variety.suitability_score > 0.6 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                            <div className="text-sm text-teal-700 space-y-1">
                              {actualVarietyData?.yield_potential && (
                                <div>Yield: {actualVarietyData.yield_potential}</div>
                              )}
                              {actualVarietyData?.duration_days && (
                                <div>Duration: {actualVarietyData.duration_days} days</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Other Crops */}
                {selectedReport.report_data.report.recommendations.crops && selectedReport.report_data.report.recommendations.crops.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
                      <i className="fas fa-leaf text-amber-500"></i>
                      Other Crops
                    </h4>
                    <div className="space-y-3">
                      {selectedReport.report_data.report.recommendations.crops.slice(0, 3).map((crop, index) => {
                        // Get actual crop data from JSON
                        const actualCropData = getVarietyData(crop.crop_name || crop.name, 'crops');

                        return (
                          <div
                            key={index}
                            className="bg-amber-50 border border-amber-200 rounded-lg p-3 cursor-pointer hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 hover:shadow-md"
                            onClick={() => handleCropClick(crop)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-amber-800">
                                {crop.variety_name || crop.crop_name || crop.name || `Crop ${index + 1}`}
                              </h5>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                                crop.suitability_score > 0.8 ? 'bg-green-500' :
                                crop.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              }`}>
                                {crop.suitability_score > 0.8 ? 'High' : crop.suitability_score > 0.6 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                            <div className="text-sm text-amber-700 space-y-1">
                              {actualCropData?.yield_potential && (
                                <div>Yield: {actualCropData.yield_potential}</div>
                              )}
                              {actualCropData?.duration_days && (
                                <div>Duration: {actualCropData.duration_days} days</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agroforestry */}
                {selectedReport.report_data.report.recommendations.agroforestry && selectedReport.report_data.report.recommendations.agroforestry.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <i className="fas fa-tree text-green-500"></i>
                      Agroforestry
                    </h4>
                    <div className="space-y-3">
                      {selectedReport.report_data.report.recommendations.agroforestry.slice(0, 3).map((tree, index) => {
                        // Get actual agroforestry data from JSON
                        const actualTreeData = getVarietyData(tree.tree_name || tree.name, 'agroforestry');

                        return (
                          <div
                            key={index}
                            className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                            onClick={() => handleCropClick(tree)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-green-800">
                                {tree.variety_name || tree.tree_name || tree.name || `Tree ${index + 1}`}
                              </h5>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                                tree.suitability_score > 0.8 ? 'bg-green-500' :
                                tree.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              }`}>
                                {tree.suitability_score > 0.8 ? 'High' : tree.suitability_score > 0.6 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                            <div className="text-sm text-green-700 space-y-1">
                              {actualTreeData?.carbon_potential && (
                                <div>Carbon: {actualTreeData.carbon_potential}</div>
                              )}
                              {actualTreeData?.maturity_years && (
                                <div>Duration: {actualTreeData.maturity_years} years</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crop Information Section */}
          <div id="crop-info-section" className="mt-6">
            {selectedCropDetail && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-fadeIn">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedCropDetail.variety_name || selectedCropDetail.crop_name || selectedCropDetail.tree_name || selectedCropDetail.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full text-white ${
                        (selectedCropDetail.suitability_score || 0) > 0.8 ? 'bg-green-500' :
                        (selectedCropDetail.suitability_score || 0) > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        {(selectedCropDetail.suitability_score || 0) > 0.8 ? 'High' : (selectedCropDetail.suitability_score || 0) > 0.6 ? 'Medium' : 'Low'} Suitability
                      </span>
                      <span className="text-sm text-gray-600">
                        Confidence: {Math.round((selectedCropDetail.confidence_score || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCropDetail(null);
                      setShowCropModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Details */}
                  <div className="lg:col-span-2">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {selectedCropDetail.description || `${selectedCropDetail.variety_name || selectedCropDetail.name} is a high-performing variety with excellent suitability for your farm conditions, offering good yield potential and market value.`}
                    </p>

                    {/* Basic Information Section */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-600 mb-1">Duration</div>
                          <div className="text-lg font-bold text-slate-900">
                            {selectedCropDetail.growth_duration}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-600 mb-1">Yield Potential</div>
                          <div className="text-lg font-bold text-slate-900">
                            {selectedCropDetail.expected_yield}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-600 mb-1">Carbon Potential</div>
                          <div className="text-lg font-bold text-slate-900">
                            {selectedCropDetail.carbon_potential}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-600 mb-1">Market Value</div>
                          <div className="text-lg font-bold text-slate-900">
                            {selectedCropDetail.market_value}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Agronomic Details */}
                    {(selectedCropDetail.water_requirement || selectedCropDetail.soil_preference || selectedCropDetail.planting_season || selectedCropDetail.spacing) && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                          Agronomic Details
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedCropDetail.water_requirement && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-blue-700 mb-1">Water Requirement</div>
                              <div className="text-slate-900">{selectedCropDetail.water_requirement}</div>
                            </div>
                          )}
                          {selectedCropDetail.soil_preference && (
                            <div className="bg-amber-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-amber-700 mb-1">Soil Preference</div>
                              <div className="text-slate-900">{selectedCropDetail.soil_preference}</div>
                            </div>
                          )}
                          {selectedCropDetail.planting_season && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-green-700 mb-1">Planting Season</div>
                              <div className="text-slate-900">{selectedCropDetail.planting_season}</div>
                            </div>
                          )}
                          {selectedCropDetail.spacing && (
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-purple-700 mb-1">Spacing</div>
                              <div className="text-slate-900">{selectedCropDetail.spacing}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {selectedCropDetail.key_benefits && selectedCropDetail.key_benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-500"></i>
                          Key Benefits
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedCropDetail.key_benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                              <i className="fas fa-arrow-right text-green-400 text-sm mt-0.5"></i>
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Features */}
                    {selectedCropDetail.special_features && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-blue-600 mb-3 flex items-center gap-2">
                          <i className="fas fa-star text-blue-500"></i>
                          Special Features
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-slate-900 leading-relaxed">{selectedCropDetail.special_features}</div>
                        </div>
                      </div>
                    )}

                    {/* Management */}
                    {selectedCropDetail.management && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2">
                          <i className="fas fa-cog text-purple-500"></i>
                          Management Practices
                        </h4>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-slate-900 leading-relaxed">{selectedCropDetail.management}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Crop Visualization & Score */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-800 mb-3 text-center">Crop Type</h4>
                      <div className="relative h-24 bg-gradient-to-b from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            selectedCropDetail.name && selectedCropDetail.name.toLowerCase().includes('rice') ? 'bg-green-500' :
                            selectedCropDetail.category === 'crops' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}>
                            <i className={`text-white text-lg fas ${
                              selectedCropDetail.name && selectedCropDetail.name.toLowerCase().includes('rice') ? 'fa-seedling' :
                              selectedCropDetail.category === 'crops' ? 'fa-leaf' : 'fa-tree'
                            }`}></i>
                          </div>
                          <div className="text-xs font-medium text-gray-700">
                            {selectedCropDetail.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-sm font-medium text-slate-600 mb-2">Suitability Score</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Confidence Level</span>
                        <span className="font-semibold">{Math.round((selectedCropDetail.confidence_score || 0) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(selectedCropDetail.confidence_score || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          Platform Features
          <div className="w-2 h-8 bg-green-500 rounded-full"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Dynamic Scoring Algorithm</h3>
            <p className="text-gray-600 text-sm">Searches ALL 147 varieties for best farm matches</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🗺️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">15-Zone Analysis</h3>
            <p className="text-gray-600 text-sm">Detailed analysis of all 15 agro-climatic zones</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Scoring</h3>
            <p className="text-gray-600 text-sm">Suitability scoring with confidence levels</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🌱
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Database</h3>
            <p className="text-gray-600 text-sm">51 rice varieties, 53 agroforestry species, 43 crop varieties</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🔬
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Scientific Matching</h3>
            <p className="text-gray-600 text-sm">Based on soil, climate, zone, and carbon potential</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-green-300 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              📋
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">MRV Compliance</h3>
            <p className="text-gray-600 text-sm">Full recommendation reasoning for all 147 varieties</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
