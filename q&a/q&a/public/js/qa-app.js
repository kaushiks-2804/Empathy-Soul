// Q&A Forum Frontend JavaScript

// API URL - adjust as needed based on your environment
const API_URL = '/api';

// State management
let questions = [];
let currentQuestion = null;

// DOM Elements
const questionsContainer = document.querySelector('.questions-container');
const newQuestionForm = document.getElementById('new-question-form');
const questionForm = document.getElementById('question-form');
const searchInput = document.querySelector('.search-container input');
const categoryFilter = document.getElementById('category-filter');
const questionDetailModal = document.getElementById('question-detail-modal');

// Pre-populated questions for mental health
const presetQuestions = [
  {
    _id: 'q1',
    title: 'How can I be more present in my daily interactions?',
    content: 'I find myself constantly distracted during conversations with friends and family. I want to be more present and engaged. What mindfulness techniques can help with this?',
    authorName: 'Sarah L.',
    category: 'mindfulness',
    tags: ['mindfulness', 'presence', 'relationships'],
    upvotes: 24,
    downvotes: 2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a1',
        content: 'I\'ve found that practicing the "5-4-3-2-1" grounding technique helps me stay present. Notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste. It brings you back to the moment quickly.',
        authorName: 'Michael R.',
        upvotes: 12,
        downvotes: 0,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'q2',
    title: 'What strategies help in managing emotional overwhelm?',
    content: 'I often feel emotionally overwhelmed at work and in my personal life. Are there any effective techniques to manage these feelings in the moment and prevent burnout?',
    authorName: 'James T.',
    category: 'mental-health',
    tags: ['emotional-resilience', 'stress-management', 'self-care'],
    upvotes: 37,
    downvotes: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a2',
        content: 'The 4-7-8 breathing technique (inhale for 4 counts, hold for 7, exhale for 8) can be incredibly effective for calming the nervous system during moments of overwhelm. It activates the parasympathetic nervous system and helps reduce stress hormones.',
        authorName: 'Dr. Emily Chen',
        upvotes: 22,
        downvotes: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'a3',
        content: 'I recommend the RAIN approach: Recognize the emotion, Allow it to be there, Investigate it with kindness, and Non-identify (realize the emotion isn\'t you). This mindfulness practice has helped me work through overwhelming emotions without being consumed by them.',
        authorName: 'Alex P.',
        upvotes: 15,
        downvotes: 0,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'q3',
    title: 'How can I develop stronger empathy?',
    content: 'I want to improve my ability to understand and connect with others\' emotions. What practices can help develop deeper empathy in both personal and professional relationships?',
    authorName: 'Elena K.',
    category: 'emotional-intelligence',
    tags: ['empathy', 'social-awareness', 'relationship-management'],
    upvotes: 45,
    downvotes: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a4',
        content: 'Active listening is fundamental to developing empathy. This means truly focusing on what someone is saying without planning your response, asking clarifying questions, and reflecting back what you heard to ensure you understood correctly. This practice alone can dramatically improve your empathic connection with others.',
        authorName: 'Marcus J.',
        upvotes: 28,
        downvotes: 0,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'q4',
    title: 'What are effective ways to manage anxiety in high-stress situations?',
    content: 'I experience significant anxiety when giving presentations at work or attending important meetings. What techniques can I use to calm my nerves and stay focused?',
    authorName: 'David M.',
    category: 'mental-health',
    tags: ['anxiety', 'stress-management', 'work-related-stress'],
    upvotes: 51,
    downvotes: 2,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a5',
        content: 'Progressive muscle relaxation is very effective before high-stress events. Tense and then release each muscle group in your body, starting from your toes and working up to your head. This reduces physical tension that often accompanies anxiety.',
        authorName: 'Sophia L.',
        upvotes: 33,
        downvotes: 1,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'q5',
    title: 'How can I establish a consistent meditation practice?',
    content: 'I understand the benefits of meditation for mental health but struggle to maintain a consistent practice. How can I overcome the initial challenges and make meditation a daily habit?',
    authorName: 'Nora P.',
    category: 'mindfulness',
    tags: ['meditation', 'habits', 'mindfulness'],
    upvotes: 28,
    downvotes: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answers: []
  }
];

// Initialize with preset questions
questions = [...presetQuestions];

// Fetch a single question with all details
function getQuestionDetails(questionId) {
  return questions.find(q => q._id === questionId);
}

// Post a new question
function postQuestion(questionData) {
  try {
    // Create a new question object
    const newQuestion = {
      _id: 'q' + (questions.length + 1),
      title: questionData.title,
      content: questionData.content,
      authorName: questionData.authorName || 'Anonymous',
      category: questionData.category,
      tags: questionData.tags ? questionData.tags.split(',').map(tag => tag.trim()) : [],
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      answers: []
    };
    
    // Add to questions array
    questions.unshift(newQuestion);
    showNotification('Question posted successfully!', 'success');
    renderQuestions();
    return newQuestion;
  } catch (error) {
    console.error('Error posting question:', error);
    showNotification('Error posting question. Please try again.', 'error');
    return false;
  }
}

