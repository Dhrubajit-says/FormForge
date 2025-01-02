const mongoose = require('mongoose');

const AnswerScriptSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  templateTitle: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean
  }],
  score: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  textScores: {
    type: Map,
    of: Number,
    default: {}
  },
  isDummy: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('AnswerScript', AnswerScriptSchema); 