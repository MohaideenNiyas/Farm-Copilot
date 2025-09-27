// Application Data
const APP_DATA = {
  indian_states: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Jammu and Kashmir", "Ladakh"
  ],
  common_crops: [
    "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut", "Soybean", 
    "Pulses", "Millets", "Barley", "Oats", "Sunflower", "Mustard", "Sesame", 
    "Coconut", "Tea", "Coffee", "Spices", "Vegetables", "Fruits"
  ],
  sample_report: {
    "farm_id": "F001",
    "metadata": {
      "analysis_id": "AGR_2024_001",
      "analysis_date": "2024-09-04T20:48:00Z",
      "detected_zone": {
        "code": "Zone_10_Southern_Plateau",
        "name": "Southern Plateau and Hills Region",
        "climate_type": "Semi-arid to sub-humid",
        "elevation": "Medium"
      }
    },
    "report": {
      "farm_profile": {
        "location": {"latitude": 10.546179, "longitude": 76.41653},
        "climate": {
          "annual_rainfall_mm": 1245,
          "avg_temp_c": 28.5,
          "vegetation_health": "Good"
        },
        "soil": {
          "type": "Red lateritic",
          "ph": 6.8,
          "ph_status": "Slightly acidic",
          "organic_carbon_pct": 2.1
        }
      },
      "recommendations": {
        "rice_varieties": [
          {"name": "BPT-5204", "suitability_score": 0.89, "carbon_potential": 3.0},
          {"name": "Swarna-Sub1", "suitability_score": 0.82, "carbon_potential": 3.2},
          {"name": "Rice Variety 15", "suitability_score": 0.75, "carbon_potential": 2.4}
        ],
        "crops": [
          {"name": "Groundnut TAG-24", "suitability_score": 0.91, "carbon_potential": 2.5},
          {"name": "Cotton Bt", "suitability_score": 0.78, "carbon_potential": 2.0},
          {"name": "Soybean JS-335", "suitability_score": 0.72, "carbon_potential": 2.5}
        ],
        "agroforestry": [
          {"name": "Sandalwood", "suitability_score": 0.95, "carbon_potential": 8.8},
          {"name": "Teak Premium", "suitability_score": 0.87, "carbon_potential": 15.2},
          {"name": "Tree Species 12", "suitability_score": 0.73, "carbon_potential": 6.5}
        ]
      },
      "carbon_revenue": {
        "realistic_carbon_potential_t_ha": 5.2,
        "estimated_annual_credits": 4.42,
        "estimated_revenue_inr": 1105
      },
      "risks": {
        "climate": "Moderate drought risk during dry periods",
        "soil": "Slightly acidic soil may require lime application",
        "market": "Price volatility for cash crops"
      },
      "actions": [
        "Consider soil pH management with organic amendments",
        "Implement water conservation techniques",
        "Diversify with drought-resistant varieties",
        "Explore carbon credit opportunities"
      ]
    }
  }
};

// Application State
let currentStep = 1;
let formData = {};
let processingSteps = [
  { id: 'step-1', name: 'farms_loaded', duration: 10000, message: 'Loading farm data...' },
  { id: 'step-2', name: 'weather_data', duration: 15000, message: 'Fetching weather data...' },
  { id: 'step-3', name: 'soil_data', duration: 12000, message: 'Analyzing soil conditions...' },
  { id: 'step-4', name: 'satellite_data', duration: 18000, message: 'Processing satellite imagery...' },
  { id: 'step-5', name: 'recommendations', duration: 20000, message: 'Generating recommendations...' },
  { id: 'step-6', name: 'reports', duration: 8000, message: 'Creating detailed reports...' }
];

// DOM Elements
let farmerFormSection, processingSection, resultsSection, farmerForm;
let overallProgress, overallPercentage, overallStatus, resultsContent;

// Utility Functions
function generateFarmId() {
  // Reset counter to start from 1 for demo purposes
  const count = 1;
  return `F${count.toString().padStart(3, '0')}`;
}

function generateFarmerId() {
  // Reset counter to start from 1 for demo purposes  
  const count = 1;
  return `NBF_${count.toString().padStart(3, '0')}`;
}

