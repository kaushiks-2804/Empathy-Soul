# Virtual Companion Backend

This is a Flask-based backend server that provides chatbot and text-to-speech functionality without requiring paid APIs.

## Features

- Local chatbot using Facebook's BlenderBot model
- Text-to-speech using gTTS (Google Text-to-Speech)
- RESTful API endpoints
- CORS support for frontend integration
- Temporary audio file management

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### 1. Chat Endpoint
- **URL:** `/chat`
- **Method:** `POST`
- **Body:**
```json
{
    "message": "Your message here"
}
```
- **Response:**
```json
{
    "text": "Bot's response",
    "audio_url": "/audio/filename.mp3"
}
```

### 2. Audio Endpoint
- **URL:** `/audio/<filename>`
- **Method:** `GET`
- **Response:** Audio file (MP3)

### 3. Cleanup Endpoint
- **URL:** `/cleanup`
- **Method:** `POST`
- **Description:** Cleans up temporary audio files

## Frontend Integration

Update your frontend API calls to use these endpoints instead of OpenAI and ElevenLabs:

```javascript
const chat = async (message) => {
    const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return {
        text: data.text,
        audioUrl: `http://localhost:5000${data.audio_url}`
    };
};
```

## Notes

- The chatbot uses a smaller model (BlenderBot) for better performance on local machines
- Audio files are temporarily stored and should be cleaned up periodically
- The text-to-speech quality might be different from ElevenLabs but is completely free
- You may need to adjust CORS settings based on your frontend URL 