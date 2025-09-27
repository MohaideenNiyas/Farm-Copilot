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
    <section id="carbon-calculator" className="section">
      <h2 className="section-title">💰 Carbon Credit Calculator</h2>
      <p className="mb-4 text-gray-600">
        Estimate potential carbon credits and value based on your farm details.
      </p>

      {/* Form */}
      <div className="form-grid">
        <div>
          <label className="form-label">Farm Size (ha)</label>
          <input
            type="number"
            name="farmSize"
            value={form.farmSize}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., 2.5"
          />
        </div>

        <div>
          <label className="form-label">Crop Type</label>
          <select
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select</option>
            <option value="rice">Rice Variety</option>
            <option value="agroforestry">Agroforestry Species</option>
            <option value="crops">Crop Variety</option>
          </select>
        </div>

        <div>
          <label className="form-label">Management Practice</label>
          <select
            name="practice"
            value={form.practice}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select</option>
            <option value="organic">Organic</option>
            <option value="conventional">Conventional</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions mt-4">
        <button className="btn btn--primary btn--lg" onClick={handleCalculate}>
          ⚡ Calculate
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="calculation-result card mt-6 p-4">
          <h3>Calculation Result</h3>
          <p>
            <strong>Estimated Carbon Credits:</strong> {result.carbon} tCO2/yr
          </p>
          <p>
            <strong>Estimated Value:</strong> ${result.value} / year
          </p>
        </div>
      )}
    </section>
  );
}

export default CarbonCalculator;