function showSection(sectionToShow) {
  const sections = [farmerFormSection, processingSection, resultsSection];
  sections.forEach(section => {
    if (section) {
      section.classList.add('hidden');
    }
  });
  if (sectionToShow) {
    sectionToShow.classList.remove('hidden');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function populateDropdowns() {
  const stateSelect = document.getElementById('state');
  const cropSelect = document.getElementById('main-crop');

  if (!stateSelect || !cropSelect) {
    console.error('Dropdown elements not found');
    return;
  }

  // Clear existing options first (except the default option)
  stateSelect.innerHTML = '<option value="">Select State</option>';
  cropSelect.innerHTML = '<option value="">Select Main Crop</option>';

  // Populate states
  APP_DATA.indian_states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });

  // Populate crops
  APP_DATA.common_crops.forEach(crop => {
    const option = document.createElement('option');
    option.value = crop;
    option.textContent = crop;
    cropSelect.appendChild(option);
  });

  console.log('Dropdowns populated successfully');
  console.log('States options:', stateSelect.options.length);
  console.log('Crops options:', cropSelect.options.length);
}

function validateForm(formData) {
  const errors = [];

  if (!formData['farmer-name'] || formData['farmer-name'].trim().length < 2) {
    errors.push('Farmer name must be at least 2 characters long');
  }

  const lat = parseFloat(formData.latitude);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  const lng = parseFloat(formData.longitude);
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  const area = parseFloat(formData.area);
  if (isNaN(area) || area < 0.1) {
    errors.push('Area must be at least 0.1 hectares');
  }

  if (!formData.village || formData.village.trim().length < 2) {
    errors.push('Village name is required');
  }

  if (!formData.district || formData.district.trim().length < 2) {
    errors.push('District name is required');
  }

  if (!formData.state) {
    errors.push('State selection is required');
  }

  if (!formData['main-crop']) {
    errors.push('Main crop selection is required');
  }

  return errors;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  
  switch(type) {
    case 'success':
      notification.style.background = 'var(--color-success)';
      break;
    case 'error':
      notification.style.background = 'var(--color-error)';
      break;
    default:
      notification.style.background = 'var(--color-info)';
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Processing Functions
async function startProcessing() {
  showSection(processingSection);
  
  let totalProgress = 0;
  const totalDuration = processingSteps.reduce((sum, step) => sum + step.duration, 0);
  
  if (overallStatus) {
    overallStatus.textContent = 'Initializing analysis...';
  }
  
  for (let i = 0; i < processingSteps.length; i++) {
    const step = processingSteps[i];
    const stepElement = document.getElementById(step.id);
    
    if (!stepElement) continue;
    
    const stepStatus = stepElement.querySelector('.step-status');
    const stepSpinner = stepElement.querySelector('.step-spinner');
    const stepCheck = stepElement.querySelector('.step-check');
    const stepIcon = stepElement.querySelector('.step-icon i:first-child');
    
    // Activate current step
    stepElement.classList.add('active');
    if (stepStatus) stepStatus.textContent = 'Processing...';
    if (stepSpinner) stepSpinner.classList.remove('hidden');
    if (stepIcon) stepIcon.style.display = 'none';
    if (overallStatus) overallStatus.textContent = step.message;
    
    // Animate progress for this step
    const startProgress = totalProgress;
    const stepProgressAmount = (step.duration / totalDuration) * 100;
    
    await animateProgress(step.duration, (progress) => {
      const currentStepProgress = startProgress + (stepProgressAmount * progress);
      if (overallProgress) {
        overallProgress.style.width = `${currentStepProgress}%`;
      }
      if (overallPercentage) {
        overallPercentage.textContent = `${Math.round(currentStepProgress)}%`;
      }
    });
    
    // Complete current step
    totalProgress += stepProgressAmount;
    stepElement.classList.remove('active');
    stepElement.classList.add('completed');
    if (stepStatus) stepStatus.textContent = 'Completed';
    if (stepSpinner) stepSpinner.classList.add('hidden');
    if (stepCheck) stepCheck.classList.remove('hidden');
    if (stepIcon) stepIcon.style.display = 'block';
  }
  
  // Final progress update
  if (overallProgress) overallProgress.style.width = '100%';
  if (overallPercentage) overallPercentage.textContent = '100%';
  if (overallStatus) overallStatus.textContent = 'Analysis complete!';
  
  setTimeout(() => {
    showResults();
  }, 1500);
}

function animateProgress(duration, onProgress) {
  return new Promise(resolve => {
    const startTime = Date.now();
    
    function updateProgress() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      onProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        resolve();
      }
    }
    
    updateProgress();
  });
}

// Results Functions
function showResults() {
  showSection(resultsSection);
  displayResults(APP_DATA.sample_report);
}

