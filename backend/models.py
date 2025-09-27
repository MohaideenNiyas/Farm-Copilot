# backend/models.py

"""
Database Models for Agricultural Recommendation System with Authentication
========================================================================
SQLAlchemy models for users, farms, and cached reports with authentication support.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # Added for authentication
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farms = db.relationship('Farm', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Farm(db.Model):
    __tablename__ = 'farms'
    
    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.user_id'), nullable=False)
    farmer_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    area = db.Column(db.Float, nullable=False)  # in hectares
    village = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    main_crop = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reports = db.relationship('Report', backref='farm', lazy=True, cascade='all, delete-orphan')
    weather_data = db.relationship('WeatherData', backref='farm', lazy=True, cascade='all, delete-orphan')
    soil_data = db.relationship('SoilData', backref='farm', lazy=True, cascade='all, delete-orphan')
    satellite_data = db.relationship('SatelliteData', backref='farm', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'user_id': self.user_id,
            'farmer_name': self.farmer_name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'area': self.area,
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'main_crop': self.main_crop,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(50), unique=True, nullable=False)
    farm_id = db.Column(db.String(50), db.ForeignKey('farms.farm_id'), nullable=False)
    analysis_id = db.Column(db.String(50), nullable=False)
    report_type = db.Column(db.String(50), default='full_analysis')  # full_analysis, recommendations_only, etc.
    report_data = db.Column(db.Text, nullable=False)  # JSON string
    processing_status = db.Column(db.String(20), default='completed')  # processing, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_report_data(self, data_dict):
        """Store report data as JSON string"""
        self.report_data = json.dumps(data_dict, default=str)
    
    def get_report_data(self):
        """Retrieve report data as dictionary"""
        try:
            return json.loads(self.report_data) if self.report_data else {}
        except json.JSONDecodeError:
            return {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_id': self.report_id,
            'farm_id': self.farm_id,
            'analysis_id': self.analysis_id,
            'report_type': self.report_type,
            'report_data': self.get_report_data(),
            'processing_status': self.processing_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    
    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.String(50), db.ForeignKey('farms.farm_id'), nullable=False)
    data_date = db.Column(db.Date, nullable=False)
    temp_max = db.Column(db.Float)
    temp_min = db.Column(db.Float)
    temp = db.Column(db.Float)
    humidity = db.Column(db.Float)
    precip = db.Column(db.Float)
    windspeed = db.Column(db.Float)
    pressure = db.Column(db.Float)
    visibility = db.Column(db.Float)
    cloudcover = db.Column(db.Float)
    conditions = db.Column(db.String(100))
    description = db.Column(db.Text)
    uvindex = db.Column(db.Float)
    sunrise = db.Column(db.String(10))
    sunset = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SoilData(db.Model):
    __tablename__ = 'soil_data'
    
    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.String(50), db.ForeignKey('farms.farm_id'), nullable=False)
    test_date = db.Column(db.DateTime, nullable=False)
    soil_data = db.Column(db.Text, nullable=False)  # JSON string of all soil properties
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_soil_data(self, data_dict):
        """Store soil data as JSON string"""
        self.soil_data = json.dumps(data_dict, default=str)
    
    def get_soil_data(self):
        """Retrieve soil data as dictionary"""
        try:
            return json.loads(self.soil_data) if self.soil_data else {}
        except json.JSONDecodeError:
            return {}

class SatelliteData(db.Model):
    __tablename__ = 'satellite_data'
    
    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.String(50), db.ForeignKey('farms.farm_id'), nullable=False)
    data_date = db.Column(db.Date, nullable=False)
    data_type = db.Column(db.String(20))  # vegetation, soil_moisture
    data_source = db.Column(db.String(20))  # Sentinel-2, MODIS, Sentinel-1
    ndvi = db.Column(db.Float)
    evi = db.Column(db.Float)
    savi = db.Column(db.Float)
    lai = db.Column(db.Float)
    vv = db.Column(db.Float)
    vh = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Location Cache for efficient lookups
class LocationCache(db.Model):
    __tablename__ = 'location_cache'
    
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    location_hash = db.Column(db.String(32), unique=True, nullable=False)  # MD5 of lat,lon rounded
    last_farm_id = db.Column(db.String(50))  # Most recent farm at this location
    report_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @staticmethod
    def generate_location_hash(lat, lon, precision=3):
        """Generate hash for location with specified precision (decimal places)"""
        import hashlib
        # Round coordinates to specified precision to group nearby locations
        rounded_lat = round(float(lat), precision)
        rounded_lon = round(float(lon), precision)
        location_str = f"{rounded_lat},{rounded_lon}"
        return hashlib.md5(location_str.encode()).hexdigest()

# Database utility functions
def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully")

def get_or_create_user(user_id, name, email=None):
    """Get existing user or create new one"""
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        user = User(user_id=user_id, name=name, email=email, password_hash='')
        db.session.add(user)
        db.session.commit()
        print(f"✅ Created new user: {user_id}")
    return user

def find_existing_report_by_location(latitude, longitude, precision=3):
    """Find existing report for similar location"""
    location_hash = LocationCache.generate_location_hash(latitude, longitude, precision)
    cache_entry = LocationCache.query.filter_by(location_hash=location_hash).first()
    
    if cache_entry and cache_entry.last_farm_id:
        # Get the most recent report for this location
        latest_report = Report.query.filter_by(
            farm_id=cache_entry.last_farm_id,
            processing_status='completed'
        ).order_by(Report.created_at.desc()).first()
        
        if latest_report:
            print(f"📍 Found existing report for location hash: {location_hash}")
            return latest_report
    
    return None

def cache_location(farm_id, latitude, longitude, precision=3):
    """Cache location for future lookups"""
    location_hash = LocationCache.generate_location_hash(latitude, longitude, precision)
    cache_entry = LocationCache.query.filter_by(location_hash=location_hash).first()
    
    if cache_entry:
        cache_entry.last_farm_id = farm_id
        cache_entry.report_count += 1
        cache_entry.updated_at = datetime.utcnow()
    else:
        cache_entry = LocationCache(
            latitude=latitude,
            longitude=longitude,
            location_hash=location_hash,
            last_farm_id=farm_id,
            report_count=1
        )
    
    db.session.add(cache_entry)
    db.session.commit()
    print(f"📍 Cached location: {location_hash} for farm: {farm_id}")