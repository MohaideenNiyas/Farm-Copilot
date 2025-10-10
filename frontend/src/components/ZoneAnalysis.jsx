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
    <section id="zone-analysis" className="max-w-7xl mx-auto px-4 py-8">
      {/* Section Title */}
      <h2 className="text-3xl font-semibold text-teal-500 mb-4 pb-3 border-b-2 border-slate-200 flex items-center gap-2">
        Complete Zone Analysis - All 15 Agro-Climatic Zones
      </h2>

      {/* Overview Description */}
      <div className="mb-8">
        <p className="text-base leading-relaxed text-slate-600 max-w-4xl mx-auto">
          India's 15 agro-climatic zones provide diverse opportunities for carbon credit
          generation through rice carbon systems and agroforestry. Each zone has unique
          characteristics that influence crop selection and carbon sequestration potential.
        </p>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="zone-grid">
        {zones.map((zone, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all duration-300 flex flex-col">
            {/* Zone Header */}
            <div className="mb-4 pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-teal-500 text-center">{zone.zone_name}</h3>
            </div>

            {/* Zone Body */}
            <div className="flex flex-col gap-4 flex-grow">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100 p-2.5 rounded-md text-left">
                  <span className="text-xs font-medium text-slate-600 block mb-1">States</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {Array.isArray(zone.states) ? zone.states.join(", ") : zone.states}
                  </span>
                </div>

                <div className="bg-slate-100 p-2.5 rounded-md text-left">
                  <span className="text-xs font-medium text-slate-600 block mb-1">Rainfall</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {zone.rainfall_min}-{zone.rainfall_max} mm
                  </span>
                </div>

                <div className="bg-slate-100 p-2.5 rounded-md text-left">
                  <span className="text-xs font-medium text-slate-600 block mb-1">Temperature</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {zone.temp_min}-{zone.temp_max}°C
                  </span>
                </div>

                <div className="bg-slate-100 p-2.5 rounded-md text-left">
                  <span className="text-xs font-medium text-slate-600 block mb-1">Carbon Potential</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {zone.carbon_potential[0]}-{zone.carbon_potential[1]} t CO₂/ha/year
                  </span>
                </div>
              </div>

              {/* Suitable Crops */}
              <div className="mt-3 pt-3 border-t border-slate-200 text-left">
                <h4 className="text-sm font-semibold mb-2 text-slate-900 border-l-3 border-teal-500 pl-2">Suitable Crops</h4>
                <div className="flex flex-wrap gap-2">
                  {zone.suitable_crops.map((crop, i) => (
                    <span key={i} className="bg-slate-100 text-teal-600 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all hover:bg-teal-500 hover:text-white transform hover:scale-105">{crop}</span>
                  ))}
                </div>
              </div>

              {/* Agroforestry Trees */}
              <div className="mt-3 pt-3 border-t border-slate-200 text-left">
                <h4 className="text-sm font-semibold mb-2 text-slate-900 border-l-3 border-teal-500 pl-2">Agroforestry Trees</h4>
                <div className="flex flex-wrap gap-2">
                  {zone.suitable_trees.map((tree, i) => (
                    <span key={i} className="bg-slate-100 text-teal-600 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all hover:bg-teal-500 hover:text-white transform hover:scale-105">{tree}</span>
                  ))}
                </div>
              </div>

              {/* Rice Varieties (if any) */}
              {zone.rice_varieties && zone.rice_varieties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-left">
                  <h4 className="text-sm font-semibold mb-2 text-slate-900 border-l-3 border-teal-500 pl-2">Rice Varieties ({zone.rice_varieties.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {zone.rice_varieties.map((variety, i) => (
                      <span key={i} className="bg-slate-100 text-teal-600 text-xs font-medium px-2.5 py-1.5 rounded-full transition-all hover:bg-teal-500 hover:text-white transform hover:scale-105">{variety}</span>
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
