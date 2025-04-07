from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class MoodEntry(Base):
    __tablename__ = "mood_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.now, index=True)
    mood_score = Column(Float, nullable=False)
    emotion = Column(String, nullable=False)
    journal_text = Column(Text, nullable=True)
    three_d_elements = Column(JSON, nullable=True)
    
    # Relationships
    analysis = relationship("AIAnalysis", back_populates="entry", uselist=False, cascade="all, delete-orphan")
    
class AIAnalysis(Base):
    __tablename__ = "ai_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("mood_entries.id"), unique=True)
    sentiment_score = Column(Float, nullable=True)
    sentiment_label = Column(String, nullable=True)
    keywords = Column(JSON, nullable=True)  # Store as JSON array
    predictions = Column(JSON, nullable=True)  # Store prediction data as JSON
    suggestions = Column(Text, nullable=True)
    
    # Relationships
    entry = relationship("MoodEntry", back_populates="analysis")
    
class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    theme = Column(String, default="dark")
    color_scheme = Column(String, default="default")
    notifications = Column(Boolean, default=True)
    sound_enabled = Column(Boolean, default=True)
    voice_journal = Column(Boolean, default=False)
    ai_analysis = Column(Boolean, default=True)
    interaction_prefs = Column(JSON, nullable=True)  # Store additional preferences as JSON 