import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Constants
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mood_data.db")
# No need for encryption key with regular SQLite

# Create SQLite connection string without encryption
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Only needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models
Base = declarative_base()

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables in the database
def create_tables():
    from .models import Base
    Base.metadata.create_all(bind=engine)

# Initialize database with default settings
def init_db():
    from .models import UserSettings
    db = SessionLocal()
    
    # Check if settings already exist
    settings = db.query(UserSettings).first()
    if not settings:
        # Create default settings
        settings = UserSettings(
            theme="dark",
            color_scheme="default",
            notifications=True,
            sound_enabled=True,
            voice_journal=False,
            ai_analysis=True,
        )
        db.add(settings)
        db.commit()
    
    db.close() 