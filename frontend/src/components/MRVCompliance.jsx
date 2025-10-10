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
    <section id="mrv-compliance" className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <span className="text-2xl">✅</span>
          MRV Compliance Checker
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Check if your farm practices meet Monitoring, Reporting, and Verification
          standards for carbon credits.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Crop Type</label>
            <select
              name="cropType"
              value={form.cropType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
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
              className="w-4 h-4 text-teal-500 bg-slate-50 border-slate-200 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label className="text-sm font-medium text-slate-700">Proper Documentation</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="monitoring"
              checked={form.monitoring}
              onChange={handleChange}
              className="w-4 h-4 text-teal-500 bg-slate-50 border-slate-200 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label className="text-sm font-medium text-slate-700">Regular Monitoring</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="reporting"
              checked={form.reporting}
              onChange={handleChange}
              className="w-4 h-4 text-teal-500 bg-slate-50 border-slate-200 rounded focus:ring-teal-500 focus:ring-2"
            />
            <label className="text-sm font-medium text-slate-700">Annual Reporting</label>
          </div>
        </div>

        {/* Action */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-all shadow-md hover:shadow-lg" onClick={handleCheckCompliance}>
            <span className="text-lg">🔍</span>
            Check Compliance
          </button>
        </div>
      </div>

      {/* Results */}
      {complianceResult && (
        <div className={`rounded-lg p-6 text-center border-2 ${
          complianceResult.score === 100 ? 'bg-green-50 border-green-200' :
          complianceResult.score >= 60 ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-xl font-semibold mb-4">Compliance Result</h3>
          <div className="space-y-2">
            <p className={`text-lg font-bold ${
              complianceResult.score === 100 ? 'text-green-800' :
              complianceResult.score >= 60 ? 'text-amber-800' :
              'text-red-800'
            }`}>
              Score: {complianceResult.score} / 100
            </p>
            <p className={`text-lg font-semibold ${
              complianceResult.score === 100 ? 'text-green-700' :
              complianceResult.score >= 60 ? 'text-amber-700' :
              'text-red-700'
            }`}>
              Status: {complianceResult.status}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default MRVCompliance;
