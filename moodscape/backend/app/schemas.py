from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class MoodEntryBase(BaseModel):
    mood_score: int
    emotion: str
    journal_text: Optional[str] = None
    three_d_elements: Optional[Dict[str, Any]] = None

class MoodEntryCreate(MoodEntryBase):
    pass

class MoodEntry(MoodEntryBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True

class AIAnalysisBase(BaseModel):
    sentiment_score: float
    dominant_emotions: List[Dict[str, float]]
    suggestions: List[str]

class AIAnalysisCreate(AIAnalysisBase):
    entry_id: int

class AIAnalysis(AIAnalysisBase):
    id: int
    entry_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MoodEntryWithAnalysis(MoodEntry):
    analysis: Optional[AIAnalysis] = None 