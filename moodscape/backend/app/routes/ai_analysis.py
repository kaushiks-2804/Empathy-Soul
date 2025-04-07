from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database.database import get_db
from database.models import AIAnalysis, MoodEntry
from app.schemas.mood import AIAnalysisDisplay, AIAnalysisUpdate
from app.ai.analysis import analyze_mood_entry, predict_mood_trend
from .. import crud
from ..ai_analysis import analyze_mood, predict_next_mood, generate_suggestions

router = APIRouter()

@router.get("/analysis/{entry_id}", response_model=AIAnalysisDisplay, tags=["analysis"])
def get_analysis(entry_id: int, db: Session = Depends(get_db)):
    analysis = db.query(AIAnalysis).filter(AIAnalysis.entry_id == entry_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.post("/analysis/{entry_id}/regenerate", response_model=AIAnalysisDisplay, tags=["analysis"])
def regenerate_analysis(entry_id: int, db: Session = Depends(get_db)):
    # Check if entry exists
    entry = db.query(MoodEntry).filter(MoodEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Regenerate analysis
    analyze_mood_entry(db, entry_id, force=True)
    
    # Return the updated analysis
    analysis = db.query(AIAnalysis).filter(AIAnalysis.entry_id == entry_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis could not be generated")
    
    return analysis

@router.get("/analysis/trends/predictions", tags=["analysis"])
def get_mood_predictions(days: int = 7, db: Session = Depends(get_db)):
    """Get predictions for mood trends over the specified number of days"""
    # Get recent entries to base predictions on
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days * 3)  # Use 3x the prediction window for training
    
    entries = db.query(MoodEntry).filter(
        MoodEntry.date >= start_date,
        MoodEntry.date <= end_date
    ).order_by(MoodEntry.date.asc()).all()
    
    if len(entries) < 5:  # Need at least 5 entries for meaningful prediction
        raise HTTPException(
            status_code=400, 
            detail="Not enough mood data for predictions. Add at least 5 entries."
        )
    
    # Generate predictions
    predictions = predict_mood_trend(entries, prediction_days=days)
    
    return {
        "predictions": predictions,
        "based_on_entries": len(entries),
        "prediction_days": days
    }

@router.get("/analysis/suggestions")
def get_suggestions(db: Session = Depends(get_db)):
    try:
        entries = crud.get_recent_entries(db, limit=10)
        suggestions = generate_suggestions(entries)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/predictions")
def get_predictions(db: Session = Depends(get_db)):
    try:
        entries = crud.get_recent_entries(db, limit=10)
        predictions = predict_next_mood(entries)
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/emotion-distribution")
def get_emotion_distribution(db: Session = Depends(get_db)):
    try:
        entries = crud.get_recent_entries(db)
        if not entries:
            return {"distribution": {}}
        
        emotions = {}
        for entry in entries:
            emotions[entry.emotion] = emotions.get(entry.emotion, 0) + 1
        
        total = len(entries)
        distribution = {
            emotion: {
                "count": count,
                "percentage": round((count / total) * 100, 1)
            }
            for emotion, count in emotions.items()
        }
        
        return {"distribution": distribution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 