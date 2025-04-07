const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const Question = require('../models/Question');

// @route   GET /api/questions
// @desc    Get all questions with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Apply filters
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'popular') sortOption = { upvotes: -1 };
    if (sort === 'unanswered') sortOption = { 'answers.0': { $exists: false } };
    
    const questions = await Question.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const count = await Question.countDocuments(query);
    
    res.json({
      questions,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/questions
// @desc    Create a question
// @access  Public
router.post('/', [
  check('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  check('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  check('category').isIn(['mental-health', 'mindfulness', 'emotional-intelligence', 'well-being']).withMessage('Invalid category')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, content, category, tags, authorName } = req.body;
    
    // Create new question
    const newQuestion = new Question({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      authorName: authorName || 'Anonymous'
    });
    
    const question = await newQuestion.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Public
router.put('/:id', [
  check('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  check('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  check('category').isIn(['mental-health', 'mindfulness', 'emotional-intelligence', 'well-being']).withMessage('Invalid category')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, content, category, tags } = req.body;
    
    let question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Update fields
    question.title = title;
    question.content = content;
    question.category = category;
    question.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    await question.save();
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/questions/:id/answers
// @desc    Add an answer to a question
// @access  Public
router.post('/:id/answers', [
  check('content').isLength({ min: 20 }).withMessage('Answer must be at least 20 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { content, authorName } = req.body;
    
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Create new answer
    const newAnswer = {
      content,
      authorName: authorName || 'Anonymous',
      createdAt: Date.now()
    };
    
    // Add to answers array
    question.answers.unshift(newAnswer);
    
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/questions/:id/vote
// @desc    Vote on a question
// @access  Public
router.post('/:id/vote', async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    if (voteType === 'upvote') {
      question.upvotes += 1;
    } else {
      question.downvotes += 1;
    }
    
    await question.save();
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/questions/:id/answers/:answer_id/vote
// @desc    Vote on an answer
// @access  Public
router.post('/:id/answers/:answer_id/vote', async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Find the answer
    const answer = question.answers.id(req.params.answer_id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    if (voteType === 'upvote') {
      answer.upvotes += 1;
    } else {
      answer.downvotes += 1;
    }
    
    await question.save();
    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question or answer not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;