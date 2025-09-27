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
    <section id="analysis-hub" className="section">
      <h2 className="section-title">📈 Analysis Hub</h2>
      <p className="mb-4 text-gray-600">
        Compare suitability scores, analyze carbon potential, and visualize farm
        insights across zones and varieties.
      </p>

      <div className="analysis-grid">
        {/* Suitability Comparison */}
        <div className="analysis-card">
          <h3>Variety Suitability Comparison</h3>
          <div
            className="chart-wrapper"
            style={{ position: "relative", height: "300px" }}
          >
            <canvas ref={suitabilityChartRef}></canvas>
          </div>
        </div>

        {/* Zone Carbon Potential */}
        <div className="analysis-card">
          <h3>Zone-wise Carbon Potential</h3>
          <div
            className="chart-wrapper"
            style={{ position: "relative", height: "300px" }}
          >
            <canvas ref={zoneCarbonChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="insights-panel mt-6">
        <h3>Insights</h3>
        <ul className="list-disc ml-6 text-gray-700">
          <li>
            <strong>Zone 12</strong> shows the highest carbon potential at 4.5
            tCO2/ha/yr.
          </li>
          <li>
            <strong>Swarna Rice</strong> has the highest suitability score (92%)
            among tested varieties.
          </li>
          <li>
            Agroforestry integration with <strong>Neem</strong> improves soil
            fertility and resilience.
          </li>
        </ul>
      </div>
    </section>
  );
}

export default AnalysisHub;
