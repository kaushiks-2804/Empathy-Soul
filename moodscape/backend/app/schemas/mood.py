from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class MoodEntryBase(BaseModel):
    mood_score: float
    emotion: str
    journal_text: Optional[str] = None
    three_d_elements: Optional[Dict[str, Any]] = None
    
class MoodEntryCreate(MoodEntryBase):
    date: Optional[datetime] = None
    
class MoodEntryUpdate(BaseModel):
    mood_score: Optional[float] = None
    emotion: Optional[str] = None
    journal_text: Optional[str] = None
    three_d_elements: Optional[Dict[str, Any]] = None
    
class MoodEntryDisplay(MoodEntryBase):
    id: int
    date: datetime
    
    class Config:
        from_attributes = True

class AIAnalysisBase(BaseModel):
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    keywords: Optional[List[str]] = None
    predictions: Optional[Dict[str, Any]] = None
    suggestions: Optional[str] = None
    
class AIAnalysisCreate(AIAnalysisBase):
    entry_id: int
    
class AIAnalysisUpdate(AIAnalysisBase):
    pass
    
class AIAnalysisDisplay(AIAnalysisBase):
    id: int
    entry_id: int
    
    class Config:
        from_attributes = True
        
class MoodEntryWithAnalysis(MoodEntryDisplay):
    analysis: Optional[AIAnalysisDisplay] = None
    
    class Config:
        from_attributes = True 