# Agricultural Recommendation Engine Pipeline v3.0
## Complete End-to-End AI-Powered Farming Solution

[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://github.com/yourusername/agri-recommendation-engine)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

### 🌾 Overview

A comprehensive agricultural recommendation system that processes farm location data, fetches multi-source agricultural data (weather, soil, satellite), generates intelligent crop and agroforestry recommendations using NABARD-compliant algorithms, and produces detailed AI-powered reports using Google Gemini.

### 🏗️ System Architecture

```
farms.csv → [Data Fetchers] → [Recommendation Engine] → [AI Report Generator] → Final Reports
    ↓              ↓                       ↓                      ↓
 Farm Data    Multi-source Data      JSON Recommendations    Detailed Analysis
             (Weather, Soil,          with Carbon Credits     with Gemini AI
              Satellite)
```

### 📋 Features

#### 🔄 **Complete Pipeline Automation**
- **Main Controller**: Orchestrates entire pipeline execution
- **Error Handling**: Robust error recovery and reporting
- **Data Validation**: Comprehensive input/output validation
- **Progress Tracking**: Real-time pipeline status monitoring

#### 📊 **Multi-Source Data Integration**
- **Weather Data**: Historical weather via Visual Crossing API
- **Soil Data**: Soil properties via ISRIC SoilGrids API
- **Satellite Data**: Vegetation indices via Google Earth Engine
- **Local Fallbacks**: Mock data generation when APIs unavailable

#### 🧠 **Advanced Recommendation Engine**
- **147 Crop Varieties**: Complete NABARD-compliant database
- **15 Agro-Climatic Zones**: Accurate zone detection system
- **Scientific Scoring**: Multi-factor suitability analysis
- **Realistic Carbon Calculations**: Market-based carbon credit estimates

#### 🤖 **AI-Powered Reporting**
- **Google Gemini Integration**: Advanced natural language processing
- **Structured Reports**: Comprehensive JSON format outputs
- **Business Intelligence**: Revenue and scaling analysis
- **Actionable Insights**: Farmer-friendly recommendations

### 🚀 Quick Start

#### 1. **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/agri-recommendation-engine.git
cd agri-recommendation-engine

# Install dependencies
pip install -r requirements.txt

# Set up authentication
earthengine authenticate  # For Google Earth Engine
export GOOGLE_API_KEY="your_gemini_api_key_here"
```

#### 2. **Prepare Input Data**

Create `farms.csv` with your farm data:
```csv
farm_id,farmer_id,farmer_name,lat,lon,area_ha,village,district,state,main_crop
F001,NBF_001,Arun Kumar,11.546179,76.41653,1.0,Kundrakudi,Karaikudi,Tamil Nadu,Rice
F002,NBF_002,Meena Devi,30.487916,75.456311,1.0,Kundrakudi,Karaikudi,Tamil Nadu,Groundnut
F003,NBF_003,Ramesh Babu,21.092091,86.377062,1.0,Kundrakudi,Karaikudi,Tamil Nadu,Maize
```

#### 3. **Run Complete Pipeline**

```bash
python main.py
```

This single command will:
1. ✅ Load and validate farm data
2. 🌤️ Fetch historical weather data
3. 🌱 Collect soil analysis data
4. 🛰️ Process satellite imagery
5. 🌾 Generate crop recommendations
6. 📄 Create detailed AI reports

### 📁 Project Structure

```
agricultural-pipeline/
├── main.py                    # 🎯 Main pipeline controller
├── farms.csv                  # 📊 Input farm data
├── requirements.txt           # 📋 Dependencies
├── README.md                  # 📖 This documentation
│
├── data_fetchers/
│   ├── weather_fetcher.py     # 🌤️ Weather data collection
│   ├── soil_fetcher.py        # 🌱 Soil analysis fetching
│   └── satellite_fetcher.py   # 🛰️ Satellite data processing
│
├── engine/
│   └── recommendation_engine.py # 🧠 NABARD recommendation system
│
├── reporting/
│   └── report_generator.py    # 🤖 AI report generation
│
├── data/                      # 📁 Raw data storage
│   ├── farm_weather_history.csv
│   ├── soil_test.csv
│   └── satellite_data_ultimate.csv
│
├── output/                    # 📁 Recommendation outputs
│   ├── perfected_recommendations_F001.json
│   ├── perfected_recommendations_F002.json
│   └── perfected_recommendations_F003.json
│
└── reports/                   # 📁 Final AI reports
    ├── fixed_agri_report_F001.json
    ├── fixed_agri_report_F002.json
    └── fixed_agri_report_F003.json
```

### 🔧 Component Details

#### **1. Weather Fetcher** (`weather_fetcher.py`)
- **API**: Visual Crossing Weather API
- **Data**: 365-day historical weather records
- **Metrics**: Temperature, rainfall, humidity, wind speed
- **Features**: Retry logic, rate limiting, error handling

#### **2. Soil Fetcher** (`soil_fetcher.py`)
- **API**: ISRIC SoilGrids v2.0
- **Data**: Soil properties at multiple depths
- **Analysis**: pH, texture, organic carbon, nutrient status
- **Features**: Caching, derived characteristics calculation

#### **3. Satellite Fetcher** (`satellite_fetcher.py`)
- **Platform**: Google Earth Engine
- **Data Sources**: Sentinel-2, MODIS, Sentinel-1
- **Indices**: NDVI, EVI, SAVI, LAI
- **Features**: Local saving (not Drive export), mock data fallback

#### **4. Recommendation Engine** (`recommendation_engine.py`)
- **Database**: 147 varieties across 15 agro-climatic zones
- **Algorithm**: Multi-factor suitability scoring
- **Outputs**: JSON recommendations with carbon credits
- **Features**: Zone detection, realistic carbon calculations

#### **5. Report Generator** (`report_generator.py`)
- **AI Model**: Google Gemini 1.5 Flash
- **Format**: Structured JSON reports
- **Analysis**: Business intelligence, risk assessment
- **Features**: Simplified schema, retry logic, batch processing

### 🎛️ Configuration Options

#### **Environment Variables**
```bash
export GOOGLE_API_KEY="your_gemini_api_key"          # Required for AI reports
export VISUAL_CROSSING_API_KEY="your_weather_key"    # Optional (default provided)
export EARTH_ENGINE_PROJECT="your_ee_project"        # Optional (default provided)
```

#### **Main Controller Parameters**
```python
# In main.py, you can modify:
WEATHER_DAYS_BACK = 365      # Historical weather period
SATELLITE_START_DATE = "2024-01-01"  # Satellite data range
SOIL_DEPTH_LAYERS = ["0-5cm", "5-15cm"]  # Soil analysis depths
RECOMMENDATION_TOP_N = 5     # Number of recommendations per category
```

### 📈 Output Formats

#### **Recommendation JSON Structure**
```json
{
  "analysis_id": "unique-uuid",
  "farm_profile": "enhanced_farm_data",
  "detected_zone": "Zone_10_Southern_Plateau",
  "recommendations": {
    "rice": [...],           # Top rice varieties
    "crops": [...],          # Top crop varieties  
    "agroforestry": [...]    # Top tree species
  },
  "realistic_carbon_potential": 5.2,
  "estimated_annual_credits": 4.42,
  "estimated_revenue": 110.5,
  "farming_scenario": {
    "rice_coverage": "40%",
    "primary_crop_coverage": "30%",
    "secondary_crop_coverage": "20%",
    "agroforestry_coverage": "10%"
  }
}
```

#### **AI Report JSON Structure**
```json
{
  "farm_id": "F001",
  "metadata": {...},
  "report": {
    "farm_profile": {...},
    "key_observations": {...},
    "recommendations": {...},
    "carbon_revenue": {...},
    "zone_context": {...},
    "risks": {...},
    "actions": [...],
    "future_outlook": {...},
    "final_summary": "..."
  },
  "visualization": {...}
}
```

### 🔍 Troubleshooting

#### **Common Issues & Solutions**

1. **Earth Engine Authentication**
   ```bash
   earthengine authenticate
   # Follow the browser authentication flow
   ```

2. **API Key Issues**
   ```bash
   # Check if API key is set
   echo $GOOGLE_API_KEY
   # Set temporarily
   export GOOGLE_API_KEY="your_key_here"
   ```

3. **Missing Dependencies**
   ```bash
   pip install -r requirements.txt
   # Or install individually
   pip install pandas numpy requests google-generativeai earthengine-api
   ```

4. **Data File Issues**
   - Ensure `farms.csv` has correct column names
   - Check coordinate formats (decimal degrees)
   - Verify farm_id uniqueness

5. **Rate Limiting**
   - The system includes automatic delays between API calls
   - Increase delays in fetcher files if needed
   - Monitor API quota usage

### 📊 Performance & Scalability

#### **Processing Capacity**
- **Farms**: Tested with 3-100 farms
- **Data Volume**: ~1MB per farm (all data sources)
- **Processing Time**: ~2-3 minutes per farm (with all APIs)
- **Concurrent Processing**: Sequential by design (API rate limits)

#### **API Limits**
- **Weather API**: 1000 calls/day (free tier)
- **SoilGrids API**: No official limits (reasonable use)
- **Earth Engine**: 25,000 requests/day (free tier)
- **Gemini API**: Rate limited (varies by plan)

#### **Scaling Recommendations**
- Use API keys with higher quotas for production
- Implement database caching for repeated analyses
- Consider batch processing for large farm datasets
- Add parallel processing with proper rate limiting

### 🛡️ Data Privacy & Security

- **No Personal Data Storage**: Only farm coordinates and agricultural data
- **API Key Security**: Store in environment variables, never commit
- **Data Retention**: Local storage only, no cloud uploads
- **Compliance**: Follows agricultural data sharing guidelines

### 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow coding standards
4. **Add Tests**: Ensure functionality works
5. **Commit Changes**: `git commit -m 'Add amazing feature'`
6. **Push to Branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Describe your changes

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 👨‍💻 Authors & Acknowledgments

- **Agricultural AI Team** - *Initial work and development*
- **NABARD** - *Agricultural zone and variety classification standards*
- **Google Earth Engine** - *Satellite data platform*
- **ISRIC SoilGrids** - *Global soil information*
- **Visual Crossing** - *Weather data services*

### 🙏 Support

If you find this project helpful, please ⭐ star the repository!

For questions and support:
- 📧 Email: [support@agri-engine.com](mailto:support@agri-engine.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/agri-recommendation-engine/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/agri-recommendation-engine/wiki)

---

**🌾 Happy Farming! 🚜**

*Building the future of agriculture, one farm at a time.*