// Post an answer to a question
function postAnswer(questionId, answerData) {
  try {
    const questionIndex = questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) {
      showNotification('Question not found', 'error');
      return false;
    }
    
    // Create a new answer object
    const newAnswer = {
      _id: 'a' + (Math.floor(Math.random() * 1000)),
      content: answerData.content,
      authorName: answerData.authorName || 'Anonymous',
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString()
    };
    
    // Add to question's answers
    questions[questionIndex].answers.push(newAnswer);
    currentQuestion = questions[questionIndex];
    showNotification('Answer posted successfully!', 'success');
    renderQuestionDetail();
    return true;
  } catch (error) {
    console.error('Error posting answer:', error);
    showNotification('Error posting answer. Please try again.', 'error');
    return false;
  }
}

// Vote on a question
function voteQuestion(questionId, voteType) {
  try {
    const questionIndex = questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) {
      showNotification('Question not found', 'error');
      return false;
    }
    
    if (voteType === 'upvote') {
      questions[questionIndex].upvotes += 1;
    } else if (voteType === 'downvote') {
      questions[questionIndex].downvotes += 1;
    }
    
    if (currentQuestion && currentQuestion._id === questionId) {
      currentQuestion = questions[questionIndex];
      renderQuestionDetail();
    }
    renderQuestions();
    return true;
  } catch (error) {
    console.error('Error voting:', error);
    showNotification('Error voting. Please try again.', 'error');
    return false;
  }
}

// Vote on an answer
function voteAnswer(questionId, answerId, voteType) {
  try {
    const questionIndex = questions.findIndex(q => q._id === questionId);
    if (questionIndex === -1) {
      showNotification('Question not found', 'error');
      return false;
    }
    
    const answerIndex = questions[questionIndex].answers.findIndex(a => a._id === answerId);
    if (answerIndex === -1) {
      showNotification('Answer not found', 'error');
      return false;
    }
    
    if (voteType === 'upvote') {
      questions[questionIndex].answers[answerIndex].upvotes += 1;
    } else if (voteType === 'downvote') {
      questions[questionIndex].answers[answerIndex].downvotes += 1;
    }
    
    if (currentQuestion && currentQuestion._id === questionId) {
      currentQuestion = questions[questionIndex];
      renderQuestionDetail();
    }
    return true;
  } catch (error) {
    console.error('Error voting on answer:', error);
    showNotification('Error voting. Please try again.', 'error');
    return false;
  }
}

