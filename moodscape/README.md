# MoodScape

A single-user AI mood tracking web application that provides intuitive mood tracking with 3D visualization and AI-powered insights.

## Features

- **3D Journal Interface**: Interactive Three.js environment with mood visualizations
- **Mood Tracking**: Track your mood with a simple and intuitive interface
- **AI Analysis**: Get insights into your mood patterns with AI-powered analysis
- **Local Storage**: All data stored locally for privacy
- **Encrypted Database**: SQLite with encryption for data security
- **Voice Journal**: Record your thoughts with speech-to-text conversion
- **Mood-Triggered Music**: Generate soundscapes based on your mood

## Project Structure

```
moodscape/
├── frontend/           # React + Vite + Three.js frontend
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── ...
└── backend/            # Python FastAPI backend
    ├── app/            # Application code
    │   ├── routes/     # API routes
    │   ├── schemas/    # Pydantic schemas
    │   └── ai/         # AI models and logic
    ├── database/       # Database models and connection
    └── ...
```

## Tech Stack

### Frontend
- React
- TypeScript
- Three.js
- D3.js
- Tone.js
- Tailwind CSS

### Backend
- Python FastAPI
- SQLAlchemy
- SQLite with SQLCipher
- HuggingFace Transformers
- NLTK

## Database Schema

### ER Diagram

```
+-----------------+     +----------------+     +-----------------+
| mood_entries    |     | ai_analysis    |     | user_settings   |
+-----------------+     +----------------+     +-----------------+
| id              |<----| entry_id       |     | id              |
| date            |     | sentiment_score|     | theme           |
| mood_score      |     | sentiment_label|     | color_scheme    |
| emotion         |     | keywords       |     | notifications   |
| journal_text    |     | predictions    |     | sound_enabled   |
| three_d_elements|     | suggestions    |     | voice_journal   |
+-----------------+     +----------------+     | ai_analysis     |
                                               | interaction_prefs|
                                               +-----------------+
```

## Getting Started

### Prerequisites
- Node.js v16+
- Python 3.9+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/moodscape.git
cd moodscape
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

4. Open your browser and navigate to `http://localhost:5173`

## Development Roadmap

1. **Phase 1: Core System Setup**
   - Local database configuration
   - 3D journal interface

2. **Phase 2: AI Integration**
   - Mood analysis engine
   - Interactive features

3. **Phase 3: Advanced Implementation**
   - Voice journal option
   - Dream interpreter module
   - Mood-triggered music

## License

MIT License 