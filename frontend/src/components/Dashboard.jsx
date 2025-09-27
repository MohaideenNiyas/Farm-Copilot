
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useContext(AuthContext);
  const [userFarms, setUserFarms] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalReports: 0,
    avgCarbonPotential: 0,
    lastAnalysis: null
  });

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

  const handleViewFarm = (farm) => {
    // Navigate to farm details or analysis
    navigate("/farm-analyzer", { state: { editFarm: farm } });
  };

  if (loading) {
    return (
      <div className="dashboard-main">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      {/* Welcome Header */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {user?.name}! 🌾</h1>
          <p className="welcome-subtitle">
            Revolutionary recommendation engine with complete 147-variety database, 
            true variety matching algorithms, comprehensive 15-zone analysis, 
            and dynamic carbon potential calculations.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <h3>{stats.totalFarms}</h3>
            <p>Total Farms</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalReports}</h3>
            <p>Analyses Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <h3>{stats.avgCarbonPotential}</h3>
            <p>Avg Carbon Potential (t/ha)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.lastAnalysis || 'None'}</h3>
            <p>Last Analysis</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons-grid">
          <button 
            className="action-btn primary"
            onClick={handleAnalyzeFarm}
          >
            <div className="action-icon">🔬</div>
            <div className="action-content">
              <h3>Analyze Farm</h3>
              <p>Get AI-powered recommendations with 147 varieties</p>
            </div>
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={handleExploreZones}
          >
            <div className="action-icon">🗺️</div>
            <div className="action-content">
              <h3>Explore Zones</h3>
              <p>Comprehensive analysis of all 15 agro-climatic zones</p>
            </div>
          </button>
          
          <button 
            className="action-btn tertiary"
            onClick={() => navigate("/database-explorer")}
          >
            <div className="action-icon">🗃️</div>
            <div className="action-content">
              <h3>Database Explorer</h3>
              <p>Search and compare from 147 varieties database</p>
            </div>
          </button>
        </div>
      </div>

      {/* My Farms Section */}
      {userFarms.length > 0 && (
        <div className="my-farms-section">
          <h2 className="section-title">My Farms</h2>
          <div className="farms-grid">
            {userFarms.map((farm) => (
              <div key={farm.farm_id} className="farm-card">
                <div className="farm-header">
                  <h3 className="farm-name">{farm.farm_id}</h3>
                  <span className="farm-location">{farm.village}, {farm.district}</span>
                </div>
                <div className="farm-details">
                  <div className="farm-detail">
                    <span className="detail-label">Area:</span>
                    <span className="detail-value">{farm.area} hectares</span>
                  </div>
                  <div className="farm-detail">
                    <span className="detail-label">Main Crop:</span>
                    <span className="detail-value">{farm.main_crop}</span>
                  </div>
                  <div className="farm-detail">
                    <span className="detail-label">Added:</span>
                    <span className="detail-value">{new Date(farm.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="farm-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewFarm(farm)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports Section */}
      {recentReports.length > 0 && (
        <div className="recent-reports-section">
          <h2 className="section-title">Recent Analysis Reports</h2>
          <div className="reports-list">
            {recentReports.map((report) => (
              <div key={report.report_id} className="report-card">
                <div className="report-header">
                  <h3 className="report-farm-id">{report.farm_id}</h3>
                  <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="report-preview">
                  <div className="report-stats">
                    <div className="report-stat">
                      <span className="stat-label">Carbon Potential:</span>
                      <span className="stat-value">
                        {report.report_data?.report?.carbon_revenue?.realistic_carbon_potential_t_ha || 'N/A'} t/ha
                      </span>
                    </div>
                    <div className="report-stat">
                      <span className="stat-label">Location:</span>
                      <span className="stat-value">
                        {report.farm?.village}, {report.farm?.district}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewReport(report)}
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="features-section">
        <h2 className="section-title">Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Dynamic Scoring Algorithm</h3>
            <p>Searches ALL 147 varieties for best farm matches</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>15-Zone Analysis</h3>
            <p>Detailed analysis of all 15 agro-climatic zones</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Scoring</h3>
            <p>Suitability scoring with confidence levels</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Complete Database</h3>
            <p>51 rice varieties, 53 agroforestry species, 43 crop varieties</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Scientific Matching</h3>
            <p>Based on soil, climate, zone, and carbon potential</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>MRV Compliance</h3>
            <p>Full recommendation reasoning for all 147 varieties</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
