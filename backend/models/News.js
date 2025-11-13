const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  // English Content
  englishTitle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  englishContent: {
    type: String,
    required: true
  },
  englishTags: [{
    type: String,
    trim: true
  }],

  // Telugu Content
  teluguTitle: {
    type: String,
    required: true,
    trim: true
  },
  teluguContent: {
    type: String,
    required: true
  },
  teluguTags: [{
    type: String,
    trim: true
  }],

  // Metadata
  originalLink: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  source: {
    type: String,
    default: 'newsdata.io'
  },
  category: {
    type: String,
    enum: ['politics', 'technology', 'sports', 'entertainment', 'business', 'health', 'science', 'general', 'top'],
    default: 'general'
  },
  originalCategories: [{
    type: String
  }],
  
  // Dates
  publishedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Auto-fetch tracking
  isAutoTranslated: {
    type: Boolean,
    default: false
  },
  autoFetchedAt: {
    type: Date,
    default: null
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
});

// Index for better performance
newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ isPublished: 1 });

module.exports = mongoose.model('News', newsSchema);