// Render questions list
function renderQuestions() {
  const filterCategory = categoryFilter.value;
  const searchTerm = searchInput.value.toLowerCase();
  
  // Apply filters
  let filteredQuestions = questions;
  if (filterCategory) {
    filteredQuestions = filteredQuestions.filter(q => q.category === filterCategory);
  }
  if (searchTerm) {
    filteredQuestions = filteredQuestions.filter(q => 
      q.title.toLowerCase().includes(searchTerm) || 
      q.content.toLowerCase().includes(searchTerm) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Clear loading indicator
  questionsContainer.innerHTML = '';
  
  if (filteredQuestions.length === 0) {
    questionsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No questions found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  // Render each question
  filteredQuestions.forEach(question => {
    const formattedDate = new Date(question.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.innerHTML = `
      <div class="question-header">
        <h3 class="question-title">${question.title}</h3>
        <div class="user-info">
          <div class="user-avatar"></div>
          <div>
            <div>${question.authorName}</div>
            <div class="question-meta">
              <span><i class="far fa-clock"></i> ${formattedDate}</span>
              <span><i class="far fa-comment"></i> ${question.answers.length} answers</span>
            </div>
          </div>
        </div>
      </div>
      <div class="question-content">
        <p>${question.content}</p>
      </div>
      <div class="question-tags">
        ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <div class="question-actions">
        <button class="action-btn" data-action="upvote" data-id="${question._id}">
          <i class="far fa-thumbs-up"></i> ${question.upvotes}
        </button>
        <button class="action-btn" data-action="answer" data-id="${question._id}">
          <i class="far fa-comment"></i> Answer
        </button>
        <button class="action-btn" data-action="view" data-id="${question._id}">
          <i class="far fa-eye"></i> View Details
        </button>
      </div>
    `;
    
    questionsContainer.appendChild(questionCard);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', handleActionButtonClick);
  });
}

// Render question detail in modal
function renderQuestionDetail() {
  if (!currentQuestion) return;
  
  const formattedDate = new Date(currentQuestion.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  questionDetailModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${currentQuestion.title}</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="question-detail">
          <div class="user-info">
            <div class="user-avatar"></div>
            <div>
              <div>${currentQuestion.authorName}</div>
              <div class="question-meta">
                <span><i class="far fa-clock"></i> ${formattedDate}</span>
                <span><i class="far fa-comment"></i> ${currentQuestion.answers.length} answers</span>
              </div>
            </div>
          </div>
          <div class="question-content">
            <p>${currentQuestion.content}</p>
          </div>
          <div class="question-tags">
            ${currentQuestion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="question-actions">
            <button class="vote-btn upvote" data-action="upvote-question" data-id="${currentQuestion._id}">
              <i class="far fa-thumbs-up"></i> ${currentQuestion.upvotes}
            </button>
            <button class="vote-btn downvote" data-action="downvote-question" data-id="${currentQuestion._id}">
              <i class="far fa-thumbs-down"></i> ${currentQuestion.downvotes}
            </button>
          </div>
        </div>
        
        ${renderAnswers()}
        
        <div class="post-answer">
          <h3>Your Answer</h3>
          <form id="answer-form">
            <textarea id="answer-content" name="content" placeholder="Write your answer here..." required></textarea>
            <div class="form-group">
              <label for="answer-author">Your Name (Optional)</label>
              <input type="text" id="answer-author" name="authorName" placeholder="Enter your name or leave anonymous">
            </div>
            <button type="submit" class="btn-primary">Post Answer</button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Show the modal
  questionDetailModal.style.display = 'flex';
  
  // Add event listeners
  questionDetailModal.querySelector('.close-modal').addEventListener('click', hideQuestionModal);
  questionDetailModal.querySelector('#answer-form').addEventListener('submit', handleAnswerSubmit);
  
  // Vote buttons
  questionDetailModal.querySelectorAll('.vote-btn').forEach(button => {
    button.addEventListener('click', handleActionButtonClick);
  });
}

// Helper to render answers in the question detail
function renderAnswers() {
  if (!currentQuestion || !currentQuestion.answers || currentQuestion.answers.length === 0) {
    return `
      <div class="answers-section">
        <h3>Answers (0)</h3>
        <div class="empty-state">
          <p>No answers yet. Be the first to answer this question!</p>
        </div>
      </div>
    `;
  }
  
  // Sort answers by upvotes (highest first)
  const sortedAnswers = [...currentQuestion.answers].sort((a, b) => b.upvotes - a.upvotes);
  
  return `
    <div class="answers-section">
      <h3>Answers (${sortedAnswers.length})</h3>
      ${sortedAnswers.map(answer => {
        const answerDate = new Date(answer.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        return `
          <div class="answer-item">
            <div class="user-info">
              <div class="user-avatar"></div>
              <div>
                <div>${answer.authorName}</div>
                <div class="question-meta">
                  <span><i class="far fa-clock"></i> ${answerDate}</span>
                </div>
              </div>
            </div>
            <p>${answer.content}</p>
            <div class="question-actions">
              <button class="vote-btn upvote" data-action="upvote-answer" data-question="${currentQuestion._id}" data-id="${answer._id}">
                <i class="far fa-thumbs-up"></i> ${answer.upvotes}
              </button>
              <button class="vote-btn downvote" data-action="downvote-answer" data-question="${currentQuestion._id}" data-id="${answer._id}">
                <i class="far fa-thumbs-down"></i> ${answer.downvotes}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// UI helpers
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function showQuestionModal(questionId) {
  currentQuestion = getQuestionDetails(questionId);
  if (currentQuestion) {
    renderQuestionDetail();
  }
}

function hideQuestionModal() {
  questionDetailModal.style.display = 'none';
}

// Event handlers
function handleActionButtonClick(e) {
  const action = e.currentTarget.dataset.action;
  const id = e.currentTarget.dataset.id;
  
  switch (action) {
    case 'upvote':
      voteQuestion(id, 'upvote');
      break;
    case 'downvote':
      voteQuestion(id, 'downvote');
      break;
    case 'answer':
    case 'view':
      showQuestionModal(id);
      break;
    case 'upvote-question':
      voteQuestion(id, 'upvote');
      break;
    case 'downvote-question':
      voteQuestion(id, 'downvote');
      break;
    case 'upvote-answer':
      voteAnswer(e.currentTarget.dataset.question, id, 'upvote');
      break;
    case 'downvote-answer':
      voteAnswer(e.currentTarget.dataset.question, id, 'downvote');
      break;
  }
}

function handleAnswerSubmit(e) {
  e.preventDefault();
  
  const content = document.getElementById('answer-content').value;
  const authorName = document.getElementById('answer-author').value;
  
  if (!content) {
    showNotification('Please enter your answer', 'error');
    return;
  }
  
  postAnswer(currentQuestion._id, { content, authorName });
  document.getElementById('answer-content').value = '';
  document.getElementById('answer-author').value = '';
}

function handleQuestionSubmit(e) {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('question-title').value,
    content: document.getElementById('question-content').value,
    category: document.getElementById('question-category').value,
    tags: document.getElementById('question-tags').value,
    authorName: document.getElementById('question-author').value
  };
  
  if (!formData.title || !formData.content || !formData.category) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  postQuestion(formData);
  e.target.reset();
}

// Search and filter functionality
function handleSearch() {
  renderQuestions();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  renderQuestions();
  
  // Event listeners for forms
  questionForm.addEventListener('submit', handleQuestionSubmit);
  
  // Event listeners for search and filter
  searchInput.addEventListener('input', debounce(handleSearch, 300));
  categoryFilter.addEventListener('change', handleSearch);
});

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
