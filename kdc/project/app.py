from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import uuid
import logging
import random
import json
from datetime import datetime

# For text-to-speech
import gtts

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Update CORS settings to allow all headers and methods from frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite's default port
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Create a temporary directory for audio files
TEMP_DIR = "temp_audio"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Load conversation data from JSON file if available
CONVERSATION_DATA_FILE = "conversation_data.json"
conversation_data = {
    "greetings": [
        "Hello! How can I help you today?",
        "Hi there! I'm here to assist you. What's on your mind?",
        "Greetings! How are you feeling today?",
        "Welcome! How can I support you right now?",
        "Hello! I'm your AI companion. What would you like to talk about?"
    ],
    "farewells": [
        "Goodbye! Feel free to return whenever you need support.",
        "Take care! I'm here if you need to talk again.",
        "Wishing you well! Come back anytime.",
        "Stay well! Remember, I'm always here to listen.",
        "Goodbye for now. I hope our conversation was helpful!"
    ],
    "self_intro": [
        "I'm KDC, your friendly AI companion designed to provide emotional support and guidance.",
        "My name is KDC. I'm an AI created to offer a listening ear and helpful perspectives.",
        "I'm KDC, an AI assistant focused on supporting mental well-being and emotional health.",
        "I'm KDC, here to provide a safe space for conversation about anything that's on your mind."
    ],
    "anxiety_responses": [
        "It sounds like you might be experiencing some anxiety. Remember that taking slow, deep breaths can help calm your nervous system. Would you like to try a quick breathing exercise together?",
        "Anxiety can be challenging to deal with. Consider grounding yourself by noticing five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste. Would this help right now?",
        "When anxiety appears, it's helpful to question our thoughts. Is there evidence for what you're worried about? Are there other perspectives you might consider?",
        "I understand anxiety can feel overwhelming. Regular physical activity, even just a short walk, can help reduce anxiety levels. Have you tried incorporating movement into your routine?",
        "Anxiety often stems from worrying about the future. Practicing mindfulness can help bring your attention back to the present moment. Would you like some simple mindfulness techniques?"
    ],
    "depression_responses": [
        "I'm sorry to hear you're feeling down. Remember that depression often lies to us about our worth and capabilities. Your feelings are valid, but they don't define you.",
        "Depression can make even simple tasks feel overwhelming. Try breaking things down into very small steps and celebrating each accomplishment, no matter how small it may seem.",
        "When feeling depressed, our self-care often suffers. Have you been able to attend to basics like eating regularly, getting some sleep, and perhaps spending even a short time outdoors?",
        "Social connection can be powerful medicine for depression, even though it may be the last thing you feel like doing. Is there someone supportive you could reach out to, even with just a brief message?",
        "Depression often involves negative thought patterns. Try to notice when your mind is being overly critical or pessimistic. Gently challenging these thoughts can help shift your perspective."
    ],
    "meditation_responses": [
        "Meditation can be a powerful practice for mental well-being. Even just 5 minutes of focused breathing can make a difference. Would you like a simple meditation exercise to try?",
        "For beginners, I recommend starting with guided meditation. The Empathy Soul meditation page has some excellent options to get started. Have you explored those resources?",
        "Body scan meditation can be particularly helpful for relaxation. It involves bringing awareness to each part of your body from toe to head. Would you like me to guide you through a brief body scan?",
        "Consistency is key with meditation. Even a few minutes daily is more beneficial than an hour once a week. Have you considered setting a regular time for practice?",
        "Walking meditation can be a good alternative if sitting still is challenging. It involves walking slowly and mindfully, paying attention to each step and breath. This might be worth trying if traditional meditation feels difficult."
    ],
    "general_wellbeing": [
        "Research shows that regular exercise, balanced nutrition, quality sleep, and social connection are foundational to mental health. How are you doing with these basics?",
        "Sometimes small changes can have big impacts on wellbeing. Adding just 10 minutes of movement, an extra vegetable, or 30 minutes of earlier sleep can make a difference. What small step might be manageable for you?",
        "Our digital habits can significantly impact our mental health. Consider taking short breaks from screens and social media. Does that sound helpful?",
        "Practicing gratitude has been shown to improve mood and outlook. Even in difficult times, noticing one or two things to appreciate can shift our perspective. What's something small you feel grateful for today?",
        "Nature exposure has powerful effects on our mental state. Even looking at images of nature or having a plant nearby can help. Do you have opportunities to connect with nature in your daily life?"
    ],
    "fallback_responses": [
        "Thank you for sharing that with me. Could you tell me more about how this has been affecting you?",
        "I appreciate you opening up. What aspects of this situation feel most challenging for you right now?",
        "I'm here to listen and support you. How have you been coping with this so far?",
        "Thank you for trusting me with this. Would it help to explore some strategies that might be useful in this situation?",
        "I'm interested in understanding more about your experience. How long have you been feeling this way?"
    ]
}

