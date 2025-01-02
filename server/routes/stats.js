const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Template = require('../models/Template');
const AnswerScript = require('../models/AnswerScript');

// @route   GET api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get templates count
    const templates = await Template.find({ creator: req.user.id });
    const templatesCount = templates.length;

    // Get total questions count
    const questionsCount = templates.reduce((sum, template) => 
      sum + template.questions.length, 0);

    // Get responses count
    const responsesCount = await AnswerScript.countDocuments({ 
      templateId: { $in: templates.map(t => t._id) }
    });

    res.json({
      templatesCount,
      questionsCount,
      responsesCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 