function displayResults(report) {
  if (!resultsContent) return;
  
  const { metadata, report: reportData } = report;
  
  resultsContent.innerHTML = `
    <!-- Farm Profile -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon farm-profile">
          <i class="fas fa-tractor"></i>
        </div>
        <h3 class="result-card-title">Farm Profile Summary</h3>
      </div>
      <div class="result-card-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Location</span>
            <span class="info-value">${reportData.farm_profile.location.latitude.toFixed(6)}, ${reportData.farm_profile.location.longitude.toFixed(6)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Annual Rainfall</span>
            <span class="info-value">${reportData.farm_profile.climate.annual_rainfall_mm} mm</span>
          </div>
          <div class="info-item">
            <span class="info-label">Average Temperature</span>
            <span class="info-value">${reportData.farm_profile.climate.avg_temp_c}°C</span>
          </div>
          <div class="info-item">
            <span class="info-label">Vegetation Health</span>
            <span class="info-value">${reportData.farm_profile.climate.vegetation_health}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Soil Type</span>
            <span class="info-value">${reportData.farm_profile.soil.type}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Soil pH</span>
            <span class="info-value">${reportData.farm_profile.soil.ph} (${reportData.farm_profile.soil.ph_status})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detected Zone -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon zone">
          <i class="fas fa-globe-americas"></i>
        </div>
        <h3 class="result-card-title">Agro-climatic Zone</h3>
      </div>
      <div class="result-card-body">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Zone Code</span>
            <span class="info-value">${metadata.detected_zone.code}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Zone Name</span>
            <span class="info-value">${metadata.detected_zone.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Climate Type</span>
            <span class="info-value">${metadata.detected_zone.climate_type}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Elevation</span>
            <span class="info-value">${metadata.detected_zone.elevation}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rice Varieties -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon recommendations">
          <i class="fas fa-wheat-awn"></i>
        </div>
        <h3 class="result-card-title">Recommended Rice Varieties</h3>
      </div>
      <div class="result-card-body">
        ${reportData.recommendations.rice_varieties.map(variety => `
          <div class="recommendation-item">
            <div class="recommendation-name">${variety.name}</div>
            <div class="recommendation-score">
              <span class="score-value">${Math.round(variety.suitability_score * 100)}%</span>
              <span style="color: var(--color-text-secondary);">${variety.carbon_potential}t CO₂</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Other Crops -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon recommendations">
          <i class="fas fa-leaf"></i>
        </div>
        <h3 class="result-card-title">Recommended Crops</h3>
      </div>
      <div class="result-card-body">
        ${reportData.recommendations.crops.map(crop => `
          <div class="recommendation-item">
            <div class="recommendation-name">${crop.name}</div>
            <div class="recommendation-score">
              <span class="score-value">${Math.round(crop.suitability_score * 100)}%</span>
              <span style="color: var(--color-text-secondary);">${crop.carbon_potential}t CO₂</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Agroforestry -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon recommendations">
          <i class="fas fa-tree"></i>
        </div>
        <h3 class="result-card-title">Agroforestry Options</h3>
      </div>
      <div class="result-card-body">
        ${reportData.recommendations.agroforestry.map(tree => `
          <div class="recommendation-item">
            <div class="recommendation-name">${tree.name}</div>
            <div class="recommendation-score">
              <span class="score-value">${Math.round(tree.suitability_score * 100)}%</span>
              <span style="color: var(--color-text-secondary);">${tree.carbon_potential}t CO₂</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Carbon Revenue -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon carbon">
          <i class="fas fa-coins"></i>
        </div>
        <h3 class="result-card-title">Carbon Revenue Potential</h3>
      </div>
      <div class="result-card-body">
        <div class="carbon-metric">
          <span class="carbon-label">Carbon Potential (t/ha)</span>
          <span class="carbon-value">${reportData.carbon_revenue.realistic_carbon_potential_t_ha}</span>
        </div>
        <div class="carbon-metric">
          <span class="carbon-label">Estimated Annual Credits</span>
          <span class="carbon-value">${reportData.carbon_revenue.estimated_annual_credits}</span>
        </div>
        <div class="carbon-metric">
          <span class="carbon-label">Estimated Revenue (INR)</span>
          <span class="carbon-value highlight">₹${reportData.carbon_revenue.estimated_revenue_inr.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Risk Analysis -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon risks">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="result-card-title">Risk Analysis</h3>
      </div>
      <div class="result-card-body">
        <div class="risk-item">
          <strong>Climate:</strong> ${reportData.risks.climate}
        </div>
        <div class="risk-item">
          <strong>Soil:</strong> ${reportData.risks.soil}
        </div>
        <div class="risk-item">
          <strong>Market:</strong> ${reportData.risks.market}
        </div>
      </div>
    </div>

    <!-- Action Items -->
    <div class="result-card">
      <div class="result-card-header">
        <div class="result-card-icon actions">
          <i class="fas fa-tasks"></i>
        </div>
        <h3 class="result-card-title">Recommended Actions</h3>
      </div>
      <div class="result-card-body">
        ${reportData.actions.map(action => `
          <div class="action-item">${action}</div>
        `).join('')}
      </div>
    </div>
  `;
}

// Event Handlers
function handleFormSubmit(event) {
  event.preventDefault();
  
  console.log('Form submitted');
  
  // Collect form data
  const formElements = farmerForm.elements;
  formData = {};
  
  for (let element of formElements) {
    if (element.name && element.type !== 'submit') {
      formData[element.name] = element.value;
    }
  }
  
  console.log('Form data collected:', formData);
  
  // Validate form
  const errors = validateForm(formData);
  if (errors.length > 0) {
    console.log('Form validation errors:', errors);
    showNotification(errors[0], 'error');
    return;
  }
  
  // Show success and start processing
  showNotification('Farm data submitted successfully!', 'success');
  setTimeout(() => {
    startProcessing();
  }, 1000);
}

function handleExportPDF() {
  showNotification('PDF export functionality would be implemented here', 'info');
}

function handlePrintReport() {
  window.print();
}

function handleNewAnalysis() {
  // Reset form
  if (farmerForm) {
    farmerForm.reset();
    document.getElementById('farm-id').value = generateFarmId();
    document.getElementById('farmer-id').value = generateFarmerId();
  }
  
  // Reset processing steps
  processingSteps.forEach(step => {
    const stepElement = document.getElementById(step.id);
    if (!stepElement) return;
    
    const stepStatus = stepElement.querySelector('.step-status');
    const stepSpinner = stepElement.querySelector('.step-spinner');
    const stepCheck = stepElement.querySelector('.step-check');
    const stepIcon = stepElement.querySelector('.step-icon i:first-child');
    
    stepElement.classList.remove('active', 'completed');
    if (stepStatus) stepStatus.textContent = 'Pending';
    if (stepSpinner) stepSpinner.classList.add('hidden');
    if (stepCheck) stepCheck.classList.add('hidden');
    if (stepIcon) stepIcon.style.display = 'block';
  });
  
  // Reset progress
  if (overallProgress) overallProgress.style.width = '0%';
  if (overallPercentage) overallPercentage.textContent = '0%';
  if (overallStatus) overallStatus.textContent = 'Initializing...';
  
  // Show form
  showSection(farmerFormSection);
  showNotification('Ready for new farm analysis', 'success');
}

// Initialization
function init() {
  console.log('Initializing AgriSmart application...');
  
  // Get DOM elements
  farmerFormSection = document.getElementById('farmer-form-section');
  processingSection = document.getElementById('processing-section');
  resultsSection = document.getElementById('results-section');
  farmerForm = document.getElementById('farmer-form');
  overallProgress = document.getElementById('overall-progress');
  overallPercentage = document.getElementById('overall-percentage');
  overallStatus = document.getElementById('overall-status');
  resultsContent = document.getElementById('results-content');
  
  // Check if all elements are found
  if (!farmerForm) {
    console.error('Farmer form not found');
    return;
  }
  
  // Generate initial IDs
  const farmIdInput = document.getElementById('farm-id');
  const farmerIdInput = document.getElementById('farmer-id');
  
  if (farmIdInput) farmIdInput.value = generateFarmId();
  if (farmerIdInput) farmerIdInput.value = generateFarmerId();
  
  // Populate dropdowns
  populateDropdowns();
  
  // Add event listeners
  farmerForm.addEventListener('submit', handleFormSubmit);
  
  const exportPdfBtn = document.getElementById('export-pdf');
  const printReportBtn = document.getElementById('print-report');
  const newAnalysisBtn = document.getElementById('new-analysis');
  
  if (exportPdfBtn) exportPdfBtn.addEventListener('click', handleExportPDF);
  if (printReportBtn) printReportBtn.addEventListener('click', handlePrintReport);
  if (newAnalysisBtn) newAnalysisBtn.addEventListener('click', handleNewAnalysis);
  
  // Auto-save form data
  const formInputs = farmerForm.querySelectorAll('input, select, textarea');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      try {
        const savedData = JSON.parse(localStorage.getItem('draftFormData') || '{}');
        savedData[input.name] = input.value;
        localStorage.setItem('draftFormData', JSON.stringify(savedData));
      } catch (e) {
        console.warn('Could not save form data:', e);
      }
    });
  });
  
  // Load saved form data
  try {
    const savedData = JSON.parse(localStorage.getItem('draftFormData') || '{}');
    Object.keys(savedData).forEach(key => {
      const input = farmerForm.querySelector(`[name="${key}"]`);
      if (input && key !== 'farm-id' && key !== 'farmer-id') {
        input.value = savedData[key];
      }
    });
  } catch (e) {
    console.warn('Could not load saved form data:', e);
  }
  
  console.log('AgriSmart application initialized successfully');
}

// CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(notificationStyles);

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}