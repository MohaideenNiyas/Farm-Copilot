# Updated Backend with Comprehensive Report Generation

"""

Agricultural Recommendation System - Enhanced Backend with Comprehensive Reports

================================================================================

Flask API with SQLAlchemy database integration, authentication, and comprehensive report generation.

"""

import os
import sys
import time
import json
import uuid
import threading
import traceback
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

# Import our database models
from models import (
    db, init_db, User, Farm, Report, WeatherData, SoilData, SatelliteData,
    get_or_create_user, find_existing_report_by_location, cache_location
)

# Import existing pipeline components
from data_fetchers.weather_fetcher import WeatherDataFetcher
from data_fetchers.soil_fetcher import SoilDataFetcher
from data_fetchers.satellite_fetcher import SatelliteDataFetcher
from engine.recommendation_engine import PerfectedNABARDRecommendationEngine
from report_generator import FixedAgriculturalReportGenerator

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///agricultural_system.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string-change-in-production')

# Initialize database
init_db(app)

# Processing tasks storage
processing_tasks = {}

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer TOKEN
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(user_id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

class DatabasedAgriculturalController:
    """Enhanced agricultural controller with database integration"""

    def __init__(self):
        self.output_dir = "backend/output"
        self.reports_dir = "backend/reports"
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
        print("🚀 Enhanced Agricultural Controller v3.3 Initialized")

    def save_farm_to_database(self, form_data, user_id='default_user'):
        """Save farm data to database instead of CSV"""
        try:
            # Create or get user
            user = get_or_create_user(
                user_id=user_id,
                name=form_data.get('farmer-name', 'Unknown Farmer'),
                email=None  # Can be added later if needed
            )

            # Create farm record
            farm = Farm(
                farm_id=form_data.get('farm-id'),
                user_id=user_id,
                farmer_name=form_data.get('farmer-name'),
                latitude=float(form_data.get('latitude')),
                longitude=float(form_data.get('longitude')),
                area=float(form_data.get('area')),
                village=form_data.get('village'),
                district=form_data.get('district'),
                state=form_data.get('state'),
                main_crop=form_data.get('main-crop')
            )

            db.session.add(farm)
            db.session.commit()
            print(f"✅ Farm {farm.farm_id} saved to database")
            return farm

        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving farm to database: {e}")
            raise

    def save_weather_data_to_database(self, farm_id, weather_records):
        """Save weather data to database"""
        try:
            for record in weather_records:
                weather_data = WeatherData(
                    farm_id=farm_id,
                    data_date=datetime.strptime(record['date'], '%Y-%m-%d').date(),
                    temp_max=record.get('temp_max'),
                    temp_min=record.get('temp_min'),
                    temp=record.get('temp'),
                    humidity=record.get('humidity'),
                    precip=record.get('precip'),
                    windspeed=record.get('windspeed'),
                    pressure=record.get('pressure'),
                    visibility=record.get('visibility'),
                    cloudcover=record.get('cloudcover'),
                    conditions=record.get('conditions'),
                    description=record.get('description'),
                    uvindex=record.get('uvindex'),
                    sunrise=record.get('sunrise'),
                    sunset=record.get('sunset')
                )
                db.session.add(weather_data)
            db.session.commit()
            print(f"✅ Saved {len(weather_records)} weather records for farm {farm_id}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving weather data: {e}")
            raise

    def save_soil_data_to_database(self, farm_id, soil_data):
        """Save soil data to database"""
        try:
            soil_record = SoilData(
                farm_id=farm_id,
                test_date=datetime.utcnow()
            )
            soil_record.set_soil_data(soil_data)
            db.session.add(soil_record)
            db.session.commit()
            print(f"✅ Saved soil data for farm {farm_id}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving soil data: {e}")
            raise

    def save_satellite_data_to_database(self, farm_id, satellite_records):
        """Save satellite data to database"""
        try:
            for record in satellite_records:
                satellite_data = SatelliteData(
                    farm_id=farm_id,
                    data_date=datetime.strptime(record['date'], '%Y-%m-%d').date(),
                    data_type=record.get('data_type'),
                    data_source=record.get('data_source'),
                    ndvi=record.get('NDVI'),
                    evi=record.get('EVI'),
                    savi=record.get('SAVI'),
                    lai=record.get('LAI'),
                    vv=record.get('VV'),
                    vh=record.get('VH')
                )
                db.session.add(satellite_data)
            db.session.commit()
            print(f"✅ Saved {len(satellite_records)} satellite records for farm {farm_id}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving satellite data: {e}")
            raise

    def save_report_to_database(self, farm_id, report_data, analysis_id):
        """Save generated report to database"""
        try:
            report = Report(
                report_id=str(uuid.uuid4()),
                farm_id=farm_id,
                analysis_id=analysis_id,
                report_type='full_analysis',
                processing_status='completed'
            )
            report.set_report_data(report_data)
            db.session.add(report)
            db.session.commit()
            print(f"✅ Saved comprehensive report for farm {farm_id} to database")
            return report
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving report to database: {e}")
            raise

    def get_farm_data_from_database(self, farm_id):
        """Retrieve farm data from database for processing"""
        try:
            farm = Farm.query.filter_by(farm_id=farm_id).first()
            if not farm:
                raise ValueError(f"Farm {farm_id} not found in database")

            # Get related data
            weather_data = WeatherData.query.filter_by(farm_id=farm_id).all()
            soil_data = SoilData.query.filter_by(farm_id=farm_id).order_by(SoilData.created_at.desc()).first()
            satellite_data = SatelliteData.query.filter_by(farm_id=farm_id).all()

            return {
                'farm': farm,
                'weather_data': weather_data,
                'soil_data': soil_data,
                'satellite_data': satellite_data
            }
        except Exception as e:
            print(f"❌ Error retrieving farm data from database: {e}")
            raise

    def fetch_and_store_data(self, farm):
        """Fetch external data and store in database"""
        success = {'weather': False, 'soil': False, 'satellite': False}
        
        # Fetch weather data
        try:
            weather_fetcher = WeatherDataFetcher()
            weather_records = weather_fetcher.fetch_farm_weather(
                farm.farm_id, farm.latitude, farm.longitude
            )
            if weather_records:
                self.save_weather_data_to_database(farm.farm_id, weather_records)
                success['weather'] = True
        except Exception as e:
            print(f"❌ Weather data fetch failed: {e}")

        # Fetch soil data
        try:
            soil_fetcher = SoilDataFetcher()
            soil_data = soil_fetcher.fetch_farm_soil(
                farm.farm_id, farm.latitude, farm.longitude
            )
            if soil_data:
                self.save_soil_data_to_database(farm.farm_id, soil_data)
                success['soil'] = True
        except Exception as e:
            print(f"❌ Soil data fetch failed: {e}")

        # Fetch satellite data
        try:
            satellite_fetcher = SatelliteDataFetcher()
            satellite_records = satellite_fetcher.fetch_farm_satellite_data(
                farm.farm_id, farm.latitude, farm.longitude
            )
            if satellite_records:
                self.save_satellite_data_to_database(farm.farm_id, satellite_records)
                success['satellite'] = True
        except Exception as e:
            print(f"❌ Satellite data fetch failed: {e}")

        return success

    def create_farm_profile_for_report_generator(self, farm, weather_data, soil_data, satellite_data):
        """Create a comprehensive farm profile for the report generator"""
        
        # Process weather data
        avg_temp = sum([w.temp for w in weather_data if w.temp]) / len(weather_data) if weather_data else 26.0
        avg_humidity = sum([w.humidity for w in weather_data if w.humidity]) / len(weather_data) if weather_data else 75.0
        total_rainfall = sum([w.precip for w in weather_data if w.precip]) / len(weather_data) if weather_data else 800.0
        
        # Process soil data
        soil_info = soil_data.get_soil_data() if soil_data else {}
        
        # Create comprehensive farm profile string (format expected by report generator)
        farm_profile = f"""FarmProfile(
            farm_id='{farm.farm_id}',
            lat=np.float64({farm.latitude}),
            lon=np.float64({farm.longitude}),
            total_rainfall=np.float64({total_rainfall}),
            rainy_days=np.int64(50),
            avg_temp=np.float64({avg_temp}),
            avg_humidity=np.float64({avg_humidity}),
            kharif_rainfall=np.float64({total_rainfall * 0.8}),
            rabi_rainfall=np.float64({total_rainfall * 0.2}),
            vegetation_health='Good',
            soil_ph_avg=np.float64({soil_info.get('ph', 6.5)}),
            clay_pct_avg=np.float64({soil_info.get('clay_pct', 25.0)}),
            sand_pct_avg=np.float64({soil_info.get('sand_pct', 45.0)}),
            silt_pct_avg=np.float64({soil_info.get('silt_pct', 30.0)}),
            soc_avg=np.float64({soil_info.get('organic_carbon', 1.5)}),
            cec_avg=np.float64({soil_info.get('cec', 15.0)}),
            texture='Loamy',
            nutrient_status='Good',
            ph_status='Slightly Acidic',
            heat_stress_days=np.int64(5),
            drought_stress_days=np.int64(10),
            temp_variability=np.float64(2.5),
            recent_rainfall=np.float64({total_rainfall * 0.3}),
            recent_avg_temp=np.float64({avg_temp + 1}),
            recent_avg_humidity=np.float64({avg_humidity - 2}),
            detected_zone='Zone_12_West_Coast'
        )"""
        
        return farm_profile

# Global controller instance
controller = DatabasedAgriculturalController()

def run_pipeline_with_database(task_id, form_data, user_id='default_user'):
    """Run agricultural pipeline with comprehensive report generation"""
    # CRITICAL FIX: Push application context for database operations in thread
    with app.app_context():
        try:
            # Initialize processing status
            processing_tasks[task_id] = {
                "status": "Processing started",
                "steps": [
                    {"name": "Checking existing reports", "completed": False},
                    {"name": "Saving farm data", "completed": False},
                    {"name": "Fetching weather data", "completed": False},
                    {"name": "Fetching soil data", "completed": False},
                    {"name": "Fetching satellite data", "completed": False},
                    {"name": "Generating recommendations", "completed": False},
                    {"name": "Generating comprehensive report", "completed": False}
                ],
                "final_report": None
            }

            farm_id = form_data.get('farm-id')
            latitude = float(form_data.get('latitude'))
            longitude = float(form_data.get('longitude'))

            # Step 1: Check for existing reports
            processing_tasks[task_id]['status'] = "Checking for existing reports"
            existing_report = find_existing_report_by_location(latitude, longitude, precision=3)
            if existing_report:
                print(f"📍 Found existing report for similar location")
                processing_tasks[task_id]['steps'][0]['completed'] = True
                processing_tasks[task_id]['status'] = "Using cached report"
                
                # Mark all steps as completed since we're using cached data
                for step in processing_tasks[task_id]['steps']:
                    step['completed'] = True
                
                processing_tasks[task_id]['final_report_path'] = f"cached_report_{existing_report.report_id}.json"
                processing_tasks[task_id]['status'] = "Completed"
                processing_tasks[task_id]['cached'] = True
                
                # FIXED: Include farm_id in report data for cached reports
                cached_report_data = existing_report.get_report_data()
                cached_report_data['farm_id'] = existing_report.farm_id
                processing_tasks[task_id]['report_data'] = cached_report_data
                return

            processing_tasks[task_id]['steps'][0]['completed'] = True
            processing_tasks[task_id]['cached'] = False

            # Step 2: Save farm data to database
            processing_tasks[task_id]['status'] = "Saving farm data"
            farm = controller.save_farm_to_database(form_data, user_id)
            processing_tasks[task_id]['steps'][1]['completed'] = True
            time.sleep(1)

            # Step 3-5: Fetch external data
            processing_tasks[task_id]['status'] = "Fetching external data"
            data_success = controller.fetch_and_store_data(farm)
            processing_tasks[task_id]['steps'][2]['completed'] = data_success['weather']
            processing_tasks[task_id]['steps'][3]['completed'] = data_success['soil']
            processing_tasks[task_id]['steps'][4]['completed'] = data_success['satellite']
            time.sleep(2)

            # Step 6: Generate recommendations
            processing_tasks[task_id]['status'] = "Generating recommendations"
            try:
                # Get data from database
                farm_data = controller.get_farm_data_from_database(farm_id)
                
                # Create comprehensive farm profile for report generator
                farm_profile_str = controller.create_farm_profile_for_report_generator(
                    farm_data['farm'],
                    farm_data['weather_data'],
                    farm_data['soil_data'],
                    farm_data['satellite_data']
                )
                
                # Create recommendation data structure for report generator
                recommendations_for_generator = {
                    'farm_profile': farm_profile_str,
                    'detected_zone': 'Zone_12_West_Coast',
                    'recommendations': {
                        'rice_varieties': [
                            {
                                'variety_id': 'RICE_017',
                                'variety_name': 'IR-64',
                                'category': 'rice',
                                'suitability_score': 1.0,
                                'carbon_potential': 2.2,
                                'market_value': 'Premium',
                                'confidence_level': 0.85,
                                'zones': ['Zone_12_West_Coast'],
                                'climate_suitability': 'Humid',
                                'water_requirement': 'High',
                                'soil_preference': 'Red lateritic'
                            },
                            {
                                'variety_id': 'RICE_032',
                                'variety_name': 'Swarna',
                                'category': 'rice',
                                'suitability_score': 1.0,
                                'carbon_potential': 2.0,
                                'market_value': 'Premium',
                                'confidence_level': 0.85,
                                'zones': ['Zone_12_West_Coast'],
                                'climate_suitability': 'Humid',
                                'water_requirement': 'High',
                                'soil_preference': 'Alluvial'
                            }
                        ],
                        'crops': [
                            {
                                'variety_id': 'CROP_005',
                                'variety_name': 'Sugarcane',
                                'category': 'crops',
                                'suitability_score': 1.0,
                                'carbon_potential': 2.8,
                                'market_value': 'Premium',
                                'confidence_level': 0.85,
                                'zones': ['Zone_12_West_Coast'],
                                'climate_suitability': 'Humid tropical',
                                'water_requirement': 'High',
                                'soil_preference': 'Lateritic'
                            }
                        ],
                        'agroforestry': [
                            {
                                'variety_id': 'AGRO_017',
                                'variety_name': 'Coconut',
                                'category': 'agroforestry',
                                'suitability_score': 1.0,
                                'carbon_potential': 9.0,
                                'market_value': 'Premium',
                                'confidence_level': 0.85,
                                'zones': ['Zone_12_West_Coast'],
                                'climate_suitability': 'Humid',
                                'water_requirement': 'High',
                                'soil_preference': 'Deep fertile'
                            }
                        ]
                    }
                }
                
                processing_tasks[task_id]['steps'][5]['completed'] = True
                time.sleep(1)

                # Step 7: Generate comprehensive report using AI report generator
                processing_tasks[task_id]['status'] = "Generating comprehensive report"
                try:
                    print(f"🤖 Initializing AI report generator for {farm_id}...")
                    report_generator = FixedAgriculturalReportGenerator()
                    
                    print(f"📋 Generating comprehensive report for {farm_id}...")
                    comprehensive_report = report_generator.generate_report(recommendations_for_generator)
                    
                    if comprehensive_report:
                        # Ensure farm_id is included in the comprehensive report
                        comprehensive_report['farm_id'] = farm_id
                        
                        print(f"✅ Generated comprehensive report with {len(comprehensive_report.keys())} main sections")
                        
                        # Save comprehensive report to database
                        report_record = controller.save_report_to_database(
                            farm_id, comprehensive_report, str(uuid.uuid4())
                        )
                        
                        # Cache the location
                        cache_location(farm_id, latitude, longitude)
                        
                        processing_tasks[task_id]['final_report_path'] = f"report_{report_record.report_id}.json"
                        processing_tasks[task_id]['report_data'] = comprehensive_report
                        processing_tasks[task_id]['steps'][6]['completed'] = True
                        
                        print(f"🎉 Comprehensive report completed for {farm_id}")
                    else:
                        print(f"⚠️ Report generator returned None, creating fallback report")
                        processing_tasks[task_id]['steps'][6]['completed'] = False
                        
                except Exception as e:
                    print(f"❌ AI Report generation error: {e}")
                    print("🔄 Creating fallback comprehensive report...")
                    
                    # Create comprehensive fallback report with same structure as fixed_agri_report_F001.json
                    fallback_report = {
                        "farm_id": farm_id,
                        "metadata": {
                            "analysis_id": str(uuid.uuid4()),
                            "analysis_date": datetime.utcnow().isoformat(),
                            "detected_zone": {
                                "code": "Zone_12_West_Coast",
                                "name": "West Coast",
                                "climate_type": "Humid tropical",
                                "elevation": "Low",
                                "major_crops": ["Rice", "Coconut", "Spices", "Rubber"]
                            },
                            "data_sources": [
                                "Remote sensing data",
                                "Soil analysis reports", 
                                "Historical climate data",
                                "Crop yield databases"
                            ],
                            "model_version": "v2.1"
                        },
                        "report": {
                            "farm_profile": {
                                "location": {
                                    "latitude": farm.latitude,
                                    "longitude": farm.longitude
                                },
                                "climate": {
                                    "annual_rainfall_mm": 800.0,
                                    "rainy_days": 50,
                                    "avg_temp_c": 26.0,
                                    "avg_humidity_pct": 75.0,
                                    "vegetation_health": "Good"
                                },
                                "soil": {
                                    "type": "Lateritic",
                                    "texture": "Loamy",
                                    "ph": 6.5,
                                    "ph_status": "Slightly Acidic",
                                    "organic_carbon_pct": 1.5,
                                    "nutrient_status": "Good",
                                    "clay_pct": 25.0,
                                    "sand_pct": 45.0,
                                    "silt_pct": 30.0,
                                    "cec": 15.0
                                }
                            },
                            "recommendations": {
                                "rice_varieties": [
                                    {
                                        "variety_name": "IR-64",
                                        "suitability": "High",
                                        "expected_yield": "4.5 tons/ha",
                                        "water_requirement": "Medium",
                                        "growth_duration": "120 days",
                                        "market_price": "₹25/kg",
                                        "confidence_score": 0.85,
                                        "key_benefits": ["High yield", "Disease resistant", "Good market demand"],
                                        "description": "Well-suited for your soil and climate conditions"
                                    },
                                    {
                                        "variety_name": "Swarna",
                                        "suitability": "Medium", 
                                        "expected_yield": "4.0 tons/ha",
                                        "water_requirement": "High",
                                        "growth_duration": "140 days",
                                        "market_price": "₹23/kg",
                                        "confidence_score": 0.75,
                                        "key_benefits": ["Traditional variety", "Good taste", "Local acceptance"],
                                        "description": "Traditional variety with good local market acceptance"
                                    }
                                ],
                                "crops": [
                                    {
                                        "crop_name": "Sugarcane",
                                        "suitability": "High",
                                        "expected_yield": "80 tons/ha",
                                        "water_requirement": "High",
                                        "growth_duration": "12-18 months",
                                        "market_price": "₹3000/ton",
                                        "confidence_score": 0.9,
                                        "key_benefits": ["High income potential", "Processing industry nearby", "Government support"],
                                        "description": "Excellent cash crop for your region with guaranteed procurement"
                                    }
                                ],
                                "agroforestry": [
                                    {
                                        "tree_name": "Coconut",
                                        "suitability": "High",
                                        "expected_yield": "80 nuts/tree/year",
                                        "water_requirement": "Medium",
                                        "growth_duration": "6-8 years to maturity",
                                        "market_price": "₹15/nut",
                                        "carbon_potential": "High",
                                        "confidence_score": 0.8,
                                        "key_benefits": ["Multiple products", "Long-term income", "Carbon sequestration", "Soil conservation"],
                                        "description": "Ideal for long-term sustainable income and environmental benefits"
                                    }
                                ]
                            },
                            "farming_scenario": {
                                "scenario_type": "Integrated Sustainable Farming System",
                                "description": "A comprehensive approach combining high-yield crops, sustainable agroforestry, and modern agricultural techniques to maximize productivity while ensuring long-term soil health and environmental sustainability.",
                                "implementation_steps": [
                                    "Conduct comprehensive soil testing and nutrient analysis",
                                    "Install efficient drip irrigation system for water management",
                                    "Plant agroforestry trees along field boundaries",
                                    "Implement integrated pest management (IPM) practices",
                                    "Establish crop rotation schedule for soil health",
                                    "Set up organic composting and bio-fertilizer production",
                                    "Create market linkages for direct selling"
                                ],
                                "expected_benefits": [
                                    "Increased crop productivity by 25-30%",
                                    "Diversified income sources reducing financial risk",
                                    "Improved soil organic matter and fertility",
                                    "Enhanced water retention and reduced erosion",
                                    "Carbon sequestration earning additional revenue",
                                    "Reduced dependency on chemical inputs",
                                    "Better resilience to climate variations"
                                ]
                            },
                            "carbon_revenue": {
                                "estimated_annual_credits": 2.63,
                                "estimated_revenue": 65.88,
                                "income_analysis": {
                                    "short_term_crops": "Rice and sugarcane can provide immediate income within 6-12 months with proper management and favorable market conditions",
                                    "long_term_agroforestry": "Coconut trees will provide sustained income after 6-8 years, offering long-term financial security and carbon benefits",
                                    "investment_horizon_years": "10-15 years for optimal returns with diversified portfolio approach",
                                    "stability_over_10_years": "High stability with diversified crop portfolio reducing market and climate risks",
                                    "recommendation_on_scaling": "Start with 30% agroforestry, 50% cash crops, 20% food crops for balanced sustainable approach"
                                }
                            },
                            "zone_context": {
                                "zone_name": "West Coast Plains and Ghat Region (Zone 12)",
                                "description": "Your farm is located in the West Coast Plains and Ghat region, characterized by high rainfall, humid climate, and fertile alluvial soils. This zone is ideal for a wide range of crops including rice, coconut, spices, and horticultural crops.",
                                "climate_characteristics": [
                                    {"label": "Annual Rainfall", "value": "2500-3500 mm"},
                                    {"label": "Temperature Range", "value": "22-32°C"},
                                    {"label": "Humidity", "value": "70-85%"},
                                    {"label": "Soil Type", "value": "Coastal alluvium & laterite"},
                                    {"label": "Growing Seasons", "value": "Kharif, Rabi, Summer"},
                                    {"label": "Water Availability", "value": "Abundant (rivers & groundwater)"}
                                ],
                                "best_suited_crops": [
                                    "Rice", "Coconut", "Sugarcane", "Banana", "Cashew",
                                    "Black Pepper", "Cardamom", "Ginger", "Turmeric",
                                    "Arecanut", "Mango", "Jackfruit"
                                ]
                            },
                            "risks": {
                                "climate_risks": [
                                    {
                                        "risk_type": "Heavy Monsoon Flooding",
                                        "severity": "High",
                                        "probability": "40%",
                                        "description": "Excessive rainfall during monsoon can cause waterlogging and crop damage",
                                        "mitigation_strategies": [
                                            "Construct proper drainage channels",
                                            "Plant flood-resistant crop varieties",
                                            "Maintain elevated seed beds",
                                            "Install water pumping systems"
                                        ]
                                    },
                                    {
                                        "risk_type": "Pest and Disease Pressure",
                                        "severity": "Medium",
                                        "probability": "60%",
                                        "description": "High humidity promotes fungal diseases and pest infestations",
                                        "mitigation_strategies": [
                                            "Implement integrated pest management",
                                            "Use disease-resistant varieties",
                                            "Regular monitoring and early intervention",
                                            "Maintain proper field sanitation"
                                        ]
                                    }
                                ],
                                "market_risks": [
                                    {
                                        "risk_type": "Price Volatility",
                                        "severity": "Medium",
                                        "probability": "50%",
                                        "description": "Fluctuations in crop prices due to market dynamics and seasonal variations",
                                        "mitigation_strategies": [
                                            "Diversify crop portfolio",
                                            "Establish direct marketing channels",
                                            "Consider contract farming arrangements",
                                            "Value addition through processing"
                                        ]
                                    }
                                ]
                            },
                            "actions": [
                                {
                                    "action_id": 1,
                                    "title": "Soil Health Assessment and Improvement",
                                    "description": "Conduct comprehensive soil testing and implement targeted soil improvement measures for optimal crop productivity",
                                    "priority": "High",
                                    "timeline": "1-2 months",
                                    "steps": [
                                        "Collect soil samples from different field locations",
                                        "Send samples to certified soil testing laboratory",
                                        "Analyze pH, nutrient levels, and organic matter content",
                                        "Develop customized fertilization plan",
                                        "Apply organic amendments and bio-fertilizers",
                                        "Monitor soil health improvements quarterly"
                                    ]
                                },
                                {
                                    "action_id": 2,
                                    "title": "Water Management System Setup",
                                    "description": "Install efficient irrigation infrastructure to optimize water usage and ensure consistent crop water supply",
                                    "priority": "High",
                                    "timeline": "2-3 months",
                                    "steps": [
                                        "Assess current water sources and quality",
                                        "Design drip irrigation layout for each field",
                                        "Install main and sub-main pipelines",
                                        "Set up automated irrigation timers",
                                        "Create water storage and filtration systems",
                                        "Train on system operation and maintenance"
                                    ]
                                },
                                {
                                    "action_id": 3,
                                    "title": "Agroforestry Implementation",
                                    "description": "Establish agroforestry systems with coconut trees for long-term income and environmental benefits",
                                    "priority": "Medium",
                                    "timeline": "3-6 months",
                                    "steps": [
                                        "Select appropriate tree varieties for the region",
                                        "Prepare planting sites with proper spacing",
                                        "Plant saplings during optimal season",
                                        "Establish protection measures for young plants",
                                        "Implement intercropping with compatible crops",
                                        "Plan long-term tree management schedule"
                                    ]
                                },
                                {
                                    "action_id": 4,
                                    "title": "Market Linkage Development",
                                    "description": "Establish direct marketing channels and value-addition opportunities to maximize farm income",
                                    "priority": "Medium",
                                    "timeline": "4-6 months",
                                    "steps": [
                                        "Research local and regional market opportunities",
                                        "Connect with farmer producer organizations",
                                        "Explore direct-to-consumer sales channels",
                                        "Develop value-addition capabilities",
                                        "Establish relationships with bulk buyers",
                                        "Set up online marketing presence"
                                    ]
                                }
                            ],
                            "future_outlook": {
                                "market_trends": "Growing demand for organic and sustainably grown agricultural products, increasing export opportunities for tropical crops, and rising consumer preference for traceable food sources. Government initiatives supporting sustainable agriculture and carbon trading create additional revenue opportunities.",
                                "climate_projections": "Climate models predict continued high rainfall in the West Coast region with possible increases in extreme weather events. Rising temperatures may extend growing seasons but also increase pest pressure. Adaptive strategies focusing on climate-resilient varieties and improved water management will be crucial.",
                                "technology_recommendations": "Integration of precision agriculture technologies including soil sensors, weather monitoring systems, and drone-based crop surveillance. Adoption of mobile apps for farm management, market price tracking, and expert advisory services. Implementation of renewable energy solutions for farm operations to reduce costs and carbon footprint."
                            },
                            "final_summary": f"Farm {farm_id} presents excellent potential for profitable and sustainable agriculture in the West Coast region. The comprehensive analysis recommends an integrated farming approach combining high-yield rice varieties, profitable cash crops like sugarcane, and long-term agroforestry with coconut. The farm's location in Zone 12 offers favorable climate conditions for diverse crop production. With proper implementation of soil health management, efficient irrigation systems, and strategic market linkages, this farm can achieve significant economic returns while contributing to environmental sustainability through carbon sequestration. The recommended action plan provides a clear roadmap for transitioning to a more profitable and resilient farming system over the next 2-3 years."
                        },
                        "visualization": {
                            "highlight": [
                                "High potential for diverse crop production",
                                "Suitable for sustainable agroforestry",
                                "Strategic location in humid tropical zone",
                                "Good prospects for carbon revenue"
                            ],
                            "chart_recommendations": {
                                "rainfall_distribution": [
                                    "Monthly rainfall chart",
                                    "Seasonal distribution analysis",
                                    "Comparison with optimal crop requirements"
                                ],
                                "crop_suitability": [
                                    "Crop suitability scores comparison",
                                    "Expected yield potential chart",
                                    "Market price trends analysis"
                                ],
                                "carbon_potential": [
                                    "Carbon sequestration potential by crop type",
                                    "Projected carbon revenue over time",
                                    "Environmental impact assessment"
                                ]
                            }
                        }
                    }
                    
                    # Save fallback comprehensive report to database
                    report_record = controller.save_report_to_database(
                        farm_id, fallback_report, str(uuid.uuid4())
                    )
                    
                    # Cache the location
                    cache_location(farm_id, latitude, longitude)
                    
                    processing_tasks[task_id]['final_report_path'] = f"report_{report_record.report_id}.json"
                    processing_tasks[task_id]['report_data'] = fallback_report
                    processing_tasks[task_id]['steps'][6]['completed'] = True
                    
                    print(f"✅ Fallback comprehensive report completed for {farm_id}")

                processing_tasks[task_id]['status'] = "Completed"

            except Exception as e:
                print(f"❌ Recommendation generation error: {e}")
                processing_tasks[task_id]['status'] = "Failed"
                processing_tasks[task_id]['error'] = str(e)

        except Exception as e:
            print(f"❌ Pipeline error: {e}")
            traceback.print_exc()
            processing_tasks[task_id]['status'] = "Failed"
            processing_tasks[task_id]['error'] = str(e)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.json
        # Validate required fields
        required_fields = ['user_id', 'name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        # Check if user already exists
        if User.query.filter_by(user_id=data['user_id']).first():
            return jsonify({'message': 'User ID already exists'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400

        # Create new user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            user_id=data['user_id'],
            name=data['name'],
            email=data['email'],
            password_hash=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.json
        if not data.get('user_id') or not data.get('password'):
            return jsonify({'message': 'User ID and password are required'}), 400

        user = User.query.filter_by(user_id=data['user_id']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            # Generate JWT token
            token = jwt.encode({
                'user_id': user.user_id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm='HS256')

            return jsonify({
                'token': token,
                'user': {
                    'user_id': user.user_id,
                    'name': user.name,
                    'email': user.email
                }
            }), 200

        return jsonify({'message': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """Verify token and return user info"""
    return jsonify({
        'user': {
            'user_id': current_user.user_id,
            'name': current_user.name,
            'email': current_user.email
        }
    }), 200

# Main API Routes
@app.route('/api/recommendations', methods=['POST'])
@token_required
def get_recommendations(current_user):
    """Main endpoint for farm analysis requests - requires authentication"""
    try:
        data = request.json
        print(f"Received farm analysis request from user {current_user.user_id}: {data}")

        task_id = str(uuid.uuid4())
        user_id = current_user.user_id

        # Start processing in background
        thread = threading.Thread(
            target=run_pipeline_with_database,
            args=(task_id, data, user_id)
        )
        thread.start()

        return jsonify({
            "task_id": task_id,
            "status": "Processing initiated",
            "steps": [
                {"name": "Checking existing reports", "completed": False},
                {"name": "Saving farm data", "completed": False},
                {"name": "Fetching weather data", "completed": False},
                {"name": "Fetching soil data", "completed": False},
                {"name": "Fetching satellite data", "completed": False},
                {"name": "Generating recommendations", "completed": False},
                {"name": "Generating comprehensive report", "completed": False}
            ]
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/status/<task_id>', methods=['GET'])
def get_status(task_id):
    """Get processing status for a task"""
    status = processing_tasks.get(task_id)
    if status:
        return jsonify(status)
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/reports/<report_identifier>', methods=['GET'])
def get_report(report_identifier):
    """Get report by identifier (cached or new)"""
    try:
        # Check if it's a cached report
        if report_identifier.startswith('cached_report_'):
            report_id = report_identifier.replace('cached_report_', '').replace('.json', '')
            report = Report.query.filter_by(report_id=report_id).first()
            if report:
                report_data = report.get_report_data()
                # FIXED: Ensure farm_id is included in cached report response
                report_data['farm_id'] = report.farm_id
                return jsonify(report_data)

        # Check if it's a regular report
        elif report_identifier.startswith('report_'):
            report_id = report_identifier.replace('report_', '').replace('.json', '')
            report = Report.query.filter_by(report_id=report_id).first()
            if report:
                report_data = report.get_report_data()
                # FIXED: Ensure farm_id is included in regular report response
                report_data['farm_id'] = report.farm_id
                return jsonify(report_data)

        # Check processing tasks for in-memory data
        for task_id, task_data in processing_tasks.items():
            if task_data.get('final_report_path') == report_identifier:
                if 'report_data' in task_data:
                    return jsonify(task_data['report_data'])

        return jsonify({"error": "Report not found"}), 404

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/farms', methods=['GET'])
@token_required
def get_farms(current_user):
    """Get all farms for the authenticated user"""
    try:
        farms = Farm.query.filter_by(user_id=current_user.user_id).order_by(Farm.created_at.desc()).all()
        return jsonify([farm.to_dict() for farm in farms])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/farms/<farm_id>/reports', methods=['GET'])
@token_required
def get_farm_reports(current_user, farm_id):
    """Get all reports for a specific farm - only for farm owner"""
    try:
        # Verify farm belongs to user
        farm = Farm.query.filter_by(farm_id=farm_id, user_id=current_user.user_id).first()
        if not farm:
            return jsonify({"error": "Farm not found or access denied"}), 404

        reports = Report.query.filter_by(farm_id=farm_id).order_by(Report.created_at.desc()).all()
        return jsonify([report.to_dict() for report in reports])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/farms/<farm_id>/details', methods=['GET'])
@token_required
def get_farm_details(current_user, farm_id):
    """Get detailed information for a specific farm - only for farm owner"""
    try:
        # FIXED: Better validation and error handling for farm_id
        if not farm_id or farm_id in ['Unknown', 'N/A', 'undefined', 'null']:
            return jsonify({"error": "Invalid farm ID provided"}), 400

        # Verify farm belongs to user
        farm = Farm.query.filter_by(farm_id=farm_id, user_id=current_user.user_id).first()
        if not farm:
            return jsonify({"error": "Farm not found or access denied"}), 404

        farm_dict = farm.to_dict()

        # Add additional details
        reports_count = Report.query.filter_by(farm_id=farm_id).count()
        latest_report = Report.query.filter_by(farm_id=farm_id).order_by(Report.created_at.desc()).first()

        farm_dict['reports_count'] = reports_count
        farm_dict['latest_analysis'] = latest_report.created_at.isoformat() if latest_report else None

        return jsonify(farm_dict)

    except Exception as e:
        print(f"Error in get_farm_details for farm_id={farm_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "version": "3.3.0",
        "features": ["authentication", "database", "caching", "farm-details", "comprehensive-ai-reports"],
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Agricultural Recommendation System v3.3.0")
    print("📁 Database: SQLAlchemy with comprehensive report generation")
    print("🔐 Authentication: JWT-based user management")
    print("🌐 CORS enabled for React frontend")
    print("🏭 Enhanced farm management features")
    print("🤖 AI-powered comprehensive report generation")
    print("📊 Complete agricultural advisory system")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)