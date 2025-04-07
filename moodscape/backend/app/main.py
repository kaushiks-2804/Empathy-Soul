from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Dict, Any, Optional
from . import crud
from .database import init_db
from .ai_analysis import analyze_mood, predict_next_mood, generate_suggestions

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="MoodScape API",
    description="API for MoodScape mood tracking application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5003"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MoodScape API"}

@app.post("/api/entries/")
def create_entry(
    mood_score: int = Body(...),
    emotion: str = Body(...),
    journal_text: Optional[str] = Body(None)
):
    try:
        entry_id = crud.create_entry(mood_score, emotion, journal_text)
        return {"id": entry_id, "message": "Entry created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/entries/recent")
def read_recent_entries(limit: int = 100, skip: int = 0):
    try:
        entries = crud.get_recent_entries(limit, skip)
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/suggestions")
def get_suggestions():
    try:
        entries = crud.get_recent_entries(limit=10)
        suggestions = generate_suggestions(entries)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/predictions")
def get_predictions():
    try:
        entries = crud.get_recent_entries(limit=10)
        predictions = predict_next_mood(entries)
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/emotion-distribution")
def get_emotion_distribution():
    try:
        entries = crud.get_recent_entries()
        if not entries:
            return {"distribution": {}}
        
        emotions = {}
        for entry in entries:
            emotions[entry['emotion']] = emotions.get(entry['emotion'], 0) + 1
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5002, reload=True) 