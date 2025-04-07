from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database.database import get_db
from database.models import MoodEntry
from app.schemas.mood import MoodEntryCreate, MoodEntryDisplay, MoodEntryUpdate, MoodEntryWithAnalysis
from app.ai.analysis import analyze_mood_entry
from .. import crud, schemas

router = APIRouter()

@router.post("/entries/", response_model=MoodEntryDisplay, tags=["mood"])
def create_mood_entry(entry: MoodEntryCreate, db: Session = Depends(get_db)):
    # Create the entry in the database
    db_entry = MoodEntry(
        date=entry.date or datetime.now(),
        mood_score=entry.mood_score,
        emotion=entry.emotion,
        journal_text=entry.journal_text,
        three_d_elements=entry.three_d_elements
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    # Trigger AI analysis in the background
    analyze_mood_entry(db, db_entry.id)
    
    return db_entry

@router.get("/entries/", response_model=List[MoodEntryWithAnalysis], tags=["mood"])
def get_mood_entries(
    skip: int = 0, 
    limit: int = 100, 
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MoodEntry)
    
    if start_date:
        query = query.filter(MoodEntry.date >= start_date)
    if end_date:
        query = query.filter(MoodEntry.date <= end_date)
    
    return query.order_by(MoodEntry.date.desc()).offset(skip).limit(limit).all()

@router.get("/entries/recent", response_model=List[MoodEntryWithAnalysis], tags=["mood"])
def get_recent_entries(days: int = 7, db: Session = Depends(get_db)):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    return db.query(MoodEntry).filter(
        MoodEntry.date >= start_date,
        MoodEntry.date <= end_date
    ).order_by(MoodEntry.date.desc()).all()

@router.get("/entries/{entry_id}", response_model=MoodEntryWithAnalysis, tags=["mood"])
def get_mood_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(MoodEntry).filter(MoodEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry

@router.put("/entries/{entry_id}", response_model=MoodEntryDisplay, tags=["mood"])
def update_mood_entry(entry_id: int, entry: MoodEntryUpdate, db: Session = Depends(get_db)):
    db_entry = db.query(MoodEntry).filter(MoodEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Update fields if provided
    if entry.mood_score is not None:
        db_entry.mood_score = entry.mood_score
    if entry.emotion is not None:
        db_entry.emotion = entry.emotion
    if entry.journal_text is not None:
        db_entry.journal_text = entry.journal_text
    if entry.three_d_elements is not None:
        db_entry.three_d_elements = entry.three_d_elements
    
    db.commit()
    db.refresh(db_entry)
    
    # Re-analyze if mood data changed
    if entry.mood_score is not None or entry.emotion is not None or entry.journal_text is not None:
        analyze_mood_entry(db, entry_id)
    
    return db_entry

@router.delete("/entries/{entry_id}", tags=["mood"])
def delete_mood_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(MoodEntry).filter(MoodEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(db_entry)
    db.commit()
    
    return {"detail": "Entry deleted successfully"}

@router.post("/entries/", response_model=schemas.MoodEntry)
def create_entry(entry: schemas.MoodEntryCreate, db: Session = Depends(get_db)):
    return crud.create_entry(db=db, entry=entry)

@router.get("/entries/recent", response_model=List[schemas.MoodEntry])
def read_recent_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entries = crud.get_recent_entries(db, skip=skip, limit=limit)
    return entries 