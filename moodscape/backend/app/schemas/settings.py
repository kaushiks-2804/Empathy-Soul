from typing import Dict, Optional, Any
from pydantic import BaseModel

class UserSettingsBase(BaseModel):
    theme: Optional[str] = "dark"
    color_scheme: Optional[str] = "default"
    notifications: Optional[bool] = True
    sound_enabled: Optional[bool] = True
    voice_journal: Optional[bool] = False
    ai_analysis: Optional[bool] = True
    interaction_prefs: Optional[Dict[str, Any]] = None
    
class UserSettingsCreate(UserSettingsBase):
    pass
    
class UserSettingsUpdate(UserSettingsBase):
    pass
    
class UserSettingsDisplay(UserSettingsBase):
    id: int
    
    class Config:
        from_attributes = True 