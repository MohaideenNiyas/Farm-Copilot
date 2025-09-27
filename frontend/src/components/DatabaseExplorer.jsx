
import React, { useState, useEffect } from "react";
import rawData from "../data/nabard_complete_database_147_varieties.json";

function DatabaseExplorer() {
  const [varieties, setVarieties] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [carbonFilter, setCarbonFilter] = useState("all");
  const [view, setView] = useState("cards");
  const [comparisonItems, setComparisonItems] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Normalize JSON into flat array
  useEffect(() => {
    try {
      let normalized = [];
      
      if (rawData.rice_varieties) {
        normalized = normalized.concat(
          rawData.rice_varieties.map((v, idx) => ({
            id: v.id || `rice_${idx}`,
            name: v.name,
            category: "rice",
            type: "Rice Variety",
            zone: Array.isArray(v.zone) ? v.zone.join(", ") : (v.zone || "Multiple"),
            carbon_potential: v.carbon_potential || "N/A",
            scientific_name: v.scientific_name || "",
            special_features: v.special_features || "",
            management: v.management || "",
            ...v,
          }))
        );
      }

      if (rawData.agroforestry_species) {
        normalized = normalized.concat(
          rawData.agroforestry_species.map((v, idx) => ({
            id: v.id || `agro_${idx}`,
            name: v.variety ? `${v.name} (${v.variety})` : v.name,
            category: "agroforestry",
            type: "Agroforestry Species",
            zone: Array.isArray(v.zone) ? v.zone.join(", ") : (v.zone || "Multiple"),
            carbon_potential: v.carbon_potential || "N/A",
            scientific_name: v.scientific_name || "",
            special_features: v.special_features || "",
            management: v.management || "",
            ...v,
          }))
        );
      }

      if (rawData.crop_varieties) {
        normalized = normalized.concat(
          rawData.crop_varieties.map((v, idx) => ({
            id: v.id || `crop_${idx}`,
            name: v.name,
            category: "crops",
            type: "Crop Variety",
            zone: Array.isArray(v.zone) ? v.zone.join(", ") : (v.zone || "Multiple"),
            carbon_potential: v.carbon_potential || "N/A",
            scientific_name: v.scientific_name || "",
            special_features: v.special_features || "",
            management: v.management || "",
            ...v,
          }))
        );
      }

      if (rawData.agro_climatic_zones) {
        normalized = normalized.concat(
          rawData.agro_climatic_zones.map((zone) => ({
            id: `zone_${zone.zone_id}`,
            name: zone.zone_name,
            category: "zones",
            type: "Agro-climatic Zone",
            zone: String(zone.zone_id),
            carbon_potential: Array.isArray(zone.carbon_potential) ? zone.carbon_potential[1] : zone.carbon_potential || "N/A",
            states: Array.isArray(zone.states) ? zone.states.join(", ") : zone.states,
            rainfall_range: `${zone.rainfall_min}-${zone.rainfall_max}mm`,
            temperature_range: `${zone.temp_min}-${zone.temp_max}°C`,
            suitable_crops: Array.isArray(zone.suitable_crops) ? zone.suitable_crops.join(", ") : zone.suitable_crops,
            suitable_trees: Array.isArray(zone.suitable_trees) ? zone.suitable_trees.join(", ") : zone.suitable_trees,
            rice_varieties: Array.isArray(zone.rice_varieties) ? zone.rice_varieties.join(", ") : zone.rice_varieties,
          }))
        );
      }

      setVarieties(normalized);
      setFilteredVarieties(normalized);
    } catch (err) {
      console.error("Error normalizing data:", err);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let results = varieties.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      const matchesZone = zoneFilter === "all" || 
        String(item.zone).includes(zoneFilter) ||
        item.zone === "Multiple";
      
      const carbon = parseFloat(item.carbon_potential);
      let matchesCarbon = true;
      if (carbonFilter === "low") matchesCarbon = !isNaN(carbon) && carbon <= 3;
      if (carbonFilter === "medium") matchesCarbon = !isNaN(carbon) && carbon > 3 && carbon <= 5;
      if (carbonFilter === "high") matchesCarbon = !isNaN(carbon) && carbon > 5;

      return matchesSearch && matchesCategory && matchesZone && matchesCarbon;
    });

    setFilteredVarieties(results);
  }, [searchTerm, categoryFilter, zoneFilter, carbonFilter, varieties]);

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setZoneFilter("all");
    setCarbonFilter("all");
    setFilteredVarieties(varieties);
  };

  // Fixed Comparison functions
  const toggleComparison = (item) => {
    if (comparisonItems.find((i) => i.id === item.id)) {
      // Remove from comparison if already exists
      setComparisonItems(comparisonItems.filter((i) => i.id !== item.id));
    } else if (comparisonItems.length < 5) {
      // Add to comparison if under limit
      setComparisonItems([...comparisonItems, item]);
    } else {
      alert("Maximum 5 items can be compared at once");
    }
  };

  const removeComparison = (id) => {
    setComparisonItems(comparisonItems.filter((i) => i.id !== id));
  };

  const clearComparison = () => {
    setComparisonItems([]);
  };

  const showDetails = (item) => {
    setDetailsItem(item);
    setShowDetailsModal(true);
  };

  // Render comparison table
  const renderComparisonTable = () => {
    if (comparisonItems.length === 0) {
      return (
        <div className="empty-comparison">
          <p>No items selected for comparison. Add items using the "Compare" button.</p>
        </div>
      );
    }

    const attributes = [
      "Type", 
      "Zone", 
      "Carbon Potential", 
      "Scientific Name",
      "Special Features", 
      "Management"
    ];

    return (
      <div className="comparison-table-container">
        <div className="comparison-header">
          <h3>Comparing {comparisonItems.length} varieties</h3>
          <button onClick={clearComparison} className="btn btn-sm btn-secondary">
            Clear All
          </button>
        </div>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Attribute</th>
              {comparisonItems.map((item) => (
                <th key={item.id}>
                  <div className="comparison-header-cell">
                    <div className="item-name">{item.name}</div>
                    <button 
                      onClick={() => removeComparison(item.id)}
                      className="remove-btn"
                      title="Remove from comparison"
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr) => (
              <tr key={attr}>
                <td className="attribute-cell">{attr}</td>
                {comparisonItems.map((item) => {
                  let value = "N/A";
                  switch (attr) {
                    case "Type":
                      value = item.type || item.category;
                      break;
                    case "Zone":
                      value = item.zone || "Multiple";
                      break;
                    case "Carbon Potential":
                      value = `${item.carbon_potential || "N/A"}${item.carbon_potential !== "N/A" ? " tCO₂/ha" : ""}`;
                      break;
                    case "Scientific Name":
                      value = item.scientific_name || "—";
                      break;
                    case "Special Features":
                      value = (item.special_features || item.suitable_crops || "—").slice(0, 100);
                      if (value.length === 100) value += "...";
                      break;
                    case "Management":
                      value = (item.management || item.suitable_trees || "—").slice(0, 100);
                      if (value.length === 100) value += "...";
                      break;
                    default:
                      break;
                  }
                  return <td key={`${item.id}-${attr}`}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get unique zones for filter dropdown
  const getUniqueZones = () => {
    const zones = new Set();
    varieties.forEach(item => {
      if (item.zone && item.zone !== "Multiple") {
        const zoneStr = String(item.zone);
        if (zoneStr.includes(",")) {
          zoneStr.split(",").forEach(z => zones.add(z.trim()));
        } else {
          zones.add(zoneStr);
        }
      }
    });
    return Array.from(zones).sort();
  };

  if (filteredVarieties.length === 0 && varieties.length === 0) {
    return (
      <div className="database-explorer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="database-explorer">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="title-icon">🗃️</span>
          Database Explorer
          <span className="title-count">147 Varieties</span>
        </h1>
        <p className="page-description">
          Explore our comprehensive database of 51 rice varieties, 53 agroforestry species, 
          43 crop varieties, and 15 agro-climatic zones with advanced filtering and comparison tools.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="filters-row">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search varieties by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Categories</option>
            <option value="rice">Rice Varieties</option>
            <option value="crops">Crop Varieties</option>
            <option value="agroforestry">Agroforestry Species</option>
            <option value="zones">Agro-climatic Zones</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Zones</option>
            {getUniqueZones().map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>

          <select
            value={carbonFilter}
            onChange={(e) => setCarbonFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Carbon Levels</option>
            <option value="low">Low (≤3 tCO₂/ha)</option>
            <option value="medium">Medium (3-5 tCO₂/ha)</option>
            <option value="high">High (5 tCO₂/ha)</option>
          </select>
        </div>

        <div className="filter-actions">
          <button onClick={resetFilters} className="btn btn-secondary">
            <i className="fas fa-undo"></i>
            Reset Filters
          </button>
          {comparisonItems.length > 0 && (
            <button 
              onClick={() => setShowComparisonModal(!showComparisonModal)} 
              className="btn btn-primary"
            >
              <i className="fas fa-balance-scale"></i>
              Compare ({comparisonItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-count">
          <strong>{filteredVarieties.length}</strong> varieties found
          {searchTerm && ` for "${searchTerm}"`}
        </div>
        <div className="view-toggle">
          <button 
            className={`view-btn ${view === "cards" ? "active" : ""}`}
            onClick={() => setView("cards")}
          >
            <i className="fas fa-th"></i>
          </button>
          <button 
            className={`view-btn ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="comparison-modal">
          <div className="modal-overlay" onClick={() => setShowComparisonModal(false)}></div>
          <div className="modal-content comparison-modal-content">
            <div className="modal-header">
              <h2>Variety Comparison</h2>
              <button 
                onClick={() => setShowComparisonModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {renderComparisonTable()}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsItem && (
        <div className="details-modal">
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
          <div className="modal-content details-modal-content">
            <div className="modal-header">
              <h2>{detailsItem.name}</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                {Object.entries(detailsItem).map(([key, value]) => {
                  if (key === "id" || key === "name") return null;
                  return (
                    <div key={key} className="detail-item">
                      <span className="detail-label">
                        {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:
                      </span>
                      <span className="detail-value">
                        {Array.isArray(value) ? value.join(", ") : String(value || "N/A")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredVarieties.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No varieties found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : view === "cards" ? (
        <div className="varieties-grid">
          {filteredVarieties.map((item) => (
            <div key={item.id} className="variety-card">
              <div className="variety-header">
                <h3 className="variety-name">{item.name}</h3>
                <span className="variety-type">{item.type}</span>
              </div>
              
              {item.scientific_name && (
                <div className="scientific-name">
                  <em>{item.scientific_name}</em>
                </div>
              )}

              <div className="variety-details">
                <div className="variety-detail">
                  <span className="variety-detail-label">Zone:</span>
                  <span className="variety-detail-value">{item.zone || "Multiple"}</span>
                </div>
                <div className="variety-detail">
                  <span className="variety-detail-label">Carbon Potential:</span>
                  <span className="variety-detail-value">
                    {item.carbon_potential || "N/A"}
                    {item.carbon_potential !== "N/A" && " tCO₂/ha"}
                  </span>
                </div>
                {item.special_features && (
                  <div className="variety-feature">
                    <span className="feature-label">Key Features:</span>
                    <span className="feature-text">
                      {String(item.special_features).slice(0, 100)}
                      {String(item.special_features).length > 100 && "..."}
                    </span>
                  </div>
                )}
              </div>

              <div className="variety-actions">
                <button 
                  onClick={() => showDetails(item)}
                  className="btn btn-sm btn-outline"
                >
                  <i className="fas fa-info-circle"></i>
                  Details
                </button>
                <button 
                  onClick={() => toggleComparison(item)}
                  className={`btn btn-sm ${comparisonItems.find(i => i.id === item.id) ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={!comparisonItems.find(i => i.id === item.id) && comparisonItems.length >= 5}
                >
                  <i className="fas fa-balance-scale"></i>
                  {comparisonItems.find(i => i.id === item.id) ? 'Remove' : 'Compare'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="varieties-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Zone</th>
                <th>Carbon Potential</th>
                <th>Key Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVarieties.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-name">
                      <strong>{item.name}</strong>
                      {item.scientific_name && (
                        <div className="scientific-name-small">
                          <em>{item.scientific_name}</em>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.zone || "Multiple"}</td>
                  <td>
                    {item.carbon_potential || "N/A"}
                    {item.carbon_potential !== "N/A" && " tCO₂/ha"}
                  </td>
                  <td>
                    {(item.special_features || item.management || item.suitable_crops || "").slice(0, 100)}
                    {(item.special_features || item.management || item.suitable_crops || "").length > 100 && "..."}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => showDetails(item)}
                        className="btn btn-xs btn-outline"
                        title="View Details"
                      >
                        <i className="fas fa-info"></i>
                      </button>
                      <button 
                        onClick={() => toggleComparison(item)}
                        className={`btn btn-xs ${comparisonItems.find(i => i.id === item.id) ? 'btn-primary' : 'btn-secondary'}`}
                        title={comparisonItems.find(i => i.id === item.id) ? 'Remove from comparison' : 'Add to comparison'}
                        disabled={!comparisonItems.find(i => i.id === item.id) && comparisonItems.length >= 5}
                      >
                        <i className="fas fa-balance-scale"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DatabaseExplorer;
