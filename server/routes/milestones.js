const express = require('express');
const router = express.Router();
const milestoneService = require('../services/milestoneService');
const { authMiddleware: auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/UserModel');

/**
 * @route   GET /api/milestones/check
 * @desc    Check for new milestones for the authenticated user
 * @access  Private
 */
router.get('/check', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('socialAccounts calendarData');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check social media milestones
    const socialMilestones = await milestoneService.checkSocialMediaMilestones(
      userId, 
      user.socialAccounts || {}
    );

    // Check calendar milestones
    const calendarMilestones = await milestoneService.checkCalendarMilestones(
      userId, 
      user.calendarData || {}
    );

    const allMilestones = [...socialMilestones, ...calendarMilestones];

    // Trigger any capsule unlocks based on milestones
    const triggeredUnlocks = await milestoneService.triggerMilestoneUnlocks(
      userId, 
      allMilestones
    );

    res.json({
      success: true,
      milestones: allMilestones,
      triggeredUnlocks: triggeredUnlocks,
      count: allMilestones.length
    });

  } catch (error) {
    console.error('Milestone check error:', error);
    res.status(500).json({ 
      message: 'Error checking milestones', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/milestones/connect-social
 * @desc    Connect social media account for milestone tracking
 * @access  Private
 */
router.post('/connect-social', [
  auth,
  body('platform').isIn(['facebook', 'instagram', 'linkedin', 'twitter']),
  body('accessToken').notEmpty(),
  body('accountData').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { platform, accessToken, accountData } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize socialAccounts if it doesn't exist
    if (!user.socialAccounts) {
      user.socialAccounts = {};
    }

    // Store social account data
    user.socialAccounts[platform] = {
      accessToken: accessToken,
      accountData: accountData,
      connectedAt: new Date(),
      lastChecked: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: `${platform} account connected successfully`,
      platform: platform
    });

  } catch (error) {
    console.error('Social connect error:', error);
    res.status(500).json({ 
      message: 'Error connecting social account', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/milestones/connect-calendar
 * @desc    Connect calendar for milestone tracking
 * @access  Private
 */
router.post('/connect-calendar', [
  auth,
  body('provider').isIn(['google', 'outlook', 'apple']),
  body('accessToken').notEmpty(),
  body('calendarData').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provider, accessToken, calendarData } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store calendar data
    user.calendarData = {
      provider: provider,
      accessToken: accessToken,
      events: calendarData.events || [],
      connectedAt: new Date(),
      lastSynced: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: `${provider} calendar connected successfully`,
      provider: provider
    });

  } catch (error) {
    console.error('Calendar connect error:', error);
    res.status(500).json({ 
      message: 'Error connecting calendar', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/milestones/history
 * @desc    Get milestone history for user
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const user = await User.findById(userId).select('milestoneHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let milestones = user.milestoneHistory || [];

    // Filter by type if specified
    if (type) {
      milestones = milestones.filter(m => m.type === type);
    }

    // Sort by date (newest first)
    milestones.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedMilestones = milestones.slice(startIndex, endIndex);

    res.json({
      success: true,
      milestones: paginatedMilestones,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(milestones.length / limit),
        count: milestones.length
      }
    });

  } catch (error) {
    console.error('Milestone history error:', error);
    res.status(500).json({ 
      message: 'Error fetching milestone history', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/milestones/manual
 * @desc    Manually add a milestone
 * @access  Private
 */
router.post('/manual', [
  auth,
  body('type').notEmpty(),
  body('event').notEmpty(),
  body('date').isISO8601(),
  body('significance').isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, event, date, significance, details } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const milestone = {
      type: type,
      event: event,
      platform: 'manual',
      date: new Date(date),
      significance: significance,
      details: details || '',
      addedAt: new Date()
    };

    // Initialize milestoneHistory if it doesn't exist
    if (!user.milestoneHistory) {
      user.milestoneHistory = [];
    }

    user.milestoneHistory.push(milestone);
    await user.save();

    // Check if this milestone should trigger any capsule unlocks
    const triggeredUnlocks = await milestoneService.triggerMilestoneUnlocks(
      userId, 
      [milestone]
    );

    res.json({
      success: true,
      message: 'Milestone added successfully',
      milestone: milestone,
      triggeredUnlocks: triggeredUnlocks
    });

  } catch (error) {
    console.error('Manual milestone error:', error);
    res.status(500).json({ 
      message: 'Error adding manual milestone', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/milestones/disconnect/:platform
 * @desc    Disconnect social media or calendar integration
 * @access  Private
 */
router.delete('/disconnect/:platform', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (platform === 'calendar') {
      user.calendarData = undefined;
    } else if (user.socialAccounts && user.socialAccounts[platform]) {
      delete user.socialAccounts[platform];
    } else {
      return res.status(404).json({ message: 'Platform not connected' });
    }

    await user.save();

    res.json({
      success: true,
      message: `${platform} disconnected successfully`
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ 
      message: 'Error disconnecting platform', 
      error: error.message 
    });
  }
});

module.exports = router;
