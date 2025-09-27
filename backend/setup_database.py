# Database Setup Script for Agricultural Recommendation System
# backend/setup_database.py

import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import models
try:
    from models import db, init_db, User, Farm, Report, LocationCache
    print("✅ Successfully imported database models")
except ImportError as e:
    print(f"❌ Error importing models: {e}")
    print("Make sure models.py is in the same directory as this script")
    sys.exit(1)

def setup_database():
    """Set up the database with all required tables"""
    
    # Create Flask app
    app = Flask(__name__)
    
    # Database configuration
    database_url = os.getenv('DATABASE_URL', 'sqlite:///agricultural_system.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    print(f"🗄️ Database URL: {database_url}")
    
    # Initialize database
    with app.app_context():
        try:
            db.init_app(app)
            
            # Create all tables
            db.create_all()
            
            print("✅ Database tables created successfully!")
            print("\n📊 Created Tables:")
            print("  - users: Store user information")
            print("  - farms: Store farm details and location data") 
            print("  - reports: Store generated analysis reports")
            print("  - weather_data: Store historical weather information")
            print("  - soil_data: Store soil analysis results")
            print("  - satellite_data: Store satellite imagery and indices")
            print("  - location_cache: Cache for location-based report lookups")
            
            # Verify tables exist
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"\n🔍 Verified {len(tables)} tables in database:")
            for table in sorted(tables):
                print(f"  ✓ {table}")
            
            # Create sample data (optional)
            create_sample_data = input("\n❓ Create sample data? (y/n): ").lower().strip()
            
            if create_sample_data == 'y':
                create_sample_data_records(db)
                
        except Exception as e:
            print(f"❌ Error setting up database: {e}")
            return False
    
    return True

def create_sample_data_records(db):
    """Create sample data for testing"""
    try:
        # Create sample user
        from models import get_or_create_user, cache_location
        
        sample_user = get_or_create_user(
            user_id="DEMO_USER_001",
            name="Demo Farmer",
            email="demo@agricultural-system.com"
        )
        
        # Create sample farm
        from models import Farm
        sample_farm = Farm(
            farm_id="DEMO_FARM_001",
            user_id="DEMO_USER_001",
            farmer_name="Demo Farmer",
            latitude=10.546179,
            longitude=76.41653,
            area=2.5,
            village="Demo Village",
            district="Demo District", 
            state="Kerala",
            main_crop="Rice"
        )
        
        db.session.add(sample_farm)
        db.session.commit()
        
        # Cache the location
        cache_location("DEMO_FARM_001", 10.546179, 76.41653)
        
        print("\n✅ Sample data created:")
        print("  - Demo user: DEMO_USER_001")
        print("  - Demo farm: DEMO_FARM_001")
        print("  - Location cached for future lookups")
        
    except Exception as e:
        print(f"⚠️ Error creating sample data: {e}")
        db.session.rollback()

def check_database_status():
    """Check if database is properly set up"""
    app = Flask(__name__)
    database_url = os.getenv('DATABASE_URL', 'sqlite:///agricultural_system.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    with app.app_context():
        try:
            db.init_app(app)
            
            # Check if tables exist
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            required_tables = ['users', 'farms', 'reports', 'weather_data', 
                             'soil_data', 'satellite_data', 'location_cache']
            
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                print(f"❌ Missing tables: {missing_tables}")
                return False
            
            print("✅ Database is properly configured")
            print(f"📊 Found {len(tables)} tables: {', '.join(sorted(tables))}")
            
            # Check for sample data
            user_count = User.query.count()
            farm_count = Farm.query.count()
            report_count = Report.query.count()
            
            print(f"\n📈 Current data:")
            print(f"  - Users: {user_count}")
            print(f"  - Farms: {farm_count}")
            print(f"  - Reports: {report_count}")
            
            return True
            
        except Exception as e:
            print(f"❌ Database check failed: {e}")
            return False

def reset_database():
    """Reset the database by dropping and recreating all tables"""
    confirmation = input("⚠️ This will delete ALL data. Are you sure? Type 'RESET' to confirm: ")
    
    if confirmation != 'RESET':
        print("Operation cancelled.")
        return
    
    app = Flask(__name__)
    database_url = os.getenv('DATABASE_URL', 'sqlite:///agricultural_system.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    with app.app_context():
        try:
            db.init_app(app)
            
            # Drop all tables
            db.drop_all()
            print("🗑️ All tables dropped")
            
            # Recreate all tables
            db.create_all()
            print("🔨 All tables recreated")
            
            print("✅ Database reset completed!")
            
        except Exception as e:
            print(f"❌ Error resetting database: {e}")

if __name__ == "__main__":
    print("🚀 Agricultural Recommendation System - Database Setup")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'check':
            check_database_status()
        elif command == 'reset':
            reset_database()
        elif command == 'setup':
            setup_database()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: setup, check, reset")
    else:
        print("Available commands:")
        print("  python setup_database.py setup  - Create database and tables")
        print("  python setup_database.py check  - Check database status")
        print("  python setup_database.py reset  - Reset database (WARNING: deletes all data)")
        print()
        
        choice = input("What would you like to do? (setup/check/reset): ").lower().strip()
        
        if choice == 'setup':
            setup_database()
        elif choice == 'check':
            check_database_status()
        elif choice == 'reset':
            reset_database()
        else:
            print("Invalid choice. Exiting.")