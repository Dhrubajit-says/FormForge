const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['quiz', 'test', 'questionnaire'],
    default: 'quiz'
  },
  duration: {
    type: Number,
    default: 0
  },
  questions: [{
    text: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    questionType: {
      type: String,
      enum: ['text', 'single', 'multiple'],
      default: 'single'
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    options: [{
      type: String
    }],
    correctOption: {
      type: Number,
      default: 0
    },
    correctOptions: [{
      type: Number
    }]
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('template', TemplateSchema); 