import React, { useState } from "react";

function MRVCompliance() {
  const [form, setForm] = useState({
    cropType: "",
    documentation: false,
    monitoring: false,
    reporting: false,
  });

  const [complianceResult, setComplianceResult] = useState(null);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCheckCompliance = () => {
    let complianceScore = 0;
    if (form.documentation) complianceScore += 30;
    if (form.monitoring) complianceScore += 35;
    if (form.reporting) complianceScore += 35;

    let status =
      complianceScore === 100
        ? "✅ Fully MRV Compliant"
        : complianceScore >= 60
        ? "⚠️ Partially Compliant"
        : "❌ Not Compliant";

    setComplianceResult({
      score: complianceScore,
      status,
    });
  };

  return (
    <section id="mrv-compliance" className="section">
      <h2 className="section-title">✅ MRV Compliance Checker</h2>
      <p className="mb-4 text-gray-600">
        Check if your farm practices meet Monitoring, Reporting, and Verification
        standards for carbon credits.
      </p>

      {/* Form */}
      <div className="form-grid">
        <div>
          <label className="form-label">Crop Type</label>
          <select
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select</option>
            <option value="rice">Rice</option>
            <option value="agroforestry">Agroforestry</option>
            <option value="crops">Crops</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="documentation"
            checked={form.documentation}
            onChange={handleChange}
          />
          <label className="form-label">Proper Documentation</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="monitoring"
            checked={form.monitoring}
            onChange={handleChange}
          />
          <label className="form-label">Regular Monitoring</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="reporting"
            checked={form.reporting}
            onChange={handleChange}
          />
          <label className="form-label">Annual Reporting</label>
        </div>
      </div>

      {/* Action */}
      <div className="form-actions mt-4">
        <button className="btn btn--primary btn--lg" onClick={handleCheckCompliance}>
          🔍 Check Compliance
        </button>
      </div>

      {/* Results */}
      {complianceResult && (
        <div className="compliance-result card mt-6 p-4">
          <h3>Compliance Result</h3>
          <p>
            <strong>Score:</strong> {complianceResult.score} / 100
          </p>
          <p>
            <strong>Status:</strong> {complianceResult.status}
          </p>
        </div>
      )}
    </section>
  );
}

export default MRVCompliance;
