import json
from datetime import datetime
from typing import List, Dict, Any
from .database import get_db

def create_entry(mood_score: int, emotion: str, journal_text: str = None, three_d_elements: Dict = None):
    """Create a new mood entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Convert three_d_elements to JSON string if provided
    three_d_elements_json = json.dumps(three_d_elements) if three_d_elements else None
    
    cursor.execute('''
    INSERT INTO mood_entries (mood_score, emotion, journal_text, three_d_elements, date)
    VALUES (?, ?, ?, ?, ?)
    ''', (mood_score, emotion, journal_text, three_d_elements_json, datetime.utcnow()))
    
    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return entry_id

def get_recent_entries(limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
    """Get recent mood entries"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM mood_entries 
    ORDER BY date DESC 
    LIMIT ? OFFSET ?
    ''', (limit, skip))
    
    entries = []
    for row in cursor.fetchall():
        entry = dict(row)
        # Convert three_d_elements back to dict if it exists
        if entry['three_d_elements']:
            entry['three_d_elements'] = json.loads(entry['three_d_elements'])
        entries.append(entry)
    
    conn.close()
    return entries

def get_entries_by_date_range(start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    """Get entries within a date range"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM mood_entries 
    WHERE date BETWEEN ? AND ?
    ORDER BY date DESC
    ''', (start_date, end_date))
    
    entries = []
    for row in cursor.fetchall():
        entry = dict(row)
        if entry['three_d_elements']:
            entry['three_d_elements'] = json.loads(entry['three_d_elements'])
        entries.append(entry)
    
    conn.close()
    return entries

def create_analysis(entry_id: int, sentiment_score: float, dominant_emotions: List[Dict], suggestions: List[str]):
    """Create AI analysis for a mood entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Convert lists to JSON strings
    dominant_emotions_json = json.dumps(dominant_emotions)
    suggestions_json = json.dumps(suggestions)
    
    cursor.execute('''
    INSERT INTO ai_analysis (entry_id, sentiment_score, dominant_emotions, suggestions)
    VALUES (?, ?, ?, ?)
    ''', (entry_id, sentiment_score, dominant_emotions_json, suggestions_json))
    
    analysis_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return analysis_id

def get_analysis_by_entry_id(entry_id: int) -> Dict[str, Any]:
    """Get AI analysis for a specific entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM ai_analysis 
    WHERE entry_id = ?
    ''', (entry_id,))
    
    row = cursor.fetchone()
    if row:
        analysis = dict(row)
        # Convert JSON strings back to Python objects
        analysis['dominant_emotions'] = json.loads(analysis['dominant_emotions'])
        analysis['suggestions'] = json.loads(analysis['suggestions'])
        conn.close()
        return analysis
    
    conn.close()
    return None

def update_analysis(entry_id: int, sentiment_score: float = None, 
                   dominant_emotions: List[Dict] = None, suggestions: List[str] = None):
    """Update AI analysis for an entry"""
    conn = get_db()
    cursor = conn.cursor()
    
    updates = []
    values = []
    
    if sentiment_score is not None:
        updates.append("sentiment_score = ?")
        values.append(sentiment_score)
    
    if dominant_emotions is not None:
        updates.append("dominant_emotions = ?")
        values.append(json.dumps(dominant_emotions))
    
    if suggestions is not None:
        updates.append("suggestions = ?")
        values.append(json.dumps(suggestions))
    
    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        values.append(entry_id)
        
        query = f'''
        UPDATE ai_analysis 
        SET {', '.join(updates)}
        WHERE entry_id = ?
        '''
        
        cursor.execute(query, values)
        conn.commit()
    
    conn.close() 