# 🌾 AgroIntel - AI-Powered Agricultural Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-19.1+-61DAFB.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-000000.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

## 🚀 Overview

AgroIntel is a comprehensive agricultural intelligence platform that combines satellite imagery, weather data, soil analysis, and machine learning to provide farmers with actionable insights for optimizing crop yields, reducing costs, and implementing climate-resilient farming strategies.

### ✨ Key Features

- **🌾 AI-Powered Crop Recommendations** - Personalized variety suggestions based on soil, climate, and market conditions
- **🛰️ Real-time Satellite Analytics** - High-resolution field monitoring for crop health assessment
- **🌡️ Weather Integration** - Hyper-local weather forecasts and climate analysis
- **📊 Yield Optimization** - Data-driven productivity and profit maximization
- **🔐 User Authentication** - Secure JWT-based user management
- **📱 Responsive Design** - Modern React frontend with 3D visualizations
- **🗄️ Database Integration** - Comprehensive data storage and retrieval
- **📈 Carbon Revenue Tracking** - Environmental impact and carbon credit calculations

## 🏗️ Architecture

### Backend (Python/Flask)
```
backend/
├── main.py                     # Main Flask application with API endpoints
├── models.py                   # SQLAlchemy database models
├── requirements.txt            # Python dependencies
├── setup_database.py          # Database initialization
├── report_generator.py        # AI-powered report generation
├── data_fetchers/             # External data integration
│   ├── weather_fetcher.py     # Weather API integration
│   ├── soil_fetcher.py        # Soil data collection
│   └── satellite_fetcher.py   # Satellite imagery processing
└── engine/
    └── recommendation_engine.py # ML-based recommendation system
```

### Frontend (React/Vite)
```
frontend/
├── src/
│   ├── components/            # React components
│   │   ├── LandingPage.jsx   # Interactive 3D landing page
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── FarmAnalyzer.jsx  # Farm analysis interface
│   │   ├── Login.jsx         # Authentication
│   │   └── ...               # Other components
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication state management
│   └── main.jsx              # Application entry point
├── package.json              # Node.js dependencies
└── vite.config.js           # Vite configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farming
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Edit .env with your API keys and configuration
   DATABASE_URL=sqlite:///agricultural_system.db
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=jwt-secret-string
   GOOGLE_API_KEY=your-google-api-key
   WEATHER_API_KEY=your-weather-api-key
   ```

5. **Initialize database**
   ```bash
   python setup_database.py
   ```

6. **Start the backend server**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///agricultural_system.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=jwt-secret-string-change-in-production

# External APIs
GOOGLE_API_KEY=your-google-generative-ai-key
WEATHER_API_KEY=your-weather-service-key
EARTH_ENGINE_SERVICE_ACCOUNT=your-earth-engine-credentials
```

#### Frontend
The frontend automatically connects to the backend API at `http://localhost:5000`. For production, update the API base URL in the configuration files.

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "user_id": "farmer123",
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "user_id": "farmer123",
  "password": "securepassword"
}
```

### Farm Analysis Endpoints

#### Submit Farm for Analysis
```http
POST /api/recommendations
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "farm-id": "F001",
  "farmer-name": "John Farmer",
  "latitude": 30.7333,
  "longitude": 76.7794,
  "area": 5.2,
  "village": "Kharar",
  "district": "Mohali",
  "state": "Punjab",
  "main-crop": "wheat"
}
```

#### Get Analysis Status
```http
GET /api/status/<task_id>
```

#### Get Analysis Report
```http
GET /api/reports/<report_id>
```

### Farm Management Endpoints

#### Get User Farms
```http
GET /api/farms
Authorization: Bearer <jwt-token>
```

#### Get Farm Details
```http
GET /api/farms/<farm_id>/details
Authorization: Bearer <jwt-token>
```

## 🌟 Features in Detail

### 1. AI-Powered Crop Recommendations
- **Machine Learning Models**: Advanced algorithms analyze soil, climate, and market data
- **200+ Crop Varieties**: Comprehensive database of crop varieties with suitability scores
- **Risk Assessment**: Climate and market risk analysis for each recommendation
- **Confidence Scoring**: AI confidence levels for each recommendation

### 2. Satellite Analytics
- **Real-time Monitoring**: Daily satellite imagery updates
- **NDVI Analysis**: Vegetation health monitoring
- **Change Detection**: Automated detection of field changes
- **High Resolution**: 3-meter resolution imagery for precise analysis

### 3. Weather Integration
- **Hyper-local Forecasts**: 5km precision weather data
- **15-day Forecasts**: Extended weather predictions
- **Historical Analysis**: Climate trend analysis
- **Alert System**: Weather-based farming alerts

### 4. Comprehensive Reporting
- **AI-Generated Reports**: Detailed analysis with actionable insights
- **Carbon Revenue Calculations**: Environmental impact and carbon credit potential
- **Risk Mitigation Strategies**: Specific recommendations for identified risks
- **Implementation Roadmaps**: Step-by-step action plans

## 🎨 Frontend Features

### Interactive 3D Landing Page
- **3D Farm Visualization**: Animated crop fields with parallax effects
- **Real-time Animations**: Dynamic weather systems and farm equipment
- **Responsive Design**: Optimized for all device sizes
- **Smooth Animations**: CSS3 and JavaScript-powered interactions

### Modern Dashboard
- **Data Visualization**: Charts and graphs using Chart.js
- **Real-time Updates**: Live status monitoring
- **User-friendly Interface**: Intuitive navigation and controls
- **Mobile Responsive**: Full mobile compatibility

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Werkzeug security for password protection
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive data validation and sanitization

## 📈 Performance

- **Caching System**: Location-based report caching for faster responses
- **Background Processing**: Asynchronous data fetching and analysis
- **Database Optimization**: Efficient SQLAlchemy queries
- **CDN Ready**: Optimized for content delivery networks

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Production)
1. **Set production environment variables**
2. **Use production database** (PostgreSQL recommended)
3. **Configure WSGI server** (Gunicorn recommended)
4. **Set up reverse proxy** (Nginx recommended)

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `dist` folder to your web server or CDN.

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React
- Write comprehensive tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Earth Engine** - Satellite imagery and geospatial analysis
- **OpenWeatherMap** - Weather data integration
- **NABARD** - Agricultural variety database
- **React Community** - Frontend framework and components
- **Flask Community** - Backend framework and extensions

## 📞 Support

For support, email support@agrointel.com or create an issue in the repository.

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Mobile application (React Native)
- [ ] Advanced ML models for pest detection
- [ ] Integration with IoT sensors
- [ ] Marketplace for agricultural products
- [ ] Multi-language support
- [ ] Offline mode capabilities

### Version 2.1 (Future)
- [ ] Blockchain integration for supply chain tracking
- [ ] Advanced drone integration
- [ ] AI-powered chatbot for farmer support
- [ ] Integration with government schemes
- [ ] Social features for farmer communities

---

**Made with ❤️ for farmers worldwide**

*Transforming agriculture through technology, one farm at a time.*
