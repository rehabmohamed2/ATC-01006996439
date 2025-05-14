const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Music',
      'Sports',
      'Arts & Theater',
      'Food & Drink',
      'Business',
      'Technology',
      'Health & Wellness',
      'Family',
    ]
  },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fs.files'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema); 