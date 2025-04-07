from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import UserSettings
from app.schemas.settings import UserSettingsDisplay, UserSettingsUpdate

router = APIRouter()

@router.get("/settings/", response_model=UserSettingsDisplay, tags=["settings"])
def get_settings(db: Session = Depends(get_db)):
    """Get the user settings"""
    # Since this is a single-user app, we'll always use the first settings entry
    settings = db.query(UserSettings).first()
    if not settings:
        # Create default settings if none exist
        settings = UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/settings/", response_model=UserSettingsDisplay, tags=["settings"])
def update_settings(settings_update: UserSettingsUpdate, db: Session = Depends(get_db)):
    """Update user settings"""
    # Get existing settings
    db_settings = db.query(UserSettings).first()
    if not db_settings:
        # Create default settings if none exist
        db_settings = UserSettings()
        db.add(db_settings)
    
    # Update settings with provided values
    for key, value in settings_update.dict(exclude_unset=True).items():
        setattr(db_settings, key, value)
    
    db.commit()
    db.refresh(db_settings)
    
    return db_settings

@router.post("/settings/reset", response_model=UserSettingsDisplay, tags=["settings"])
def reset_settings(db: Session = Depends(get_db)):
    """Reset settings to default values"""
    # Get existing settings
    db_settings = db.query(UserSettings).first()
    if not db_settings:
        # Create default settings if none exist
        db_settings = UserSettings()
        db.add(db_settings)
    else:
        # Reset to defaults
        db_settings.theme = "dark"
        db_settings.color_scheme = "default"
        db_settings.notifications = True
        db_settings.sound_enabled = True
        db_settings.voice_journal = False
        db_settings.ai_analysis = True
        db_settings.interaction_prefs = None
    
    db.commit()
    db.refresh(db_settings)
    
    return db_settings 