// API Configuration
const API_URL = 'http://localhost:8000/api';

// Mood Options
const moodOptions = {
    1: { text: 'terrible', icon: '😫', color: '#d63031' },
    2: { text: 'angry', icon: '😠', color: '#e17055' },
    3: { text: 'sad', icon: '😢', color: '#6c5ce7' },
    4: { text: 'worried', icon: '😰', color: '#0984e3' },
    5: { text: 'neutral', icon: '😐', color: '#636e72' },
    6: { text: 'calm', icon: '😌', color: '#00b894' },
    7: { text: 'happy', icon: '😊', color: '#fdcb6e' },
    8: { text: 'excited', icon: '🤩', color: '#e84393' },
    9: { text: 'amazing', icon: '🌟', color: '#00cec9' }
};

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.page');
const moodOptionsContainer = document.getElementById('mood-options');
const journalText = document.getElementById('journal-text');
const submitEntryBtn = document.getElementById('submit-entry');
const themeSelect = document.getElementById('theme-select');
const reminderTime = document.getElementById('reminder-time');
const soundEffects = document.getElementById('sound-effects');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetPage = link.dataset.page;
        navigateToPage(targetPage);
    });
});

function navigateToPage(pageId) {
    // Update active states
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });

    // Load page-specific data
    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'journal':
            setupJournal();
            break;
        case 'analysis':
            loadAnalysis();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const entries = await fetchEntries();
        updateDashboardStats(entries);
        updateRecentEntries(entries);
        loadSuggestions();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateDashboardStats(entries) {
    if (entries.length === 0) {
        document.getElementById('avg-mood').textContent = '-';
        document.getElementById('dominant-emotion').textContent = '-';
        return;
    }

    // Calculate average mood
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length;
    document.getElementById('avg-mood').textContent = `${avgMood.toFixed(1)}/9`;

    // Find dominant emotion
    const emotions = {};
    entries.forEach(entry => {
        emotions[entry.emotion] = (emotions[entry.emotion] || 0) + 1;
    });
    const dominantEmotion = Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)[0][0];
    document.getElementById('dominant-emotion').textContent = dominantEmotion;
}

function updateRecentEntries(entries) {
    const entriesList = document.getElementById('entries-list');
    entriesList.innerHTML = entries.slice(0, 5).map(entry => `
        <div class="entry-item">
            <div class="entry-date">${formatDate(entry.date)}</div>
            <div class="entry-mood" style="color: ${moodOptions[entry.mood_score].color}">
                ${moodOptions[entry.mood_score].icon} ${entry.emotion}
            </div>
            <div class="entry-text">${entry.journal_text}</div>
        </div>
    `).join('');
}

