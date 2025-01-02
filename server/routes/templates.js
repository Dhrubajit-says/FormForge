const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../services/imageUpload');
const Template = require('../models/Template');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @route   GET api/templates
// @desc    Get all templates for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const templates = await Template.find({ creator: req.user.id });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/templates/search
// @desc    Search templates
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.json([]);
    }

    // Search templates by title using regex for case-insensitive partial matches
    const templates = await Template.find({
      title: { $regex: searchQuery, $options: 'i' },
      creator: req.user.id // Only search user's own templates
    }).select('_id title type'); // Include necessary fields

    console.log('Search results:', templates); // Debug log
    res.json(templates);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/templates/share/:id
// @desc    Get template for sharing (public access)
// @access  Public
router.get('/share/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.json(template);
  } catch (err) {
    console.error('Error fetching shared template:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/templates/:id
// @desc    Get single template by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    // Make sure user owns template
    if (template.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(template);
  } catch (err) {
    console.error('Error fetching template:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/templates
// @desc    Create a template
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating template for user:', req.user.id);

    const newTemplate = new Template({
      ...req.body,
      creator: req.user.id
    });

    const template = await newTemplate.save();
    console.log('Template created:', template._id);

    // Update user's templates array
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { templates: template._id } },
      { new: true }
    );
    console.log(`Updated user ${updatedUser.username} templates array`);

    res.json(template);
  } catch (err) {
    console.error('Template creation error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   PUT api/templates/:id
// @desc    Update a template
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, type, duration, questions } = req.body;

  const templateFields = {
    title,
    description,
    type,
    duration,
    questions
  };

  try {
    let template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    // Make sure user owns template
    if (template.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    template = await Template.findByIdAndUpdate(
      req.params.id,
      { 
        $set: templateFields
      },
      { new: true }
    );

    res.json(template);
  } catch (err) {
    console.error('Template update error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/templates/:id
// @desc    Delete a template
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    // Make sure user owns template
    if (template.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await template.deleteOne();
    res.json({ msg: 'Template removed' });
  } catch (err) {
    console.error('Template deletion error:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Template not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add this route for image uploads
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Return the correct path that matches our static serving
    const imageUrl = `/uploads/questions/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ msg: 'Error uploading image' });
  }
});

// Update your existing routes to handle image deletion when needed
router.delete('/question-image/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads/questions', filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    
    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    console.error('Image deletion error:', err);
    res.status(500).json({ msg: 'Error deleting image' });
  }
});

module.exports = router; 