# Check if data file exists and load it
if os.path.exists(CONVERSATION_DATA_FILE):
    try:
        with open(CONVERSATION_DATA_FILE, 'r') as f:
            loaded_data = json.load(f)
            conversation_data.update(loaded_data)
            logger.info(f"Loaded conversation data from {CONVERSATION_DATA_FILE}")
    except Exception as e:
        logger.error(f"Error loading conversation data: {e}")

# Enhanced response generation with more context awareness
def generate_response(user_input):
    logger.info(f"Generating response for: {user_input}")
    user_input = user_input.lower()
    
    # Track conversation context
    # Greeting detection
    if any(greeting in user_input for greeting in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]):
        return random.choice(conversation_data["greetings"])
    
    # Farewell detection
    if any(farewell in user_input for farewell in ["goodbye", "bye", "see you", "talk to you later", "farewell"]):
        return random.choice(conversation_data["farewells"])
    
    # Self-introduction
    if any(intro_q in user_input for intro_q in ["who are you", "what are you", "what is your name", "what's your name", "tell me about yourself"]):
        return random.choice(conversation_data["self_intro"])
    
    # Anxiety related
    if any(anxiety_term in user_input for anxiety_term in ["anxiety", "anxious", "worried", "nervous", "stress", "stressed", "panic", "fear", "afraid"]):
        return random.choice(conversation_data["anxiety_responses"])
    
    # Depression related
    if any(depression_term in user_input for depression_term in ["depress", "sad", "unhappy", "miserable", "down", "blue", "hopeless", "worthless", "tired", "exhausted"]):
        return random.choice(conversation_data["depression_responses"])
    
    # Meditation related
    if any(meditation_term in user_input for meditation_term in ["meditat", "mindful", "breathing", "relax", "calm", "peace", "zen", "yoga"]):
        return random.choice(conversation_data["meditation_responses"])
    
    # Check for questions about well-being practices
    if ("how" in user_input or "what" in user_input) and any(wellbeing_term in user_input for wellbeing_term in ["feel better", "improve", "health", "wellness", "wellbeing", "self-care", "self care", "mental health"]):
        return random.choice(conversation_data["general_wellbeing"])
    
    # If no specific category is detected, use fallback responses
    return random.choice(conversation_data["fallback_responses"])

def text_to_speech(text):
    # Generate unique filename
    audio_file = os.path.join(TEMP_DIR, f"{str(uuid.uuid4())}.mp3")
    
    try:
        # Use gTTS for text-to-speech conversion
        tts = gtts.gTTS(text=text, lang='en', slow=False)
        tts.save(audio_file)
        logger.info(f"Created audio file with gTTS: {audio_file}")
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        # Create fallback empty file in case of error
        with open(audio_file, 'wb') as f:
            f.write(b"")
    
    return audio_file

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        logger.info(f"Received data: {data}")
        user_message = data.get('message', '')
        
        if not user_message:
            logger.error("No message provided")
            return jsonify({'error': 'No message provided'}), 400
        
        # Generate text response
        response_text = generate_response(user_message)
        logger.info(f"Generated response: {response_text}")
        
        # Generate speech
        audio_file = text_to_speech(response_text)
        
        return jsonify({
            'text': response_text,
            'audio_url': f'/audio/{os.path.basename(audio_file)}'
        })
    
    except Exception as e:
        logger.exception("Error in chat endpoint")
        return jsonify({'error': str(e)}), 500

@app.route('/audio/<filename>')
def serve_audio(filename):
    try:
        logger.info(f"Serving audio file: {filename}")
        return send_file(
            os.path.join(TEMP_DIR, filename),
            mimetype='audio/mp3'
        )
    except Exception as e:
        logger.exception(f"Error serving audio file: {filename}")
        return jsonify({'error': str(e)}), 404

# Cleanup old audio files
@app.route('/cleanup', methods=['POST'])
def cleanup():
    try:
        count = 0
        for file in os.listdir(TEMP_DIR):
            file_path = os.path.join(TEMP_DIR, file)
            if os.path.isfile(file_path):
                os.remove(file_path)
                count += 1
        logger.info(f"Cleaned up {count} files")
        return jsonify({'message': f'Cleanup successful, removed {count} files'})
    except Exception as e:
        logger.exception("Error in cleanup endpoint")
        return jsonify({'error': str(e)}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'status': 'ok', 'message': 'KDC Chatbot backend is running'})

if __name__ == '__main__':
    logger.info("Starting KDC Chatbot backend on port 5000")
    app.run(debug=True, port=5000, threaded=True)