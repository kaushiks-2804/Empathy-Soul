import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import numpy as np
import json

from database.models import MoodEntry, AIAnalysis

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for loaded models
sentiment_analyzer = None
keyword_extractor = None
mood_predictor = None

def load_ai_models():
    """Load the AI models for mood analysis"""
    global sentiment_analyzer, keyword_extractor, mood_predictor
    
    logger.info("Loading AI mood analysis models...")
    
    try:
        # In a real implementation, this would load actual models
        # For the prototype, we'll use simple functions
        
        # Sentiment analyzer placeholder
        sentiment_analyzer = {
            "loaded": True,
            "version": "0.1.0"
        }
        
        # Keyword extractor placeholder
        keyword_extractor = {
            "loaded": True,
            "version": "0.1.0"
        }
        
        # Mood predictor placeholder
        mood_predictor = {
            "loaded": True,
            "version": "0.1.0"
        }
        
        logger.info("AI models loaded successfully")
    except Exception as e:
        logger.error(f"Error loading AI models: {e}")
        raise

def analyze_mood_entry(db: Session, entry_id: int, force: bool = False):
    """Analyze a mood entry using AI models"""
    # Check if models are loaded
    if not sentiment_analyzer or not keyword_extractor:
        logger.warning("AI models not loaded. Skipping analysis.")
        return None
    
    # Get the entry
    entry = db.query(MoodEntry).filter(MoodEntry.id == entry_id).first()
    if not entry:
        logger.error(f"Entry with ID {entry_id} not found")
        return None
    
    # Check if analysis already exists
    existing_analysis = db.query(AIAnalysis).filter(AIAnalysis.entry_id == entry_id).first()
    if existing_analysis and not force:
        logger.info(f"Analysis for entry {entry_id} already exists. Skipping.")
        return existing_analysis
    
    # Perform sentiment analysis on journal text
    sentiment_score, sentiment_label = analyze_sentiment(entry.journal_text, entry.mood_score)
    
    # Extract keywords from journal text
    keywords = extract_keywords(entry.journal_text)
    
    # Generate suggestions based on mood and text
    suggestions = generate_suggestions(entry.mood_score, entry.emotion, entry.journal_text)
    
    # Make predictions based on this entry and historical data
    predictions = predict_personal_mood(db, entry)
    
    # Create or update analysis in database
    if existing_analysis:
        # Update existing analysis
        existing_analysis.sentiment_score = sentiment_score
        existing_analysis.sentiment_label = sentiment_label
        existing_analysis.keywords = keywords
        existing_analysis.predictions = predictions
        existing_analysis.suggestions = suggestions
        db.commit()
        db.refresh(existing_analysis)
        return existing_analysis
    else:
        # Create new analysis
        new_analysis = AIAnalysis(
            entry_id=entry_id,
            sentiment_score=sentiment_score,
            sentiment_label=sentiment_label,
            keywords=keywords,
            predictions=predictions,
            suggestions=suggestions
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        return new_analysis

def analyze_sentiment(text: Optional[str], mood_score: float) -> tuple:
    """Analyze sentiment of journal text"""
    if not text or len(text.strip()) < 10:
        # If no text or very short, use mood score to estimate sentiment
        if mood_score >= 7:
            return mood_score / 10, "positive"
        elif mood_score >= 4:
            return mood_score / 10, "neutral"
        else:
            return mood_score / 10, "negative"
    
    # In a real implementation, this would use a NLP model
    # For prototype, we'll use a simple word-based approach
    positive_words = ["happy", "joy", "excited", "great", "good", "wonderful", "positive", "love", "enjoy"]
    negative_words = ["sad", "angry", "upset", "terrible", "bad", "hate", "awful", "depressed", "anxious"]
    
    text_lower = text.lower()
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    total_words = len(text_lower.split())
    sentiment_score = 0.5  # Neutral default
    
    if total_words > 0:
        # Adjust based on positive/negative word ratio
        sentiment_score = 0.5 + ((positive_count - negative_count) / total_words) * 0.5
        # Ensure in range [0, 1]
        sentiment_score = max(0.0, min(1.0, sentiment_score))
        
        # Take mood score into account
        sentiment_score = (sentiment_score + (mood_score / 10)) / 2
    
    # Map to label
    if sentiment_score >= 0.7:
        label = "positive"
    elif sentiment_score >= 0.4:
        label = "neutral"
    else:
        label = "negative"
    
    return sentiment_score, label

def extract_keywords(text: Optional[str]) -> List[str]:
    """Extract keywords from journal text"""
    if not text or len(text.strip()) < 10:
        return []
    
    # In a real implementation, this would use NLP techniques
    # For prototype, we'll use a simple approach
    common_words = ["the", "a", "an", "and", "or", "but", "is", "are", "was", "were", 
                  "in", "on", "at", "to", "for", "with", "without", "by", "of", "from"]
    
    # Tokenize and filter
    words = [word.strip(".,!?:;()[]{}\"'") for word in text.lower().split()]
    words = [word for word in words if word and word not in common_words and len(word) > 3]
    
    # Count occurrences and take most frequent
    word_count = {}
    for word in words:
        word_count[word] = word_count.get(word, 0) + 1
    
    # Sort by count and take top 5
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, count in sorted_words[:5]]
    
    return keywords

