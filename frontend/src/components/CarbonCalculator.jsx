import React, { useState } from "react";

function CarbonCalculator() {
  const [form, setForm] = useState({
    farmSize: "",
    cropType: "",
    practice: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCalculate = () => {
    // Mock formula for now
    let baseFactor = 0;

    if (form.cropType === "rice") baseFactor = 2.5;
    if (form.cropType === "agroforestry") baseFactor = 3.8;
    if (form.cropType === "crops") baseFactor = 2.0;

    if (form.practice === "organic") baseFactor *= 1.2;
    if (form.practice === "conventional") baseFactor *= 1.0;

    const totalCredits = (form.farmSize || 0) * baseFactor;

    setResult({
      carbon: totalCredits.toFixed(2),
      value: (totalCredits * 20).toFixed(2), // Assume $20 per credit
    });
  };

  return (
    <section id="carbon-calculator" className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <span className="text-2xl">💰</span>
          Carbon Credit Calculator
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Estimate potential carbon credits and value based on your farm details.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Farm Size (ha)</label>
            <input
              type="number"
              name="farmSize"
              value={form.farmSize}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40"
              placeholder="e.g., 2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Crop Type</label>
            <select
              name="cropType"
              value={form.cropType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
            >
              <option value="">Select</option>
              <option value="rice">Rice Variety</option>
              <option value="agroforestry">Agroforestry Species</option>
              <option value="crops">Crop Variety</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Management Practice</label>
            <select
              name="practice"
              value={form.practice}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 appearance-none"
            >
              <option value="">Select</option>
              <option value="organic">Organic</option>
              <option value="conventional">Conventional</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-all shadow-md hover:shadow-lg" onClick={handleCalculate}>
            <span className="text-lg">⚡</span>
            Calculate
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Calculation Result</h3>
          <div className="space-y-2">
            <p className="text-green-700">
              <strong className="text-green-900">Estimated Carbon Credits:</strong> {result.carbon} tCO2/yr
            </p>
            <p className="text-green-700">
              <strong className="text-green-900">Estimated Value:</strong> ${result.value} / year
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default CarbonCalculator;
