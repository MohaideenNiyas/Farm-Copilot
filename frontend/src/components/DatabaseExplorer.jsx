
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
        <div className="text-center py-8">
          <p className="text-slate-600">No items selected for comparison. Add items using the "Compare" button.</p>
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
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900">Comparing {comparisonItems.length} varieties</h3>
          <button onClick={clearComparison} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 hover:text-slate-900 transition-all">
            Clear All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">Attribute</th>
                {comparisonItems.map((item) => (
                  <th key={item.id} className="px-4 py-3 text-left text-sm font-semibold text-slate-900 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{item.name}</div>
                      <button
                        onClick={() => removeComparison(item.id)}
                        className="text-slate-400 hover:text-red-500 ml-2"
                        title="Remove from comparison"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {attributes.map((attr) => (
                <tr key={attr} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 bg-slate-50">{attr}</td>
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
                    return <td key={`${item.id}-${attr}`} className="px-4 py-3 text-sm text-slate-700">{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <span className="text-2xl">🗃️</span>
          Database Explorer
          <span className="bg-slate-100 text-teal-600 text-base font-semibold px-3 py-1 rounded-full">147 Varieties</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
          Explore our comprehensive database of 51 rice varieties, 53 agroforestry species,
          43 crop varieties, and 15 agro-climatic zones with advanced filtering and comparison tools.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search varieties by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
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
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
          >
            <option value="all">All Zones</option>
            {getUniqueZones().map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>

          <select
            value={carbonFilter}
            onChange={(e) => setCarbonFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
          >
            <option value="all">All Carbon Levels</option>
            <option value="low">Low (≤3 tCO₂/ha)</option>
            <option value="medium">Medium (3-5 tCO₂/ha)</option>
            <option value="high">High (5 tCO₂/ha)</option>
          </select>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={resetFilters} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-md hover:bg-slate-200 hover:text-slate-900 transition-all">
            <i className="fas fa-undo"></i>
            Reset Filters
          </button>
          {comparisonItems.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(!showComparisonModal)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white border border-teal-500 rounded-md hover:bg-teal-600 transition-all"
            >
              <i className="fas fa-balance-scale"></i>
              Compare ({comparisonItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="text-base text-slate-600 font-medium">
          <strong className="text-slate-900">{filteredVarieties.length}</strong> varieties found
          {searchTerm && <span> for "{searchTerm}"</span>}
        </div>
        <div className="bg-white border border-slate-200 rounded-md flex overflow-hidden">
          <button
            className={`px-3 py-2 border-none bg-transparent text-slate-600 cursor-pointer transition-all ${view === "cards" ? "bg-teal-500 text-white" : ""}`}
            onClick={() => setView("cards")}
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`px-3 py-2 border-none bg-transparent text-slate-600 cursor-pointer transition-all ${view === "table" ? "bg-teal-500 text-white" : ""}`}
            onClick={() => setView("table")}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/10">
          <div className="absolute inset-0" onClick={() => setShowComparisonModal(false)}></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl max-h-90vh overflow-hidden flex flex-col w-full max-w-7xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">Variety Comparison</h2>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {renderComparisonTable()}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/10">
          <div className="absolute inset-0" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl max-h-90vh overflow-hidden flex flex-col w-full max-w-4xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">{detailsItem.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {/* Header Section */}
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{detailsItem.name}</h3>
                {detailsItem.scientific_name && (
                  <p className="text-slate-600 italic text-lg">{detailsItem.scientific_name}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="bg-teal-100 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {detailsItem.type}
                  </span>
                  {detailsItem.category && (
                    <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full capitalize">
                      {detailsItem.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Basic Information
                  </h4>

                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-600 mb-1">Zone</div>
                      <div className="text-slate-900 font-semibold">
                        {detailsItem.zone || "Multiple"}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-600 mb-1">Carbon Potential</div>
                      <div className="text-slate-900 font-semibold">
                        {detailsItem.carbon_potential ?
                          `${detailsItem.carbon_potential} tCO₂/ha` :
                          "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features & Management */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Features & Management
                  </h4>

                  <div className="space-y-3">
                    {detailsItem.special_features && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-700 mb-2">Special Features</div>
                        <div className="text-slate-900 text-sm leading-relaxed">
                          {String(detailsItem.special_features)}
                        </div>
                      </div>
                    )}

                    {detailsItem.management && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-700 mb-2">Management</div>
                        <div className="text-slate-900 text-sm leading-relaxed">
                          {String(detailsItem.management)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {Object.entries(detailsItem).some(([key, value]) =>
                !['id', 'name', 'scientific_name', 'type', 'category', 'zone', 'carbon_potential', 'special_features', 'management'].includes(key) &&
                value &&
                value !== "N/A"
              ) && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Additional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(detailsItem).map(([key, value]) => {
                      if (['id', 'name', 'scientific_name', 'type', 'category', 'zone', 'carbon_potential', 'special_features', 'management'].includes(key) || !value || value === "N/A") {
                        return null;
                      }
                      return (
                        <div key={key} className="bg-slate-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-slate-600 mb-1">
                            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-slate-900 text-sm">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filteredVarieties.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No varieties found</h3>
          <p className="text-slate-600">Try adjusting your search terms or filters.</p>
        </div>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVarieties.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-teal-500 hover:shadow-lg">
              <div className="flex justify-between items-start mb-4 gap-2">
                <h3 className="text-lg font-semibold text-slate-900 flex-1">{item.name}</h3>
                <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-1 rounded-full text-transform uppercase">{item.type}</span>
              </div>

              {item.scientific_name && (
                <div className="italic text-slate-600 text-sm mb-2">
                  {item.scientific_name}
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-600 font-medium">Zone:</span>
                  <span className="text-slate-900 font-semibold">{item.zone || "Multiple"}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-600 font-medium">Carbon Potential:</span>
                  <span className="text-slate-900 font-semibold">
                    {item.carbon_potential || "N/A"}
                    {item.carbon_potential !== "N/A" && " tCO₂/ha"}
                  </span>
                </div>
                {item.special_features && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">Key Features:</span>
                    <span className="text-sm text-slate-900 leading-relaxed">
                      {String(item.special_features).slice(0, 100)}
                      {String(item.special_features).length > 100 && "..."}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => showDetails(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-transparent border border-slate-200 text-slate-700 rounded-md hover:bg-slate-100 transition-all"
                >
                  <i className="fas fa-info-circle"></i>
                  Details
                </button>
                <button
                  onClick={() => toggleComparison(item)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all ${comparisonItems.find(i => i.id === item.id) ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
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
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Zone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Carbon Potential</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Key Features</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVarieties.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.scientific_name && (
                        <div className="text-sm text-slate-600 italic">
                          {item.scientific_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.zone || "Multiple"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.carbon_potential || "N/A"}
                    {item.carbon_potential !== "N/A" && " tCO₂/ha"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {(item.special_features || item.management || item.suitable_crops || "").slice(0, 100)}
                    {(item.special_features || item.management || item.suitable_crops || "").length > 100 && "..."}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => showDetails(item)}
                        className="px-2 py-1 text-xs bg-transparent border border-slate-200 text-slate-700 rounded hover:bg-slate-100"
                        title="View Details"
                      >
                        <i className="fas fa-info"></i>
                      </button>
                      <button
                        onClick={() => toggleComparison(item)}
                        className={`px-2 py-1 text-xs rounded ${comparisonItems.find(i => i.id === item.id) ? 'bg-teal-500 text-white border-teal-500' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
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