def generate_suggestions(mood_score: float, emotion: str, text: Optional[str]) -> str:
    """Generate suggestions based on mood and journal text"""
    # Suggestions for different mood ranges
    if mood_score <= 3:  # Very low mood
        suggestions = [
            "Consider speaking with a professional if feelings of sadness persist.",
            "Try gentle exercise like walking to boost your mood naturally.",
            "Reach out to a trusted friend or family member for support.",
            "Practice self-compassion and remember that difficult emotions are temporary."
        ]
    elif mood_score <= 5:  # Below average mood
        suggestions = [
            "Consider journaling about what might be causing your lower mood.",
            "Try a 10-minute mindfulness meditation to center yourself.",
            "Engage in a creative activity you enjoy to lift your spirits.",
            "Take a short break from screens and go outside for fresh air."
        ]
    elif mood_score <= 7:  # Average to good mood
        suggestions = [
            "Build on this positive momentum by planning an activity you enjoy.",
            "Share your positive feelings with someone close to you.",
            "Reflect on what contributed to your mood today and try to incorporate more of it.",
            "Practice gratitude by noting 3 things you're thankful for."
        ]
    else:  # Very good mood
        suggestions = [
            "Excellent mood! Consider documenting what contributed to this feeling.",
            "Channel this positive energy into a creative project or goal.",
            "Connect with others and spread your positive energy.",
            "Take a moment to appreciate this feeling and practice mindfulness."
        ]
    
    # Choose one suggestion somewhat randomly but based on the mood score
    import random
    seed = int(mood_score * 10) + hash(emotion) % 100 + (hash(text or "") % 100)
    random.seed(seed)
    suggestion = random.choice(suggestions)
    
    # Add emotion-specific advice
    if emotion == "angry":
        suggestion += " When feeling angry, deep breathing exercises can help regulate your emotions."
    elif emotion == "sad":
        suggestion += " Remember that it's okay to feel sad sometimes, and these feelings will pass."
    elif emotion == "worried":
        suggestion += " Try writing down your worries to externalize them and gain perspective."
    
    return suggestion

def predict_personal_mood(db: Session, current_entry: MoodEntry) -> Dict[str, Any]:
    """Predict future mood based on historical patterns"""
    # Get historical entries for the user
    past_entries = db.query(MoodEntry).filter(
        MoodEntry.date < current_entry.date
    ).order_by(MoodEntry.date.desc()).limit(14).all()  # Last 2 weeks
    
    if not past_entries:
        # Not enough history for prediction
        return {
            "next_day_prediction": current_entry.mood_score,
            "confidence": 0.3,
            "trend": "stable",
            "factors": []
        }
    
    # Calculate simple trend
    mood_scores = [entry.mood_score for entry in past_entries]
    mood_scores.insert(0, current_entry.mood_score)  # Add current entry
    
    # Simple moving average prediction
    if len(mood_scores) >= 3:
        prediction = sum(mood_scores[:3]) / 3
    else:
        prediction = mood_scores[0]
    
    # Determine trend
    if len(mood_scores) >= 5:
        recent_avg = sum(mood_scores[:3]) / 3
        older_avg = sum(mood_scores[3:5]) / 2
        
        if recent_avg > older_avg + 0.5:
            trend = "improving"
        elif recent_avg < older_avg - 0.5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    # Calculate confidence based on data amount and consistency
    base_confidence = min(0.3 + (len(mood_scores) * 0.05), 0.7)  # More data = higher confidence
    
    if len(mood_scores) >= 3:
        # Add consistency factor - lower variance = higher confidence
        variance = np.var(mood_scores[:5]) if len(mood_scores) >= 5 else np.var(mood_scores)
        consistency_factor = 0.3 * (1 / (1 + variance))  # Higher variance = lower factor
        confidence = min(base_confidence + consistency_factor, 0.9)
    else:
        confidence = base_confidence
    
    # Return prediction data
    return {
        "next_day_prediction": round(prediction, 1),
        "week_avg_prediction": round(prediction, 1),  # More sophisticated model would vary this
        "confidence": round(confidence, 2),
        "trend": trend,
        "factors": []  # Would include factors in a real implementation
    }

def predict_mood_trend(entries: List[MoodEntry], prediction_days: int = 7) -> List[Dict[str, Any]]:
    """Generate mood trend predictions for future days"""
    if not entries or len(entries) < 3:
        raise ValueError("Need at least 3 entries to generate predictions")
    
    # Extract mood scores and dates
    dates = [entry.date for entry in entries]
    scores = [entry.mood_score for entry in entries]
    
    # For a real implementation, this would use LSTM or similar time-series model
    # For prototype, we'll use a simple moving average with randomness
    
    # Calculate trend
    window_size = min(5, len(scores))
    weights = np.array([0.1, 0.15, 0.2, 0.25, 0.3][:window_size])
    weights = weights / weights.sum()  # Normalize
    
    trend_value = np.average(scores[-window_size:], weights=weights)
    
    # Calculate volatility (how much the mood fluctuates)
    if len(scores) >= 5:
        volatility = np.std(np.diff(scores[-5:]))
    else:
        volatility = 0.5  # Default medium volatility
    
    # Generate predictions
    last_date = dates[-1]
    predictions = []
    
    current_prediction = trend_value
    
    for i in range(1, prediction_days + 1):
        # Add some randomness based on volatility
        random_factor = np.random.normal(0, volatility * 0.5)
        
        # Ensure prediction stays within bounds 1-9
        prediction = current_prediction + random_factor
        prediction = max(1, min(9, prediction))
        
        # Slight regression to mean (5) for longer predictions
        mean_regression = 0.05 * i * (5 - prediction)
        prediction += mean_regression
        
        # Round to one decimal place
        prediction = round(prediction, 1)
        
        # Update for next iteration with some memory
        current_prediction = 0.7 * prediction + 0.3 * current_prediction
        
        # Add to predictions list
        prediction_date = last_date + timedelta(days=i)
        predictions.append({
            "date": prediction_date.isoformat().split('T')[0],
            "predicted_score": prediction,
            "confidence": max(0.7 - (i * 0.05), 0.3)  # Confidence decreases with time
        })
    
    return predictions 