import React, { useEffect, useState } from "react";
import applicationData from "../data/applicationData";

function ZoneAnalysis() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (applicationData && applicationData.agro_climatic_zones) {
      setZones(applicationData.agro_climatic_zones);
    }
  }, []);

  return (
    <section id="zone-analysis" className="section">
      {/* Section Title */}
      <h2 className="section-title">
        Complete Zone Analysis - All 15 Agro-Climatic Zones
      </h2>

      {/* Overview Description */}
      <div className="zone-overview">
        <p className="zone-description">
          India's 15 agro-climatic zones provide diverse opportunities for carbon credit
          generation through rice carbon systems and agroforestry. Each zone has unique
          characteristics that influence crop selection and carbon sequestration potential.
        </p>
      </div>

      {/* Zone Grid */}
      <div className="zone-grid" id="zone-grid">
        {zones.map((zone, idx) => (
          <div key={idx} className="zone-card">
            {/* Zone Header */}
            <div className="zone-header">
              <h3 className="zone-name">{zone.zone_name}</h3>
            </div>

            {/* Zone Body */}
            <div className="zone-body">
              <div className="zone-characteristics">
                <div className="characteristic">
                  <span className="characteristic-label">States</span>
                  <span className="characteristic-value">
                    {Array.isArray(zone.states) ? zone.states.join(", ") : zone.states}
                  </span>
                </div>

                <div className="characteristic">
                  <span className="characteristic-label">Rainfall</span>
                  <span className="characteristic-value">
                    {zone.rainfall_min}-{zone.rainfall_max} mm
                  </span>
                </div>

                <div className="characteristic">
                  <span className="characteristic-label">Temperature</span>
                  <span className="characteristic-value">
                    {zone.temp_min}-{zone.temp_max}°C
                  </span>
                </div>

                <div className="characteristic">
                  <span className="characteristic-label">Carbon Potential</span>
                  <span className="characteristic-value">
                    {zone.carbon_potential[0]}-{zone.carbon_potential[1]} t CO₂/ha/year
                  </span>
                </div>
              </div>

              {/* Suitable Crops */}
              <div className="zone-section">
                <h4>Suitable Crops</h4>
                <div className="zone-list">
                  {zone.suitable_crops.map((crop, i) => (
                    <span key={i} className="zone-item">{crop}</span>
                  ))}
                </div>
              </div>

              {/* Agroforestry Trees */}
              <div className="zone-section">
                <h4>Agroforestry Trees</h4>
                <div className="zone-list">
                  {zone.suitable_trees.map((tree, i) => (
                    <span key={i} className="zone-item">{tree}</span>
                  ))}
                </div>
              </div>

              {/* Rice Varieties (if any) */}
              {zone.rice_varieties && zone.rice_varieties.length > 0 && (
                <div className="zone-section">
                  <h4>Rice Varieties ({zone.rice_varieties.length})</h4>
                  <div className="zone-list">
                    {zone.rice_varieties.map((variety, i) => (
                      <span key={i} className="zone-item">{variety}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ZoneAnalysis;
