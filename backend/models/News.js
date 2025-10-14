const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  englishTitle: {
    type: String,
    required: true,
    trim: true
  },
  englishContent: {
    type: String,
    required: true
  },
  englishTags: [{
    type: String,
    trim: true
  }],
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('News', newsSchema);