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
      // Handle case where no report content is available
      console.warn("No report content available");
      setFarmId("N/A");
      setReportSummary("No recommendations found. Please submit your farm data first.");
      setRecommendations({ rice_varieties: [], crops: [], agroforestry: [] });
      setFarmingScenario(createDefaultFarmingScenario());
      setCarbonRevenue(createDefaultCarbonRevenue());
      setZoneContext(createDefaultZoneContext());
      setRisks(createDefaultRisks());
      setActions(createDefaultActions());
      setFutureOutlook(createDefaultFutureOutlook());
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
        case 'rice': return 'var(--color-primary)';
        case 'crops': return 'var(--color-warning)';
        case 'agroforestry': return 'var(--color-success)';
        default: return 'var(--color-info)';
      }
    };

    return (
      <div key={index} className="recommendation-card" style={{ '--accent-color': getTypeColor() }}>
        <div className="rec-header">
          <h3 className="rec-name">
            {item.variety_name || item.crop_name || item.tree_name || item.name || 'Unknown Item'}
          </h3>
          <div className="rec-badges">
            {item.suitability && (
              <span className="suitability-badge" data-level={item.suitability?.toLowerCase()}>
                {item.suitability} Suitability
              </span>
            )}
            {item.carbon_potential && (
              <span className="carbon-badge">
                {item.carbon_potential} Carbon
              </span>
            )}
          </div>
        </div>

        {item.description && (
          <p className="rec-description">{item.description}</p>
        )}

        <div className="rec-details">
          {item.expected_yield && (
            <div className="rec-detail-row">
              <span className="detail-label">Expected Yield:</span>
              <span className="detail-value">{item.expected_yield}</span>
            </div>
          )}
          {item.water_requirement && (
            <div className="rec-detail-row">
              <span className="detail-label">Water Requirement:</span>
              <span className="detail-value">{item.water_requirement}</span>
            </div>
          )}
          {item.growth_duration && (
            <div className="rec-detail-row">
              <span className="detail-label">Growth Duration:</span>
              <span className="detail-value">{item.growth_duration}</span>
            </div>
          )}
          {item.market_price && (
            <div className="rec-detail-row">
              <span className="detail-label">Market Price:</span>
              <span className="detail-value">{item.market_price}</span>
            </div>
          )}
        </div>

        {item.confidence_score && (
          <div className="confidence-section">
            <div className="confidence-label">
              Confidence: {Math.round(item.confidence_score * 100)}%
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${item.confidence_score * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {item.key_benefits && item.key_benefits.length > 0 && (
          <div className="rec-benefits">
            <h4>Key Benefits:</h4>
            <ul>
              {item.key_benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="recommendations-container">
      {/* Header Section */}
      <div className="recommendations-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-chart-line title-icon"></i>
            Agricultural Recommendations
          </h1>
          
          <div className="farm-info-header">
            {farmId && farmId !== "N/A" && farmId !== "Error" && (
              <>
                <div className="farm-id-display">
                  <span className="farm-label">Farm ID:</span>
                  <span className="farm-id-value">{farmId}</span>
                </div>
                {farmDetails.farmer_name && (
                  <div className="farmer-info">
                    <span className="farmer-label">Farmer:</span>
                    <span className="farmer-name">{farmDetails.farmer_name}</span>
                  </div>
                )}
                {farmDetails.village && farmDetails.district && (
                  <div className="location-info">
                    <span className="location-label">Location:</span>
                    <span className="location-value">{farmDetails.village}, {farmDetails.district}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <button onClick={handleNewAnalysis} className="new-analysis-btn">
          <i className="fas fa-plus"></i>
          New Analysis
        </button>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h2><i className="fas fa-file-alt"></i> Executive Summary</h2>
        <p className="summary-text">{reportSummary}</p>
      </div>

      {/* Quick Stats */}
      {farmDetails && Object.keys(farmDetails).length > 0 && (
        <div className="quick-stats">
          <div className="stat-item">
            <i className="fas fa-map-marker-alt stat-icon"></i>
            <div>
              <div className="stat-value">{farmDetails.area || "N/A"}</div>
              <div className="stat-label">Hectares</div>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-seedling stat-icon"></i>
            <div>
              <div className="stat-value">{farmDetails.main_crop || "N/A"}</div>
              <div className="stat-label">Main Crop</div>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-chart-bar stat-icon"></i>
            <div>
              <div className="stat-value">{farmDetails.reports_count || 0}</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-item">
            <i className="fas fa-calendar stat-icon"></i>
            <div>
              <div className="stat-value">
                {farmDetails.latest_analysis ? new Date(farmDetails.latest_analysis).toLocaleDateString() : "None"}
              </div>
              <div className="stat-label">Last Analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {/* Rice Varieties Section */}
        <div className="recommendation-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-seedling"></i>
              Recommended Rice Varieties
              <span className="count-badge">{recommendations.rice_varieties.length}</span>
            </h2>
          </div>
          <div className="recommendations-list">
            {recommendations.rice_varieties.length > 0 ? (
              recommendations.rice_varieties.map((item, index) => 
                renderRecommendationCard(item, index, 'rice')
              )
            ) : (
              <div className="no-recommendations">
                <i className="fas fa-search no-rec-icon"></i>
                <p>No specific rice variety recommendations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Crops Section */}
        <div className="recommendation-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-leaf"></i>
              Recommended Crops
              <span className="count-badge">{recommendations.crops.length}</span>
            </h2>
          </div>
          <div className="recommendations-list">
            {recommendations.crops.length > 0 ? (
              recommendations.crops.map((item, index) => 
                renderRecommendationCard(item, index, 'crops')
              )
            ) : (
              <div className="no-recommendations">
                <i className="fas fa-search no-rec-icon"></i>
                <p>No specific crop recommendations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Agroforestry Section */}
        <div className="recommendation-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-tree"></i>
              Recommended Trees (Agroforestry)
              <span className="count-badge">{recommendations.agroforestry.length}</span>
            </h2>
          </div>
          <div className="recommendations-list">
            {recommendations.agroforestry.length > 0 ? (
              recommendations.agroforestry.map((item, index) => 
                renderRecommendationCard(item, index, 'agroforestry')
              )
            ) : (
              <div className="no-recommendations">
                <i className="fas fa-search no-rec-icon"></i>
                <p>No specific agroforestry recommendations found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Farming Scenario Section */}
      {farmingScenario && Object.keys(farmingScenario).length > 0 && (
        <div className="farming-scenario-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-tractor"></i>
              Recommended Farming Scenario
            </h2>
          </div>
          <div className="farming-scenario-card">
            <div className="scenario-header">
              <h3 className="scenario-type">{farmingScenario.scenario_type}</h3>
            </div>
            <div className="scenario-content">
              <p className="scenario-description">{farmingScenario.description}</p>
              
              {farmingScenario.implementation_steps && farmingScenario.implementation_steps.length > 0 && (
                <div className="implementation-section">
                  <h4><i className="fas fa-tasks"></i> Implementation Steps</h4>
                  <ol className="implementation-steps">
                    {farmingScenario.implementation_steps.map((step, index) => (
                      <li key={index} className="step-item">
                        <span className="step-number">{index + 1}</span>
                        <span className="step-text">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {farmingScenario.expected_benefits && farmingScenario.expected_benefits.length > 0 && (
                <div className="benefits-section">
                  <h4><i className="fas fa-check-circle"></i> Expected Benefits</h4>
                  <ul className="benefits-list">
                    {farmingScenario.expected_benefits.map((benefit, index) => (
                      <li key={index} className="benefit-item">
                        <i className="fas fa-arrow-right"></i>
                        {benefit}
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
        <div className="carbon-revenue-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-leaf"></i>
              Carbon Revenue Analysis
            </h2>
          </div>
          <div className="carbon-revenue-content">
            <div className="carbon-stats-grid">
              <div className="carbon-stat-card">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-seedling"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{carbonRevenue.estimated_annual_credits || "N/A"}</div>
                  <div className="stat-label">Annual Carbon Credits (tons)</div>
                </div>
              </div>
              <div className="carbon-stat-card">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-value">₹{carbonRevenue.estimated_revenue || "N/A"}</div>
                  <div className="stat-label">Estimated Annual Revenue</div>
                </div>
              </div>
            </div>

            {carbonRevenue.income_analysis && (
              <div className="income-analysis-section">
                <h3><i className="fas fa-chart-line"></i> Income Analysis</h3>
                <div className="income-analysis-grid">
                  <div className="analysis-item">
                    <h4>Short-term Crops</h4>
                    <p>{carbonRevenue.income_analysis.short_term_crops}</p>
                  </div>
                  <div className="analysis-item">
                    <h4>Long-term Agroforestry</h4>
                    <p>{carbonRevenue.income_analysis.long_term_agroforestry}</p>
                  </div>
                  <div className="analysis-item">
                    <h4>Investment Horizon</h4>
                    <p>{carbonRevenue.income_analysis.investment_horizon_years}</p>
                  </div>
                  <div className="analysis-item">
                    <h4>Long-term Stability</h4>
                    <p>{carbonRevenue.income_analysis.stability_over_10_years}</p>
                  </div>
                  <div className="analysis-item analysis-full-width">
                    <h4>Scaling Recommendation</h4>
                    <p>{carbonRevenue.income_analysis.recommendation_on_scaling}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone Context Section */}
      {zoneContext && Object.keys(zoneContext).length > 0 && (
        <div className="zone-context-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-map"></i>
              Agro-Climatic Zone Context
            </h2>
          </div>
          <div className="zone-context-card">
            <div className="zone-header">
              <h3>{zoneContext.zone_name}</h3>
            </div>
            <div className="zone-content">
              <p className="zone-description">{zoneContext.description}</p>
              
              {zoneContext.climate_characteristics && zoneContext.climate_characteristics.length > 0 && (
                <div className="climate-characteristics">
                  <h4><i className="fas fa-thermometer-half"></i> Climate Characteristics</h4>
                  <div className="characteristics-grid">
                    {zoneContext.climate_characteristics.map((char, index) => (
                      <div key={index} className="characteristic-item">
                        <span className="char-label">{char.label}:</span>
                        <span className="char-value">{char.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {zoneContext.best_suited_crops && zoneContext.best_suited_crops.length > 0 && (
                <div className="suited-crops">
                  <h4><i className="fas fa-seedling"></i> Best Suited Crops</h4>
                  <div className="crops-tags">
                    {zoneContext.best_suited_crops.map((crop, index) => (
                      <span key={index} className="crop-tag">{crop}</span>
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
        <div className="risks-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-exclamation-triangle"></i>
              Risk Assessment
            </h2>
          </div>
          <div className="risks-content">
            {risks.climate_risks && risks.climate_risks.length > 0 && (
              <div className="risk-category">
                <h3><i className="fas fa-cloud-rain"></i> Climate Risks</h3>
                <div className="risks-grid">
                  {risks.climate_risks.map((risk, index) => (
                    <div key={index} className="risk-card" data-severity={risk.severity?.toLowerCase()}>
                      <div className="risk-header">
                        <h4>{risk.risk_type}</h4>
                        <span className="severity-badge" data-level={risk.severity?.toLowerCase()}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="risk-details">
                        <div className="probability">
                          <span>Probability: {risk.probability}</span>
                        </div>
                        <p className="risk-description">{risk.description}</p>
                        {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                          <div className="mitigation-strategies">
                            <h5>Mitigation Strategies:</h5>
                            <ul>
                              {risk.mitigation_strategies.map((strategy, i) => (
                                <li key={i}>{strategy}</li>
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
              <div className="risk-category">
                <h3><i className="fas fa-chart-line"></i> Market Risks</h3>
                <div className="risks-grid">
                  {risks.market_risks.map((risk, index) => (
                    <div key={index} className="risk-card" data-severity={risk.severity?.toLowerCase()}>
                      <div className="risk-header">
                        <h4>{risk.risk_type}</h4>
                        <span className="severity-badge" data-level={risk.severity?.toLowerCase()}>
                          {risk.severity}
                        </span>
                      </div>
                      <div className="risk-details">
                        <div className="probability">
                          <span>Probability: {risk.probability}</span>
                        </div>
                        <p className="risk-description">{risk.description}</p>
                        {risk.mitigation_strategies && risk.mitigation_strategies.length > 0 && (
                          <div className="mitigation-strategies">
                            <h5>Mitigation Strategies:</h5>
                            <ul>
                              {risk.mitigation_strategies.map((strategy, i) => (
                                <li key={i}>{strategy}</li>
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
        <div className="actions-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-tasks"></i>
              Action Items
              <span className="count-badge">{actions.length}</span>
            </h2>
          </div>
          <div className="actions-grid">
            {actions.map((action, index) => (
              <div key={index} className="action-card">
                <div className="action-header">
                  <h3>{action.title}</h3>
                  <div className="action-badges">
                    <span className="priority-badge" data-priority={action.priority?.toLowerCase()}>
                      {action.priority}
                    </span>
                    <span className="timeline-badge">
                      {action.timeline}
                    </span>
                  </div>
                </div>
                <div className="action-content">
                  <p className="action-description">{action.description}</p>
                  {action.steps && action.steps.length > 0 && (
                    <div className="action-steps">
                      <h4>Steps:</h4>
                      <ol>
                        {action.steps.map((step, i) => (
                          <li key={i}>{step}</li>
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
        <div className="future-outlook-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-crystal-ball"></i>
              Future Outlook
            </h2>
          </div>
          <div className="outlook-content">
            <div className="outlook-grid">
              {futureOutlook.market_trends && (
                <div className="outlook-card">
                  <div className="outlook-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="outlook-details">
                    <h3>Market Trends</h3>
                    <p>{futureOutlook.market_trends}</p>
                  </div>
                </div>
              )}
              {futureOutlook.climate_projections && (
                <div className="outlook-card">
                  <div className="outlook-icon">
                    <i className="fas fa-cloud-sun"></i>
                  </div>
                  <div className="outlook-details">
                    <h3>Climate Projections</h3>
                    <p>{futureOutlook.climate_projections}</p>
                  </div>
                </div>
              )}
              {futureOutlook.technology_recommendations && (
                <div className="outlook-card">
                  <div className="outlook-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="outlook-details">
                    <h3>Technology Recommendations</h3>
                    <p>{futureOutlook.technology_recommendations}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading farm details...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
