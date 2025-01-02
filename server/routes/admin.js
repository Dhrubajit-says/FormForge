const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const Template = require('../models/Template');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/admin/templates/:id
// @desc    Get template by ID (admin access)
// @access  Admin
router.get('/templates/:id', admin, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
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

// @route   PUT api/admin/templates/:id
// @desc    Update template (admin access)
// @access  Admin
router.put('/templates/:id', admin, async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    template = await Template.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(template);
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/admin/templates/:id
// @desc    Delete template (admin access)
// @access  Admin
router.delete('/templates/:id', admin, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }

    await template.deleteOne();
    res.json({ msg: 'Template removed' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users with their templates (admin access)
// @access  Admin
router.get('/users', admin, async (req, res) => {
  try {
    // Get all users (except password) and populate their templates
    const users = await User.find()
      .select('-password')
      .lean(); // Use lean() for better performance

    // Get templates for each user
    const usersWithTemplates = await Promise.all(users.map(async (user) => {
      const templates = await Template.find({ creator: user._id })
        .select('title type questions')
        .lean();
      
      return {
        ...user,
        templates: templates.map(template => ({
          _id: template._id,
          title: template.title,
          type: template.type,
          questionCount: template.questions.length
        }))
      };
    }));

    res.json(usersWithTemplates);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user and their templates
// @access  Admin
router.delete('/users/:id', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Delete all templates created by the user
    await Template.deleteMany({ creator: user._id });

    // Delete the user
    await user.deleteOne();

    res.json({ msg: 'User and associated templates removed' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/admin/users/:id/block
// @desc    Toggle user block status
// @access  Admin
router.put('/users/:id/block', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't allow blocking admins
    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Cannot block admin users' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ msg: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error('Error toggling user block status:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Toggle user admin role
// @access  Admin
router.put('/users/:id/role', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({ msg: `User role updated to ${user.role}` });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/admin/users/:userId/templates
// @desc    Get user's templates (admin only)
// @access  Private/Admin
router.get('/users/:userId/templates', [auth, admin], async (req, res) => {
  try {
    const templates = await Template.find({ creator: req.params.userId });
    res.json(templates);
  } catch (err) {
    console.error('Error fetching user templates:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 