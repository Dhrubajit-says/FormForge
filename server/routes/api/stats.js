const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Template = require('../../models/Template');
const AnswerScript = require('../../models/AnswerScript');

// @route   GET api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get templates count
    const templates = await Template.find({ creator: req.user.id });
    
    res.json({
      totalTemplates: templates.length,
      totalAnswerScripts: await AnswerScript.countDocuments({ 
        templateId: { $in: templates.map(t => t._id) }
      }),
      sharedTemplates: await Template.countDocuments({ 
        creator: req.user.id, 
        isPublic: true 
      })
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 