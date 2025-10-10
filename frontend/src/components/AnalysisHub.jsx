import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function AnalysisHub() {
  const suitabilityChartRef = useRef(null);
  const zoneCarbonChartRef = useRef(null);
  const suitabilityChartInstance = useRef(null);
  const zoneCarbonChartInstance = useRef(null);

  useEffect(() => {
    // Destroy old instances if they exist
    if (suitabilityChartInstance.current) {
      suitabilityChartInstance.current.destroy();
    }
    if (zoneCarbonChartInstance.current) {
      zoneCarbonChartInstance.current.destroy();
    }

    // Suitability Comparison (Bar Chart)
    if (suitabilityChartRef.current) {
      suitabilityChartInstance.current = new Chart(suitabilityChartRef.current, {
        type: "bar",
        data: {
          labels: ["Swarna (Rice)", "Groundnut (TAG-24)", "Neem (Tree)"],
          datasets: [
            {
              label: "Suitability Score",
              data: [0.92, 0.85, 0.88],
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
            },
          ],
        },
        options: {
          responsive: true,
          scales: { y: { min: 0, max: 1 } },
        },
      });
    }

    // Carbon Potential by Zone (Line Chart)
    if (zoneCarbonChartRef.current) {
      zoneCarbonChartInstance.current = new Chart(zoneCarbonChartRef.current, {
        type: "line",
        data: {
          labels: ["Zone 1", "Zone 2", "Zone 10", "Zone 12"],
          datasets: [
            {
              label: "Carbon Potential (tCO2/ha/yr)",
              data: [3.2, 4.1, 3.8, 4.5],
              borderColor: "#14b8a6",
              fill: false,
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // Cleanup when unmounting
    return () => {
      if (suitabilityChartInstance.current) {
        suitabilityChartInstance.current.destroy();
      }
      if (zoneCarbonChartInstance.current) {
        zoneCarbonChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <section id="analysis-hub" className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <span className="text-2xl">📈</span>
          Analysis Hub
        </h2>
        <p className="text-slate-600 max-w-3xl mx-auto">
          Compare suitability scores, analyze carbon potential, and visualize farm
          insights across zones and varieties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Suitability Comparison */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Variety Suitability Comparison</h3>
          <div className="relative h-75">
            <canvas ref={suitabilityChartRef}></canvas>
          </div>
        </div>

        {/* Zone Carbon Potential */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Zone-wise Carbon Potential</h3>
          <div className="relative h-75">
            <canvas ref={zoneCarbonChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Insights</h3>
        <ul className="space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <i className="fas fa-circle text-teal-500 text-xs mt-2 flex-shrink-0"></i>
            <span>
              <strong className="text-slate-900">Zone 12</strong> shows the highest carbon potential at 4.5
              tCO2/ha/yr.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <i className="fas fa-circle text-teal-500 text-xs mt-2 flex-shrink-0"></i>
            <span>
              <strong className="text-slate-900">Swarna Rice</strong> has the highest suitability score (92%)
              among tested varieties.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <i className="fas fa-circle text-teal-500 text-xs mt-2 flex-shrink-0"></i>
            <span>
              Agroforestry integration with <strong className="text-slate-900">Neem</strong> improves soil
              fertility and resilience.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default AnalysisHub;