// Journal Functions
function setupJournal() {
    // Create mood options
    moodOptionsContainer.innerHTML = Object.entries(moodOptions)
        .map(([score, { text, icon, color }]) => `
            <div class="mood-option" data-score="${score}" style="color: ${color}">
                <span class="mood-icon">${icon}</span>
                <span class="mood-text">${text}</span>
            </div>
        `).join('');

    // Add click handlers
    const moodOptionElements = document.querySelectorAll('.mood-option');
    moodOptionElements.forEach(option => {
        option.addEventListener('click', () => {
            moodOptionElements.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Handle form submission
    submitEntryBtn.addEventListener('click', submitEntry);
}

async function submitEntry() {
    const selectedMood = document.querySelector('.mood-option.selected');
    if (!selectedMood) {
        alert('Please select a mood');
        return;
    }

    const moodScore = parseInt(selectedMood.dataset.score);
    const emotion = moodOptions[moodScore].text;
    const text = journalText.value.trim();

    // Create the request body
    const requestBody = {
        mood_score: moodScore,
        emotion: emotion,
        journal_text: text || null
    };

    try {
        const response = await fetch(`${API_URL}/entries/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to save entry');
        }

        const result = await response.json();
        alert('Entry saved successfully!');
        journalText.value = '';
        navigateToPage('dashboard');
    } catch (error) {
        console.error('Error submitting entry:', error);
        alert(`Failed to save entry: ${error.message}`);
    }
}

// Analysis Functions
async function loadAnalysis() {
    try {
        const entries = await fetchEntries();
        updateEmotionDistribution(entries);
        loadPredictions();
    } catch (error) {
        console.error('Error loading analysis:', error);
    }
}

function updateEmotionDistribution(entries) {
    const emotionChart = document.getElementById('emotion-chart');
    if (!entries || entries.length === 0) {
        emotionChart.innerHTML = '<div class="no-data">No entries available for analysis</div>';
        return;
    }

    const emotions = {};
    entries.forEach(entry => {
        emotions[entry.emotion] = (emotions[entry.emotion] || 0) + 1;
    });

    const total = entries.length;
    emotionChart.innerHTML = Object.entries(emotions)
        .map(([emotion, count]) => {
            const percentage = (count / total) * 100;
            const color = Object.values(moodOptions).find(opt => opt.text === emotion)?.color || '#636e72';
            return `
                <div class="emotion-bar">
                    <div class="emotion-label">${emotion}</div>
                    <div class="emotion-bar-container">
                        <div class="emotion-bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                    </div>
                    <div class="emotion-value">${count} (${percentage.toFixed(1)}%)</div>
                </div>
            `;
        }).join('');
}

// Settings Functions
function loadSettings() {
    // Load saved settings
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedReminderTime = localStorage.getItem('reminderTime') || '20:00';
    const savedSoundEffects = localStorage.getItem('soundEffects') === 'true';

    themeSelect.value = savedTheme;
    reminderTime.value = savedReminderTime;
    soundEffects.checked = savedSoundEffects;

    // Add event listeners
    themeSelect.addEventListener('change', updateTheme);
    reminderTime.addEventListener('change', updateReminderTime);
    soundEffects.addEventListener('change', updateSoundEffects);
}

function updateTheme() {
    const theme = themeSelect.value;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function updateReminderTime() {
    localStorage.setItem('reminderTime', reminderTime.value);
}

function updateSoundEffects() {
    localStorage.setItem('soundEffects', soundEffects.checked);
}

// Utility Functions
async function fetchEntries() {
    try {
        const response = await fetch(`${API_URL}/entries/recent`);
        if (!response.ok) throw new Error('Failed to fetch entries');
        return await response.json();
    } catch (error) {
        console.error('Error fetching entries:', error);
        return [];
    }
}

async function loadSuggestions() {
    try {
        const response = await fetch(`${API_URL}/analysis/suggestions`);
        if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
        }
        const data = await response.json();
        const suggestionsList = document.getElementById('suggestions-list');
        
        if (!data || !data.suggestions || data.suggestions.length === 0) {
            suggestionsList.innerHTML = '<div class="no-data">Start tracking your mood to get personalized suggestions!</div>';
            return;
        }

        // Format suggestions with emojis based on mood
        suggestionsList.innerHTML = data.suggestions.map(suggestion => {
            let emoji = '💡';
            if (suggestion.toLowerCase().includes('happy') || suggestion.toLowerCase().includes('positive')) {
                emoji = '😊';
            } else if (suggestion.toLowerCase().includes('stress') || suggestion.toLowerCase().includes('anxiety')) {
                emoji = '🧘';
            } else if (suggestion.toLowerCase().includes('exercise') || suggestion.toLowerCase().includes('activity')) {
                emoji = '🏃';
            } else if (suggestion.toLowerCase().includes('sleep') || suggestion.toLowerCase().includes('rest')) {
                emoji = '😴';
            }
            return `<div class="suggestion">${emoji} ${suggestion}</div>`;
        }).join('');
    } catch (error) {
        console.error('Error loading suggestions:', error);
        document.getElementById('suggestions-list').innerHTML = 
            '<div class="error">Failed to load suggestions. Please try again later.</div>';
    }
}

async function loadPredictions() {
    try {
        const response = await fetch(`${API_URL}/analysis/predictions`);
        if (!response.ok) {
            throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();
        const predictionsList = document.getElementById('predictions-list');
        
        if (!data || !data.predictions || data.predictions.length === 0) {
            predictionsList.innerHTML = '<div class="no-data">Add more entries to get mood predictions!</div>';
            return;
        }

        // Format predictions with trend indicators
        predictionsList.innerHTML = data.predictions.map(prediction => {
            let trend = '';
            if (prediction.toLowerCase().includes('improve') || prediction.toLowerCase().includes('better')) {
                trend = '📈';
            } else if (prediction.toLowerCase().includes('decline') || prediction.toLowerCase().includes('worse')) {
                trend = '📉';
            } else {
                trend = '➡️';
            }
            return `<div class="prediction">${trend} ${prediction}</div>`;
        }).join('');
    } catch (error) {
        console.error('Error loading predictions:', error);
        document.getElementById('predictions-list').innerHTML = 
            '<div class="error">Failed to load predictions. Please try again later.</div>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load initial page
    navigateToPage('dashboard');
}); 