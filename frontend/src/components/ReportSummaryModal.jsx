import React from 'react';

function ReportSummaryModal({ isOpen, onClose, report, onViewFullReport }) {
  if (!isOpen || !report) return null;

  const summary = report.report_data?.report?.final_summary ||
                 report.report_data?.metadata?.summary ||
                 "Comprehensive agricultural analysis completed. Please review the detailed recommendations and implementation plan.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/10">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Analysis Report Summary</h2>
              <p className="text-green-100">{report.farm_id} • {new Date(report.created_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <i className="fas fa-file-alt text-green-500"></i>
              Executive Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-seedling"></i>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {report.report_data?.report?.carbon_revenue?.realistic_carbon_potential_t_ha || 'N/A'}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Carbon Potential (t/ha)</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {report.farm?.village || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">{report.farm?.district || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Crop Recommendations */}
          {report.report_data?.report?.recommendations && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fas fa-leaf text-green-500"></i>
                Recommended Crops
              </h3>

              {/* Rice Varieties */}
              {report.report_data.report.recommendations.rice_varieties && report.report_data.report.recommendations.rice_varieties.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-seedling text-teal-500"></i>
                    Rice Varieties ({report.report_data.report.recommendations.rice_varieties.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.report_data.report.recommendations.rice_varieties.slice(0, 4).map((variety, index) => (
                      <div key={index} className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-teal-800 text-sm">
                            {variety.variety_name || variety.name || `Variety ${index + 1}`}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                            variety.suitability_score > 0.8 ? 'bg-green-500' :
                            variety.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {variety.suitability_score > 0.8 ? 'High' : variety.suitability_score > 0.6 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        {variety.expected_yield && (
                          <div className="text-xs text-teal-600">
                            Yield: {variety.expected_yield}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Crops */}
              {report.report_data.report.recommendations.crops && report.report_data.report.recommendations.crops.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-leaf text-amber-500"></i>
                    Other Crops ({report.report_data.report.recommendations.crops.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.report_data.report.recommendations.crops.slice(0, 4).map((crop, index) => (
                      <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-amber-800 text-sm">
                            {crop.variety_name || crop.crop_name || crop.name || `Crop ${index + 1}`}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                            crop.suitability_score > 0.8 ? 'bg-green-500' :
                            crop.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {crop.suitability_score > 0.8 ? 'High' : crop.suitability_score > 0.6 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        {crop.expected_yield && (
                          <div className="text-xs text-amber-600">
                            Yield: {crop.expected_yield}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agroforestry */}
              {report.report_data.report.recommendations.agroforestry && report.report_data.report.recommendations.agroforestry.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-tree text-green-500"></i>
                    Agroforestry ({report.report_data.report.recommendations.agroforestry.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.report_data.report.recommendations.agroforestry.slice(0, 4).map((tree, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-green-800 text-sm">
                            {tree.variety_name || tree.tree_name || tree.name || `Tree ${index + 1}`}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${
                            tree.suitability_score > 0.8 ? 'bg-green-500' :
                            tree.suitability_score > 0.6 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {tree.suitability_score > 0.8 ? 'High' : tree.suitability_score > 0.6 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        {tree.carbon_potential && (
                          <div className="text-xs text-green-600">
                            Carbon: {tree.carbon_potential}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onViewFullReport(report);
                onClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-eye"></i>
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportSummaryModal;