const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 20
  },
  authorName: {
    type: String,
    default: 'Anonymous'
  },
  category: {
    type: String,
    required: true,
    enum: ['mental-health', 'mindfulness', 'emotional-intelligence', 'well-being']
  },
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  answers: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    authorName: {
      type: String,
      default: 'Anonymous'
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
questionSchema.index({ title: 'text', content: 'text' });

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.upvotes - this.downvotes;
});

module.exports = mongoose.model('Question', questionSchema);