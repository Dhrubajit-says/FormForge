const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AnswerScript = require('../models/AnswerScript');
const Template = require('../models/Template');

// @route   GET api/answer-scripts
// @desc    Get all answer scripts for user's templates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // First get all templates created by the user
    const templates = await Template.find({ creator: req.user.id });
    const templateIds = templates.map(template => template._id);

    // Then get all answer scripts for these templates
    const answerScripts = await AnswerScript.find({
      templateId: { $in: templateIds }
    }).sort({ submittedAt: -1 });

    res.json(answerScripts);
  } catch (err) {
    console.error('Error fetching answer scripts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/answer-scripts/:id
// @desc    Get single answer script
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const answerScript = await AnswerScript.findById(req.params.id);
    
    if (!answerScript) {
      return res.status(404).json({ msg: 'Answer script not found' });
    }

    // Verify user owns the template
    const template = await Template.findById(answerScript.templateId);
    if (template.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(answerScript);
  } catch (err) {
    console.error('Error fetching answer script:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/answer-scripts
// @desc    Submit a new answer script
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      templateId,
      templateTitle,
      studentName,
      studentId,
      answers,
      score,
      totalQuestions,
      isDummy
    } = req.body;

    const answerScript = new AnswerScript({
      templateId,
      templateTitle,
      studentName,
      studentId,
      answers,
      score,
      totalQuestions,
      isDummy: isDummy || false
    });

    await answerScript.save();
    res.json(answerScript);
  } catch (err) {
    console.error('Error submitting answer script:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/answer-scripts/:id
// @desc    Delete an answer script
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Attempting to delete answer script:', req.params.id);
    
    const answerScript = await AnswerScript.findById(req.params.id);
    
    if (!answerScript) {
      console.log('Answer script not found');
      return res.status(404).json({ msg: 'Answer script not found' });
    }

    // Verify user owns the template
    const template = await Template.findById(answerScript.templateId);
    if (!template) {
      console.log('Template not found');
      return res.status(404).json({ msg: 'Template not found' });
    }

    if (template.creator.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await AnswerScript.findByIdAndDelete(req.params.id);
    console.log('Answer script deleted successfully');
    res.json({ msg: 'Answer script removed' });
  } catch (err) {
    console.error('Error deleting answer script:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/answer-scripts/:id
// @desc    Update answer script score
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { score, textScores } = req.body;
    const answerScript = await AnswerScript.findById(req.params.id);

    if (!answerScript) {
      return res.status(404).json({ msg: 'Answer script not found' });
    }

    // Verify the score format (should be "X/Y")
    if (!score.includes('/')) {
      return res.status(400).json({ msg: 'Invalid score format' });
    }

    // Update the score and textScores
    answerScript.score = score;
    if (textScores) {
      answerScript.textScores = textScores;
    }
    
    const updatedScript = await answerScript.save();

    res.json({ 
      msg: 'Score updated successfully', 
      answerScript: updatedScript 
    });
  } catch (err) {
    console.error('Error updating answer script:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 