import sqlite3
import os
from datetime import datetime

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, 'moodscape.db')

def get_db():
    """Create a database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create mood_entries table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        mood_score INTEGER NOT NULL,
        emotion TEXT NOT NULL,
        journal_text TEXT,
        three_d_elements TEXT
    )
    ''')
    
    # Create ai_analysis table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ai_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL,
        sentiment_score REAL,
        dominant_emotions TEXT,
        suggestions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entry_id) REFERENCES mood_entries (id)
    )
    ''')
    
    conn.commit()
    conn.close() 