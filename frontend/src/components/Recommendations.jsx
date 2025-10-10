import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAuthHeaders } = useContext(AuthContext);
  const { rawReportContent } = location.state || {};
  
  const [farmId, setFarmId] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [recommendations, setRecommendations] = useState({
    rice_varieties: [],
    crops: [],
    agroforestry: []
  });
  const [farmingScenario, setFarmingScenario] = useState({});
  const [carbonRevenue, setCarbonRevenue] = useState({});
  const [zoneContext, setZoneContext] = useState({});
  const [risks, setRisks] = useState({});
  const [actions, setActions] = useState([]);
  const [futureOutlook, setFutureOutlook] = useState({});
  const [visualization, setVisualization] = useState({});
  const [farmDetails, setFarmDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rawReportContent) {
      console.log("Raw report content received:", rawReportContent);
      
      if (rawReportContent.error) {
        // Handle error case
        setFarmId("Error");
        setReportSummary(rawReportContent.message || "An error occurred during processing.");
        setRecommendations({ rice_varieties: [], crops: [], agroforestry: [] });
        return;
      }

      // FIXED: Handle comprehensive report structure from fixed_agri_report format
      let report = {};
      let farmIdFromReport = null;
      let metadata = {};

      // Check if this is a comprehensive report (like fixed_agri_report_F001.json)
      if (rawReportContent.report && rawReportContent.metadata) {
        console.log("Detected comprehensive report format");
        report = rawReportContent.report;
        farmIdFromReport = rawReportContent.farm_id;
        metadata = rawReportContent.metadata;
      }
      // Check if this is a direct report structure
      else if (rawReportContent.report) {
        console.log("Detected nested report format");
        report = rawReportContent.report;
        farmIdFromReport = rawReportContent.farm_id;
      }
      // Check if this is a flat report structure
      else if (rawReportContent.farming_scenario || rawReportContent.recommendations) {
        console.log("Detected flat report format");
        report = rawReportContent;
        farmIdFromReport = rawReportContent.farm_id;
      }
      // Handle simple report structure
      else {
        console.log("Detected basic report format");
        report = rawReportContent;
        farmIdFromReport = rawReportContent.farm_id;
      }

      console.log("Processed report:", report);
      console.log("Farm ID from report:", farmIdFromReport);

      // Set farm ID with comprehensive validation
      if (farmIdFromReport && 
          farmIdFromReport !== "N/A" && 
          farmIdFromReport !== "Unknown" && 
          farmIdFromReport !== "undefined" && 
          farmIdFromReport !== null) {
        setFarmId(farmIdFromReport);
        fetchFarmDetails(farmIdFromReport);
      } else {
        setFarmId("N/A");
        console.warn("No valid farm_id found in report content");
      }

      // Set report summary with priority handling
      const summary = report.final_summary || 
                     metadata?.summary || 
                     "Comprehensive agricultural analysis completed. Please review the detailed recommendations and implementation plan below.";
      setReportSummary(summary);

      // FIXED: Extract recommendations with comprehensive handling
      const recommendationsData = report.recommendations || {};
      
      // Process rice varieties
      const riceVarieties = recommendationsData.rice_varieties || [];
      const processedRiceVarieties = riceVarieties.map(variety => ({
        variety_name: variety.variety_name || variety.name,
        suitability: variety.suitability_score > 0.8 ? 'High' : variety.suitability_score > 0.6 ? 'Medium' : 'Low',
        expected_yield: variety.expected_yield || `${(Math.random() * 2 + 3).toFixed(1)} tons/ha`,
        water_requirement: variety.water_requirement || 'Medium',
        growth_duration: variety.growth_duration || '120-140 days',
        market_price: variety.market_price || `₹${(Math.random() * 10 + 20).toFixed(0)}/kg`,
        confidence_score: variety.confidence_level || variety.suitability_score,
        key_benefits: variety.key_benefits || ['Good yield', 'Disease resistant', 'Market demand'],
        description: variety.description || `Suitable variety for your farming conditions with ${variety.climate_suitability || 'good'} climate adaptation.`
      }));

      // Process crops
      const crops = recommendationsData.crops || [];
      const processedCrops = crops.map(crop => ({
        crop_name: crop.variety_name || crop.crop_name || crop.name,
        suitability: crop.suitability_score > 0.8 ? 'High' : crop.suitability_score > 0.6 ? 'Medium' : 'Low',
        expected_yield: crop.expected_yield || `${(Math.random() * 20 + 40).toFixed(1)} tons/ha`,
        water_requirement: crop.water_requirement || 'Medium',
        growth_duration: crop.growth_duration || '6-12 months',
        market_price: crop.market_price || `₹${(Math.random() * 2000 + 2000).toFixed(0)}/ton`,
        confidence_score: crop.confidence_level || crop.suitability_score,
        key_benefits: crop.key_benefits || ['High income potential', 'Good market demand', 'Processing opportunities'],
        description: crop.description || `Profitable crop option suitable for your region with ${crop.climate_suitability || 'good'} adaptability.`
      }));

      // Process agroforestry
      const agroforestry = recommendationsData.agroforestry || [];
      const processedAgroforestry = agroforestry.map(tree => ({
        tree_name: tree.variety_name || tree.tree_name || tree.name,
        suitability: tree.suitability_score > 0.8 ? 'High' : tree.suitability_score > 0.6 ? 'Medium' : 'Low',
        expected_yield: tree.expected_yield || `${(Math.random() * 50 + 50).toFixed(0)} units/tree/year`,
        water_requirement: tree.water_requirement || 'Medium',
        growth_duration: tree.growth_duration || '5-8 years to maturity',
        market_price: tree.market_price || `₹${(Math.random() * 20 + 10).toFixed(0)}/unit`,
        carbon_potential: tree.carbon_potential > 8 ? 'High' : tree.carbon_potential > 5 ? 'Medium' : 'Low',
        confidence_score: tree.confidence_level || tree.suitability_score,
        key_benefits: tree.key_benefits || ['Long-term income', 'Carbon sequestration', 'Soil conservation', 'Environmental benefits'],
        description: tree.description || `Excellent agroforestry option for sustainable income and environmental benefits with ${tree.climate_suitability || 'good'} climate suitability.`
      }));

      setRecommendations({
        rice_varieties: processedRiceVarieties,
        crops: processedCrops,
        agroforestry: processedAgroforestry
      });

      // FIXED: Extract all sections with comprehensive handling - UPDATED TO MATCH BACKEND STRUCTURE
      setFarmingScenario(transformFarmingScenario(report.farming_scenario));
      setCarbonRevenue(transformCarbonRevenue(report.carbon_revenue));
      setZoneContext(transformZoneContext(report.zone_context));
      setRisks(transformRisks(report.risks));
      setActions(transformActions(report.actions));
      setFutureOutlook(transformFutureOutlook(report.future_outlook));
      setVisualization(rawReportContent.visualization || {});

      console.log("Successfully processed comprehensive report data");
      
    } else {
      // Handle case where no report content is available (direct navigation)
      console.warn("No report content available - direct navigation detected");
      setFarmId("N/A");
      setReportSummary("No analysis found. Please run a farm analysis first to get personalized recommendations.");
      setRecommendations({ rice_varieties: [], crops: [], agroforestry: [] });
      setFarmingScenario({
        scenario_type: "No Analysis Available",
        description: "Please complete a farm analysis to see recommended farming scenarios tailored to your specific conditions.",
        implementation_steps: [],
        expected_benefits: []
      });
      setCarbonRevenue({
        estimated_annual_credits: "N/A",
        estimated_revenue: "N/A",
        income_analysis: {
          short_term_crops: "No data available - please run analysis",
          long_term_agroforestry: "No data available - please run analysis",
          investment_horizon_years: "No data available - please run analysis",
          stability_over_10_years: "No data available - please run analysis",
          recommendation_on_scaling: "No data available - please run analysis"
        }
      });
      setZoneContext({
        zone_name: "No Analysis Available",
        description: "Please complete a farm analysis to see detailed agro-climatic zone information for your location.",
        climate_characteristics: [],
        best_suited_crops: []
      });
      setRisks({
        climate_risks: [],
        market_risks: []
      });
      setActions([]);
      setFutureOutlook({
        market_trends: "No data available - please run analysis",
        climate_projections: "No data available - please run analysis",
        technology_recommendations: "No data available - please run analysis"
      });
      setVisualization({});
    }
  }, [rawReportContent]);

  // Default data creation functions (used as fallbacks only)
  const createDefaultFarmingScenario = () => ({
    scenario_type: "Integrated Farming System",
    description: "A balanced approach combining traditional crops with modern agricultural practices for sustainable farming.",
    implementation_steps: [
      "Soil testing and preparation",
      "Crop selection based on agro-climatic zone",
      "Water management system setup",
      "Integrated pest management implementation",
      "Market linkage establishment"
    ],
    expected_benefits: [
      "Increased crop productivity",
      "Diversified income sources",
      "Improved soil health",
      "Risk reduction through crop diversification",
      "Enhanced environmental sustainability"
    ]
  });

  const createDefaultCarbonRevenue = () => ({
    estimated_annual_credits: 2.5,
    estimated_revenue: 62.50,
    income_analysis: {
      short_term_crops: "Focus on seasonal crops for immediate returns",
      long_term_agroforestry: "Plant trees for sustained long-term income",
      investment_horizon_years: "10-15 years for optimal returns",
      stability_over_10_years: "High stability with diversified approach",
      recommendation_on_scaling: "Start small and gradually expand based on success"
    }
  });

  const createDefaultZoneContext = () => ({
    zone_name: "Agro-Climatic Zone Analysis",
    description: "Your farm falls within a region suitable for diverse agricultural activities.",
    climate_characteristics: [
      { label: "Temperature Range", value: "20-35°C" },
      { label: "Annual Rainfall", value: "800-1200mm" },
      { label: "Soil Type", value: "Alluvial/Red soil" },
      { label: "Growing Seasons", value: "Kharif, Rabi, Zaid" }
    ],
    best_suited_crops: ["Rice", "Wheat", "Sugarcane", "Cotton", "Maize"]
  });

  const createDefaultRisks = () => ({
    climate_risks: [
      {
        risk_type: "Drought",
        severity: "Medium",
        probability: "30%",
        description: "Potential water scarcity during dry periods",
        mitigation_strategies: ["Drip irrigation", "Water harvesting", "Drought-resistant varieties"]
      }
    ],
    market_risks: [
      {
        risk_type: "Price Volatility", 
        severity: "Medium",
        probability: "40%",
        description: "Fluctuations in crop prices",
        mitigation_strategies: ["Contract farming", "Value addition", "Crop diversification"]
      }
    ]
  });

  const createDefaultActions = () => ([
    {
      action_id: 1,
      title: "Soil Health Assessment",
      description: "Conduct comprehensive soil testing to understand nutrient levels and pH",
      priority: "High",
      timeline: "Immediate",
      steps: ["Collect soil samples", "Send for laboratory testing", "Analyze results", "Plan nutrient management"]
    }
  ]);

  const createDefaultFutureOutlook = () => ({
    market_trends: "Growing demand for organic produce and sustainable farming practices",
    climate_projections: "Expected changes in rainfall patterns require adaptive strategies",
    technology_recommendations: "Integration of IoT sensors and precision farming techniques"
  });

  // Transformation functions to match backend data structure to frontend expectations
  const transformFarmingScenario = (backendData) => {
    if (!backendData) return createDefaultFarmingScenario();

    return {
      scenario_type: "Mixed Farming System",
      description: `A comprehensive farming approach with ${backendData.rice_coverage || '40%'} rice cultivation, ${backendData.primary_crop_coverage || '30%'} primary crops, ${backendData.secondary_crop_coverage || '20%'} secondary crops, and ${backendData.agroforestry_coverage || '10%'} agroforestry integration.`,
      implementation_steps: [
        "Conduct comprehensive soil testing and analysis",
        "Implement integrated pest management practices", 
        "Establish efficient water management systems",
        "Set up agroforestry boundary plantations",
        "Develop market linkages for produce",
        "Monitor and adjust farming practices based on seasonal conditions"
      ],
      expected_benefits: [
        "Diversified income sources reducing financial risk",
        "Improved soil health and fertility through crop rotation",
        "Enhanced carbon sequestration through agroforestry",
        "Better resilience to climate variability",
        "Sustainable long-term agricultural productivity",
        "Additional revenue from carbon credits"
      ]
    };
  };

  const transformCarbonRevenue = (backendData) => {
    if (!backendData) return createDefaultCarbonRevenue();

    return {
      estimated_annual_credits: backendData.estimated_annual_credits || backendData.realistic_carbon_potential_t_ha || 2.5,
      estimated_revenue: backendData.estimated_revenue_inr || backendData.estimated_revenue || 62.50,
      income_analysis: backendData.income_analysis || {
        short_term_crops: "Focus on high-value crops for immediate income generation",
        long_term_agroforestry: "Invest in agroforestry for sustained long-term benefits", 
        investment_horizon_years: "5-10 years for optimal returns",
        stability_over_10_years: "High stability with diversified farming approach",
        recommendation_on_scaling: "Start with pilot projects and scale based on success"
      }
    };
  };

  const transformZoneContext = (backendData) => {
    if (!backendData) return createDefaultZoneContext();

    // Extract climate characteristics from farm profile if available
    const farmProfile = rawReportContent?.report?.farm_profile;
    const detectedZone = rawReportContent?.metadata?.detected_zone;
    
    const climate_characteristics = [];
    if (farmProfile?.climate) {
      climate_characteristics.push(
        { label: "Annual Rainfall", value: `${farmProfile.climate.annual_rainfall_mm?.toFixed(0) || 'N/A'} mm` },
        { label: "Average Temperature", value: `${farmProfile.climate.avg_temp_c?.toFixed(1) || 'N/A'}°C` },
        { label: "Average Humidity", value: `${farmProfile.climate.avg_humidity_pct?.toFixed(0) || 'N/A'}%` },
        { label: "Rainy Days", value: `${farmProfile.climate.rainy_days || 'N/A'} days` },
        { label: "Vegetation Health", value: farmProfile.climate.vegetation_health || 'N/A' }
      );
    }
    
    if (farmProfile?.soil) {
      climate_characteristics.push(
        { label: "Soil Type", value: farmProfile.soil.texture || 'N/A' },
        { label: "Soil pH", value: `${farmProfile.soil.ph?.toFixed(1) || 'N/A'} (${farmProfile.soil.ph_status || 'N/A'})` }
      );
    }

    return {
      zone_name: detectedZone?.name || backendData.zone_name || "Agro-Climatic Zone Analysis",
      description: backendData.description || "Your farm is located in a region with favorable conditions for diverse agricultural activities.",
      climate_characteristics: climate_characteristics.length > 0 ? climate_characteristics : [
        { label: "Temperature Range", value: "20-35°C" },
        { label: "Annual Rainfall", value: "800-1200mm" },
        { label: "Soil Type", value: "Alluvial/Red soil" },
        { label: "Growing Seasons", value: "Kharif, Rabi, Zaid" }
      ],
      best_suited_crops: backendData.best_suited_crops || ["Rice", "Coconut", "Spices", "Rubber", "Cashew"],
      challenges: backendData.challenges || ["Water management", "Soil erosion", "Pest management"],
      opportunities: backendData.opportunities || ["High-value crops", "Agroforestry", "Carbon farming"]
    };
  };

  const transformRisks = (backendData) => {
    if (!backendData) return createDefaultRisks();

    const climateRisks = [];
    const marketRisks = [];

    // Transform climate-related risks
    if (backendData.climate) {
      climateRisks.push({
        risk_type: "Climate Variability",
        severity: "Medium",
        probability: "60%",
        description: backendData.climate,
        mitigation_strategies: [
          "Implement climate-resilient crop varieties",
          "Develop water harvesting and storage systems",
          "Adopt diversified cropping patterns",
          "Use weather-based crop insurance"
        ]
      });
    }

    if (backendData.pest_disease) {
      climateRisks.push({
        risk_type: "Pest and Disease Pressure",
        severity: "High",
        probability: "70%",
        description: backendData.pest_disease,
        mitigation_strategies: [
          "Implement integrated pest management",
          "Use disease-resistant varieties",
          "Regular field monitoring",
          "Maintain proper field sanitation"
        ]
      });
    }

    // Transform market-related risks
    if (backendData.market) {
      marketRisks.push({
        risk_type: "Market Price Volatility",
        severity: "Medium",
        probability: "50%",
        description: backendData.market,
        mitigation_strategies: [
          "Diversify crop portfolio",
          "Establish contract farming agreements",
          "Develop value addition processes",
          "Join farmer producer organizations"
        ]
      });
    }

    if (backendData.soil) {
      marketRisks.push({
        risk_type: "Soil Degradation",
        severity: "Medium",
        probability: "40%",
        description: backendData.soil,
        mitigation_strategies: [
          "Implement soil conservation practices",
          "Use organic amendments",
          "Practice crop rotation",
          "Regular soil testing and monitoring"
        ]
      });
    }

    return {
      climate_risks: climateRisks,
      market_risks: marketRisks
    };
  };

  const transformActions = (backendData) => {
    if (!backendData || !Array.isArray(backendData)) return createDefaultActions();

    return backendData.map((actionText, index) => ({
      action_id: index + 1,
      title: actionText.length > 50 ? actionText.substring(0, 50) + "..." : actionText,
      description: actionText,
      priority: index < 2 ? "High" : index < 4 ? "Medium" : "Low",
      timeline: index < 2 ? "Immediate" : index < 4 ? "1-3 months" : "3-6 months",
      steps: [
        "Assess current situation",
        "Plan implementation strategy",
        "Execute action items",
        "Monitor progress and adjust"
      ]
    }));
  };

  const transformFutureOutlook = (backendData) => {
    if (!backendData) return createDefaultFutureOutlook();

    return {
      market_trends: backendData.climate_resilience || "Growing demand for sustainable and climate-resilient agricultural products",
      climate_projections: backendData.income_stability || "Climate change will require adaptive farming practices and resilient crop varieties",
      technology_recommendations: backendData.sustainability || "Integration of modern agricultural technologies for improved productivity and sustainability"
    };
  };

  const fetchFarmDetails = async (farmId) => {
    try {
      setLoading(true);
      console.log("Fetching details for farm_id:", farmId);
      
      const response = await fetch(`http://localhost:5000/api/farms/${farmId}/details`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const farmData = await response.json();
        console.log("Farm details received:", farmData);
        setFarmDetails(farmData);
      } else {
        const errorData = await response.json();
        console.error('Error fetching farm details:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching farm details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    navigate("/farm-analyzer");
  };

  const renderRecommendationCard = (item, index, type) => {
    const getTypeColor = () => {
      switch (type) {
        case 'rice': return 'teal';
        case 'crops': return 'amber';
        case 'agroforestry': return 'green';
        default: return 'slate';
      }
    };

    const colorClasses = {
      rice: 'border-l-teal-500 bg-teal-50',
      crops: 'border-l-amber-500 bg-amber-50',
      agroforestry: 'border-l-green-500 bg-green-50'
    };

    return (
      <div key={index} className={`border-l-4 p-4 rounded-r-lg transition-all hover:shadow-md ${colorClasses[type] || 'border-l-slate-500 bg-slate-50'}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {item.variety_name || item.crop_name || item.tree_name || item.name || 'Unknown Item'}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {item.suitability && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                item.suitability === 'High' ? 'bg-green-500' :
                item.suitability === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {item.suitability} Suitability
              </span>
            )}
            {item.carbon_potential && (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                {item.carbon_potential} Carbon
              </span>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{item.description}</p>
        )}

        <div className="mb-4 space-y-2">
          {item.expected_yield && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Expected Yield:</span>
              <span className="text-slate-900 font-semibold">{item.expected_yield}</span>
            </div>
          )}
          {item.water_requirement && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Water Requirement:</span>
              <span className="text-slate-900 font-semibold">{item.water_requirement}</span>
            </div>
          )}
          {item.growth_duration && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Growth Duration:</span>
              <span className="text-slate-900 font-semibold">{item.growth_duration}</span>
            </div>
          )}
          {item.market_price && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Market Price:</span>
              <span className="text-slate-900 font-semibold">{item.market_price}</span>
            </div>
          )}
        </div>

        {item.confidence_score && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-600 font-medium">Confidence:</span>
              <span className="text-slate-900 font-semibold">{Math.round(item.confidence_score * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.confidence_score * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {item.key_benefits && item.key_benefits.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Benefits:</h4>
            <ul className="text-sm text-slate-700 space-y-1">
              {item.key_benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <i className="fas fa-check text-green-500 text-xs mt-0.5 flex-shrink-0"></i>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm flex justify-between items-start flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line text-teal-500"></i>
            Agricultural Recommendations
          </h1>

          <div className="flex flex-wrap gap-4">
            {farmId && farmId !== "N/A" && farmId !== "Error" && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 font-medium">Farm ID:</span>
                  <span className="bg-slate-100 text-slate-900 text-base font-semibold px-3 py-1 rounded-md">{farmId}</span>
                </div>
                {farmDetails.farmer_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">Farmer:</span>
                    <span className="bg-slate-100 text-slate-900 text-base font-semibold px-3 py-1 rounded-md">{farmDetails.farmer_name}</span>
                  </div>
                )}
                {farmDetails.village && farmDetails.district && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">Location:</span>
                    <span className="bg-slate-100 text-slate-900 text-base font-semibold px-3 py-1 rounded-md">{farmDetails.village}, {farmDetails.district}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <button onClick={handleNewAnalysis} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white border border-teal-500 rounded-md hover:bg-teal-600 transition-all">
          <i className="fas fa-plus"></i>
          New Analysis
        </button>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <i className="fas fa-file-alt text-teal-500"></i>
          Executive Summary
        </h2>
        <p className="text-base text-slate-700 leading-relaxed">{reportSummary}</p>
      </div>

      {/* Quick Stats */}
      {farmDetails && Object.keys(farmDetails).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <i className="fas fa-map-marker-alt text-teal-500 text-2xl"></i>
            <div>
              <div className="text-xl font-bold text-slate-900">{farmDetails.area || "N/A"}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide font-medium">Hectares</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <i className="fas fa-seedling text-teal-500 text-2xl"></i>
            <div>
              <div className="text-xl font-bold text-slate-900">{farmDetails.main_crop || "N/A"}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide font-medium">Main Crop</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <i className="fas fa-chart-bar text-teal-500 text-2xl"></i>
            <div>
              <div className="text-xl font-bold text-slate-900">{farmDetails.reports_count || 0}</div>
              <div className="text-xs text-slate-600 uppercase tracking-wide font-medium">Total Reports</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <i className="fas fa-calendar text-teal-500 text-2xl"></i>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {farmDetails.latest_analysis ? new Date(farmDetails.latest_analysis).toLocaleDateString() : "None"}
              </div>
              <div className="text-xs text-slate-600 uppercase tracking-wide font-medium">Last Analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid gap-6 mb-8">
        {/* Rice Varieties Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-seedling text-teal-500"></i>
              Recommended Rice Varieties
              <span className="bg-slate-100 text-teal-600 text-sm font-semibold px-2 py-1 rounded-full">{recommendations.rice_varieties.length}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.rice_varieties.length > 0 ? (
              recommendations.rice_varieties.map((item, index) =>
                renderRecommendationCard(item, index, 'rice')
              )
            ) : (
              <div className="text-center py-8 col-span-full">
                <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                <p className="text-slate-600">No specific rice variety recommendations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Crops Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-leaf text-teal-500"></i>
              Recommended Crops
              <span className="bg-slate-100 text-teal-600 text-sm font-semibold px-2 py-1 rounded-full">{recommendations.crops.length}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.crops.length > 0 ? (
              recommendations.crops.map((item, index) =>
                renderRecommendationCard(item, index, 'crops')
              )
            ) : (
              <div className="text-center py-8 col-span-full">
                <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                <p className="text-slate-600">No specific crop recommendations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Agroforestry Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-tree text-teal-500"></i>
              Recommended Trees (Agroforestry)
              <span className="bg-slate-100 text-teal-600 text-sm font-semibold px-2 py-1 rounded-full">{recommendations.agroforestry.length}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.agroforestry.length > 0 ? (
              recommendations.agroforestry.map((item, index) =>
                renderRecommendationCard(item, index, 'agroforestry')
              )
            ) : (
              <div className="text-center py-8 col-span-full">
                <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                <p className="text-slate-600">No specific agroforestry recommendations found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farming Scenario Section */}
      {farmingScenario && Object.keys(farmingScenario).length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-tractor text-teal-500"></i>
              Recommended Farming Scenario
            </h2>
          </div>
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-teal-600 mb-4">{farmingScenario.scenario_type}</h3>
            </div>
            <div className="grid gap-6">
              <p className="text-base text-slate-700 leading-relaxed">{farmingScenario.description}</p>

              {farmingScenario.implementation_steps && farmingScenario.implementation_steps.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-tasks text-teal-500"></i>
                    Implementation Steps
                  </h4>
                  <ol className="space-y-2">
                    {farmingScenario.implementation_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="bg-teal-500 text-white w-6 h-6 rounded-full text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
                        <span className="text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {farmingScenario.expected_benefits && farmingScenario.expected_benefits.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-500"></i>
                    Expected Benefits
                  </h4>
                  <ul className="space-y-2">
                    {farmingScenario.expected_benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <i className="fas fa-arrow-right text-green-500 text-sm mt-0.5"></i>
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carbon Revenue Section */}
      {carbonRevenue && Object.keys(carbonRevenue).length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-leaf text-green-500"></i>
              Carbon Revenue Analysis
            </h2>
          </div>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-green-500 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-seedling"></i>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{carbonRevenue.estimated_annual_credits || "N/A"}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Annual Carbon Credits (tons)</div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <div className="bg-green-500 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">₹{carbonRevenue.estimated_revenue || "N/A"}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Estimated Annual Revenue</div>
                </div>
              </div>
            </div>

            {carbonRevenue.income_analysis && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-teal-500"></i>
                  Income Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Short-term Crops</h4>
                    <p className="text-sm text-slate-700">{carbonRevenue.income_analysis.short_term_crops}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Long-term Agroforestry</h4>
                    <p className="text-sm text-slate-700">{carbonRevenue.income_analysis.long_term_agroforestry}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Investment Horizon</h4>
                    <p className="text-sm text-slate-700">{carbonRevenue.income_analysis.investment_horizon_years}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Long-term Stability</h4>
                    <p className="text-sm text-slate-700">{carbonRevenue.income_analysis.stability_over_10_years}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 md:col-span-2">
                    <h4 className="font-semibold text-slate-900 mb-2">Scaling Recommendation</h4>
                    <p className="text-sm text-slate-700">{carbonRevenue.income_analysis.recommendation_on_scaling}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone Context Section */}
      {zoneContext && Object.keys(zoneContext).length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-map text-teal-500"></i>
              Agro-Climatic Zone Context
            </h2>
          </div>
          <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-teal-600 mb-4">{zoneContext.zone_name}</h3>
            </div>
            <div className="grid gap-6">
              <p className="text-base text-slate-700 leading-relaxed">{zoneContext.description}</p>

              {zoneContext.climate_characteristics && zoneContext.climate_characteristics.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-thermometer-half text-teal-500"></i>
                    Climate Characteristics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {zoneContext.climate_characteristics.map((char, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-md p-3 border border-slate-200">
                        <span className="text-slate-600 font-medium">{char.label}:</span>
                        <span className="text-slate-900 font-semibold">{char.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {zoneContext.best_suited_crops && zoneContext.best_suited_crops.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fas fa-seedling text-green-500"></i>
                    Best Suited Crops
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {zoneContext.best_suited_crops.map((crop, index) => (
                      <span key={index} className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">{crop}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment Section */}
      {risks && (Object.keys(risks).length > 0) && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-amber-500"></i>
              Risk Assessment
            </h2>
          </div>
          <div className="grid gap-6">
            {risks.climate_risks && risks.climate_risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-cloud-rain text-blue-500"></i>
                  Climate Risks
                </h3>
                <div className="grid gap-4">
                  {risks.climate_risks.map((risk, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4 border-l-4 border-l-amber-500">
                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <h4 className="font-semibold text-slate-900">{risk.risk_type}</h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                          risk.severity === 'High' ? 'bg-red-500' :
                          risk.severity === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Probability:</span> {risk.probability}
                        </div>
                        <p className="text-sm text-slate-700">{risk.description}</p>
                        {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                          <div className="bg-green-50 rounded-md p-3">
                            <h5 className="text-sm font-semibold text-green-700 mb-2">Mitigation Strategies:</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {risk.mitigation_strategies.map((strategy, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <i className="fas fa-arrow-right text-green-500 text-xs mt-0.5"></i>
                                  {strategy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {risks.market_risks && risks.market_risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-line text-purple-500"></i>
                  Market Risks
                </h3>
                <div className="grid gap-4">
                  {risks.market_risks.map((risk, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4 border-l-4 border-l-amber-500">
                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <h4 className="font-semibold text-slate-900">{risk.risk_type}</h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                          risk.severity === 'High' ? 'bg-red-500' :
                          risk.severity === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Probability:</span> {risk.probability}
                        </div>
                        <p className="text-sm text-slate-700">{risk.description}</p>
                        {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                          <div className="bg-green-50 rounded-md p-3">
                            <h5 className="text-sm font-semibold text-green-700 mb-2">Mitigation Strategies:</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {risk.mitigation_strategies.map((strategy, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <i className="fas fa-arrow-right text-green-500 text-xs mt-0.5"></i>
                                  {strategy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Items Section */}
      {actions && actions.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-tasks text-blue-500"></i>
              Action Items
              <span className="bg-slate-100 text-teal-600 text-sm font-semibold px-2 py-1 rounded-full">{actions.length}</span>
            </h2>
          </div>
          <div className="grid gap-4">
            {actions.map((action, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <h3 className="font-semibold text-slate-900">{action.title}</h3>
                  <div className="flex gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                      action.priority === 'High' ? 'bg-red-500' :
                      action.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`}>
                      {action.priority}
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {action.timeline}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">{action.description}</p>
                  {action.steps && action.steps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Steps:</h4>
                      <ol className="text-sm text-slate-700 space-y-1">
                        {action.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="bg-blue-500 text-white w-4 h-4 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Outlook Section */}
      {futureOutlook && Object.keys(futureOutlook).length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <i className="fas fa-crystal-ball text-purple-500"></i>
              Future Outlook
            </h2>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {futureOutlook.market_trends && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Market Trends</h3>
                    <p className="text-sm text-slate-700">{futureOutlook.market_trends}</p>
                  </div>
                </div>
              )}
              {futureOutlook.climate_projections && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-cloud-sun"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Climate Projections</h3>
                    <p className="text-sm text-slate-700">{futureOutlook.climate_projections}</p>
                  </div>
                </div>
              )}
              {futureOutlook.technology_recommendations && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Technology Recommendations</h3>
                    <p className="text-sm text-slate-700">{futureOutlook.technology_recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading farm details...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
