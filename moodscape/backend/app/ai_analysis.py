import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta

def analyze_mood(entries: List[Dict]) -> Dict:
    """Analyze mood patterns from entries."""
    if not entries:
        return {
            "average_mood": 5.0,
            "dominant_emotion": "neutral",
            "mood_trend": "stable",
            "volatility": 0.0
        }
    
    mood_scores = [entry['mood_score'] for entry in entries]
    emotions = [entry['emotion'] for entry in entries]
    
    # Calculate statistics
    avg_mood = np.mean(mood_scores)
    mood_std = np.std(mood_scores)
    
    # Find dominant emotion
    emotion_counts = {}
    for emotion in emotions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
    
    # Determine mood trend
    if len(mood_scores) >= 2:
        recent_trend = mood_scores[-1] - mood_scores[-2]
        if recent_trend > 0.5:
            trend = "improving"
        elif recent_trend < -0.5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    return {
        "average_mood": round(avg_mood, 1),
        "dominant_emotion": dominant_emotion,
        "mood_trend": trend,
        "volatility": round(mood_std, 1)
    }

def predict_next_mood(entries: List[Dict]) -> List[str]:
    """Generate predictions for future mood based on patterns."""
    if not entries:
        return ["Start tracking your mood to get predictions!"]
    
    predictions = []
    analysis = analyze_mood(entries)
    
    # Generate predictions based on current mood and patterns
    if analysis["mood_trend"] == "improving":
        predictions.append("Your mood is likely to continue improving in the next few days")
    elif analysis["mood_trend"] == "declining":
        predictions.append("Your mood might continue to decline unless you take action")
    else:
        predictions.append("Your mood is likely to remain stable")
    
    # Add personalized predictions based on patterns
    if analysis["volatility"] > 1.5:
        predictions.append("Your mood has been quite variable lately - try to maintain a consistent routine")
    
    # Add time-based predictions
    current_hour = datetime.now().hour
    if 6 <= current_hour < 12:
        predictions.append("Morning mood: Consider starting your day with some light exercise")
    elif 12 <= current_hour < 18:
        predictions.append("Afternoon mood: Take short breaks to maintain energy levels")
    else:
        predictions.append("Evening mood: Try to wind down with some relaxation activities")
    
    return predictions

def generate_suggestions(entries: List[Dict]) -> List[str]:
    """Generate personalized suggestions based on mood patterns."""
    if not entries:
        return ["Start tracking your mood to get personalized suggestions!"]
    
    suggestions = []
    analysis = analyze_mood(entries)
    
    # Generate suggestions based on current mood
    if analysis["average_mood"] < 4:
        suggestions.extend([
            "Try some deep breathing exercises to help manage stress",
            "Consider talking to a friend or family member about how you're feeling",
            "Take a short walk outside to get some fresh air"
        ])
    elif analysis["average_mood"] > 7:
        suggestions.extend([
            "Share your positive energy with others",
            "Use this high energy time to tackle important tasks",
            "Consider starting a new project or hobby"
        ])
    else:
        suggestions.extend([
            "Practice mindfulness to maintain emotional balance",
            "Try to maintain a consistent daily routine",
            "Stay hydrated and eat regular, balanced meals"
        ])
    
    # Add suggestions based on patterns
    if analysis["volatility"] > 1.5:
        suggestions.append("Consider keeping a regular sleep schedule to help stabilize your mood")
    
    # Add suggestions based on dominant emotion
    if analysis["dominant_emotion"] in ["angry", "worried"]:
        suggestions.append("Try journaling to process your emotions")
    elif analysis["dominant_emotion"] in ["sad", "terrible"]:
        suggestions.append("Consider reaching out to a mental health professional")
    
    # Add general wellness suggestions
    suggestions.extend([
        "Make sure you're getting enough sleep (7-9 hours)",
        "Stay physically active with regular exercise",
        "Practice gratitude by noting down three good things each day"
    ])
    
    return suggestions[:5]  # Return top 5 most relevant suggestions 