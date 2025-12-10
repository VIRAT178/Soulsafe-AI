const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Capsule = require('../models/CapsuleModel');
const User = require('../models/UserModel');
const { sendCapsuleCreatedEmail, sendCapsuleUnlockedEmail } = require('../services/emailService');
const {
  getAllCapsules: getAllCapsulesController,
  createCapsule: createCapsuleController,
  updateCapsule: updateCapsuleController,
  deleteCapsule: deleteCapsuleController,
  getCapsuleById: getCapsuleByIdController
} = require('../controllers/businessLogic');
const { authMiddleware, validateCapsuleOwnership, logActivity } = require('../middleware/auth');
const encryptionService = require('../services/encryption');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Update capsule media (attachments)
router.put('/:id/media', authMiddleware, validateCapsuleOwnership, upload.array('attachments'), async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
    // Add new files to capsule.content.files
    if (!capsule.content.files) capsule.content.files = [];
    req.files.forEach(file => {
      capsule.content.files.push({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        // Expose as public URL instead of filesystem path
        path: `/uploads/${file.filename}`,
        encrypted: false // Set to true if encryption is applied
      });
    });
    await capsule.save();
    res.json({ message: 'Media updated', capsule });
  } catch (err) {
    console.error('Update capsule media failed', err);
    res.status(500).json({ message: 'Failed to update capsule media' });
  }
});

// Check for newly unlocked capsules
router.get('/check-unlocks', authMiddleware, async (req, res) => {
  try {
    // Find and unlock all time-based capsules that should be unlocked
    const result = await Capsule.updateMany(
      {
        owner: req.user._id,
        'unlockConditions.type': 'date',
        'unlockConditions.isUnlocked': false,
        'unlockConditions.unlockDate': { $lte: new Date() }
      },
      {
        $set: {
          'unlockConditions.isUnlocked': true,
          'unlockConditions.unlockedAt': new Date(),
          status: 'unlocked'
        }
      }
    );

    // Fetch the newly unlocked capsules
    const newlyUnlocked = await Capsule.find({
      owner: req.user._id,
      'unlockConditions.isUnlocked': true,
      'unlockConditions.unlockedAt': { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    })
    .sort({ 'unlockConditions.unlockedAt': -1 })
    .limit(10);

    // Send unlock notification emails for newly unlocked capsules (non-blocking)
    if (result.modifiedCount > 0 && newlyUnlocked.length > 0) {
      try {
        const user = await User.findById(req.user._id);
        if (user && user.preferences?.notifications?.email !== false) {
          for (const capsule of newlyUnlocked) {
            try {
              await sendCapsuleUnlockedEmail(user, capsule);
              console.log(`✅ Capsule unlocked email sent for: ${capsule.title}`);
            } catch (emailErr) {
              console.error(`⚠️ Failed to send unlock email for capsule ${capsule._id}:`, emailErr.message);
            }
          }
        }
      } catch (err) {
        console.error('⚠️ Error sending unlock notification emails:', err.message);
      }
    }

    res.json({
      success: true,
      count: result.modifiedCount,
      newlyUnlocked: newlyUnlocked
    });
  } catch (err) {
    console.error('Check unlocks failed', err);
    res.status(500).json({ message: 'Failed to check unlocks' });
  }
});

// List capsules (supports pagination & filters) - wrapper around controller
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    // Check and unlock time-based capsules before fetching
    await Capsule.updateMany(
      {
        owner: req.user._id,
        'unlockConditions.type': 'date',
        'unlockConditions.isUnlocked': false,
        'unlockConditions.unlockDate': { $lte: new Date() }
      },
      {
        $set: {
          'unlockConditions.isUnlocked': true,
          'unlockConditions.unlockedAt': new Date(),
          status: 'unlocked'
        }
      }
    );

    const capsules = await getAllCapsulesController(req.user._id, filters);
    return res.json({ capsules });
  } catch (err) {
    console.error('List capsules failed', err);
    return res.status(500).json({ message: 'Failed to list capsules' });
  }
});

// Get single capsule by ID
router.get('/:id', authMiddleware, validateCapsuleOwnership, logActivity('view'), async (req, res) => {
  try {
    // Check if this capsule should be unlocked
    if (req.capsule.unlockConditions.type === 'date' && 
        !req.capsule.unlockConditions.isUnlocked &&
        req.capsule.unlockConditions.unlockDate &&
        new Date() >= new Date(req.capsule.unlockConditions.unlockDate)) {
      
      req.capsule.unlockConditions.isUnlocked = true;
      req.capsule.unlockConditions.unlockedAt = new Date();
      req.capsule.status = 'unlocked';
      await req.capsule.save();
    }
    
    return res.json({ capsule: req.capsule });
  } catch (err) {
    console.error('Get capsule failed', err);
    return res.status(500).json({ message: 'Failed to get capsule' });
  }
});

// Create capsule
router.post('/', authMiddleware, upload.array('attachments'), [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').custom((value, { req }) => {
    // Accept non-empty string or object with non-empty text property
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object' && value !== null) {
      if (typeof value.text === 'string') return value.text.trim().length > 0;
    }
    return false;
  }),
  body('unlockConditions').custom((value, { req }) => {
    // Accept either object or stringified JSON
    if (typeof value === 'object') return true;
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  })
], async (req, res) => {
  try {
    console.log('Received capsule creation request:', {
      body: req.body,
      files: req.files,
      contentType: req.headers['content-type']
    });
    
    // Parse JSON fields if sent as strings (FormData)
    const jsonFields = ['unlockConditions', 'privacy', 'aiAnalysis'];
    jsonFields.forEach(field => {
      if (typeof req.body[field] === 'string') {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch {
          console.warn(`Failed to parse ${field} as JSON`);
        }
      }
    });
    
    // Handle tags array from FormData
    if (req.body['tags[]']) {
      req.body.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
      delete req.body['tags[]'];
    }
    
    // If files were uploaded, include them in content
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        encrypted: false
      }));
      if (typeof req.body.content === 'string') {
        // Convert content to mixed type with text and files
        req.body.content = {
          type: 'mixed',
          text: req.body.content,
          files: attachments
        };
      } else if (typeof req.body.content === 'object' && req.body.content !== null) {
        // Ensure files array exists and set sensible type
        req.body.content.files = [...(req.body.content.files || []), ...attachments];
        if (!req.body.content.type) {
          req.body.content.type = req.body.content.text ? 'mixed' : 'document';
        } else if (req.body.content.type === 'text' && attachments.length) {
          req.body.content.type = 'mixed';
        }
      } else {
        // No content provided, create files-only content
        req.body.content = {
          type: 'document',
          files: attachments
        };
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const capsule = await createCapsuleController(req.body, req.user._id);
    
    // Send capsule created notification email (non-blocking)
    try {
      const user = await User.findById(req.user._id);
      if (user && user.preferences?.notifications?.email !== false) {
        await sendCapsuleCreatedEmail(user, capsule);
        console.log(`✅ Capsule created email sent to: ${user.email}`);
      }
    } catch (emailErr) {
      console.error('⚠️ Failed to send capsule created email:', emailErr.message);
      // Don't fail the request if email fails
    }
    
    return res.status(201).json({ message: 'Capsule created', capsule });
  } catch (err) {
    console.error('Create capsule failed', err);
    return res.status(500).json({ message: 'Failed to create capsule', error: err.message });
  }
});

// Update capsule
router.put('/:id', authMiddleware, validateCapsuleOwnership, async (req, res) => {
  try {
    const updated = await updateCapsuleController(req.params.id, req.body, req.user._id);
    return res.json({ message: 'Updated', capsule: updated });
  } catch (err) {
    console.error('Update capsule failed', err);
    return res.status(500).json({ message: 'Failed to update capsule' });
  }
});

// Delete capsule
router.delete('/:id', authMiddleware, validateCapsuleOwnership, async (req, res) => {
  try {
    await deleteCapsuleController(req.params.id, req.user._id);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete capsule failed', err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

// Update capsule
router.put('/:id', authMiddleware, validateCapsuleOwnership, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };
    
    // Don't allow updating certain fields
    delete updateData.owner;
    delete updateData.createdAt;
    delete updateData.privacy.encryptionKey;

    const updatedCapsule = await Capsule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Capsule updated successfully',
      capsule: updatedCapsule
    });
  } catch (error) {
    console.error('Update capsule error:', error);
    res.status(500).json({ message: 'Server error updating capsule' });
  }
});

// Delete capsule
router.delete('/:id', authMiddleware, validateCapsuleOwnership, async (req, res) => {
  try {
    await Capsule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Capsule deleted successfully' });
  } catch (error) {
    console.error('Delete capsule error:', error);
    res.status(500).json({ message: 'Server error deleting capsule' });
  }
});

// Unlock capsule manually
router.post('/:id/unlock', authMiddleware, validateCapsuleOwnership, logActivity('unlock'), async (req, res) => {
  try {
    if (req.capsule.unlockConditions.type !== 'manual') {
      return res.status(400).json({ 
        message: 'This capsule cannot be unlocked manually' 
      });
    }

    await req.capsule.unlock();
    res.json({ 
      message: 'Capsule unlocked successfully',
      capsule: req.capsule
    });
  } catch (error) {
    console.error('Unlock capsule error:', error);
    res.status(500).json({ message: 'Server error unlocking capsule' });
  }
});

// Get capsule content (decrypted)
router.get('/:id/content', authMiddleware, validateCapsuleOwnership, logActivity('content_access'), async (req, res) => {
  try {
    if (!req.capsule.unlockConditions.isUnlocked) {
      return res.status(403).json({ 
        message: 'Capsule is not unlocked yet' 
      });
    }

    let decryptedContent = { ...req.capsule.content.toObject() };
    
    console.log('Content structure:', {
      hasText: !!decryptedContent.text,
      hasIv: !!decryptedContent.iv,
      hasTag: !!decryptedContent.tag,
      hasEncryptionKey: !!req.capsule.privacy.encryptionKey,
      textPreview: decryptedContent.text ? decryptedContent.text.substring(0, 50) : 'none'
    });
    
    // Decrypt text content if present and encrypted
    if (decryptedContent.text && req.capsule.privacy.encryptionKey) {
      // Check if we have the necessary decryption data (iv and tag)
      if (decryptedContent.iv && decryptedContent.tag) {
        const encryptionKey = Buffer.from(req.capsule.privacy.encryptionKey, 'hex');
        const encryptedData = {
          encrypted: decryptedContent.text,
          iv: decryptedContent.iv,
          tag: decryptedContent.tag
        };
        
        try {
          decryptedContent.text = encryptionService.decryptText(encryptedData, encryptionKey);
          // Remove encryption metadata from response
          delete decryptedContent.iv;
          delete decryptedContent.tag;
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          return res.status(500).json({ 
            message: 'Error decrypting content',
            error: decryptError.message 
          });
        }
      } else {
        // Content is not encrypted or missing encryption metadata
        console.log('Content not encrypted or missing iv/tag fields - returning as is');
      }
    }

    res.json({ content: decryptedContent });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ 
      message: 'Server error fetching content',
      error: error.message 
    });
  }
});

// Add recipient to capsule
router.post('/:id/recipients', authMiddleware, validateCapsuleOwnership, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship must be less than 50 characters'),
  body('accessLevel')
    .optional()
    .isIn(['view', 'download', 'share'])
    .withMessage('Invalid access level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, name, relationship, accessLevel = 'view' } = req.body;

    // Check if recipient already exists
    const existingRecipient = req.capsule.recipients.find(r => r.email === email);
    if (existingRecipient) {
      return res.status(400).json({ message: 'Recipient already added' });
    }

    req.capsule.recipients.push({
      email,
      name,
      relationship,
      accessLevel
    });

    await req.capsule.save();

    res.json({
      message: 'Recipient added successfully',
      recipients: req.capsule.recipients
    });
  } catch (error) {
    console.error('Add recipient error:', error);
    res.status(500).json({ message: 'Server error adding recipient' });
  }
});

// Analyze capsule content with AI
router.post('/:id/analyze', authMiddleware, validateCapsuleOwnership, async (req, res) => {
  try {
    const capsule = req.capsule;
    const axios = require('axios');
    const config = require('../config');
    
    // Extract text content for analysis
    let textContent = '';
    if (typeof capsule.content.text === 'string') {
      textContent = capsule.content.text;
    } else if (capsule.content.description) {
      textContent = capsule.content.description;
    } else if (capsule.title) {
      textContent = capsule.title;
    }
    
    // Decrypt if necessary
    if (textContent && capsule.privacy.encryptionKey) {
      try {
        const encryptionService = require('../services/encryption');
        const encryptionKey = Buffer.from(capsule.privacy.encryptionKey, 'hex');
        const encryptedData = {
          encrypted: textContent,
          iv: capsule.content.iv,
          tag: capsule.content.tag
        };
        textContent = encryptionService.decryptText(encryptedData, encryptionKey);
      } catch (decryptError) {
        console.error('Decryption error during analysis:', decryptError);
        // Continue with encrypted text if decryption fails
      }
    }
    
    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ 
        message: 'No text content available for analysis' 
      });
    }
    
    console.log('[Capsule Analyze] Analyzing capsule:', capsule._id);
    console.log('[Capsule Analyze] Text length:', textContent.length);
    
    // Call Python AI service for analysis
    try {
      const analysisResponse = await axios.post(
        `${config.pythonService}/analyze/content`,
        { content: textContent, type: 'text' },
        { timeout: 10000 }
      );
      
      console.log('[Capsule Analyze] Analysis received:', analysisResponse.data);
      
      // Update capsule with AI analysis
      const analysis = analysisResponse.data.analysis || analysisResponse.data;
      
      // Map the emotion data to the expected format
      const emotionData = analysis.emotion || {};
      const mappedEmotion = {
        primary: emotionData.primary_emotion || emotionData.dominant_emotion || 'neutral',
        secondary: emotionData.secondary_emotion || 'neutral',
        confidence: emotionData.confidence || 0.5,
        emotions: emotionData.emotions || {},
        sentiment: emotionData.sentiment || analysis.sentiment || {}
      };
      
      capsule.aiAnalysis = {
        emotion: mappedEmotion,
        sentiment: analysis.sentiment || {},
        topics: analysis.topics || [],
        keywords: analysis.keywords || [],
        themes: analysis.themes || [],
        classification: analysis.classification || {},
        analysisDate: new Date()
      };
      
      await capsule.save();
      
      res.json({
        success: true,
        message: 'Capsule analyzed successfully',
        analysis: capsule.aiAnalysis
      });
      
    } catch (aiError) {
      console.error('[Capsule Analyze] AI service error:', aiError.message);
      
      if (aiError.code === 'ECONNREFUSED' || aiError.code === 'ETIMEDOUT') {
        return res.status(503).json({ 
          error: 'AI analysis service temporarily unavailable',
          details: 'Python AI service is not running. Please start it on port 5001.'
        });
      }
      
      throw aiError;
    }
    
  } catch (error) {
    console.error('Analyze capsule error:', error);
    res.status(500).json({ 
      message: 'Server error analyzing capsule',
      error: error.message 
    });
  }
});

// Batch analyze all user capsules
router.post('/batch/analyze-all', authMiddleware, async (req, res) => {
  try {
    const axios = require('axios');
    const config = require('../config');
    const encryptionService = require('../services/encryption');
    
    // Get all user's capsules
    const capsules = await Capsule.find({ owner: req.user._id });
    
    if (capsules.length === 0) {
      return res.json({
        success: true,
        message: 'No capsules to analyze',
        analyzed: 0,
        skipped: 0
      });
    }
    
    console.log(`[Batch Analyze] Starting analysis for ${capsules.length} capsules`);
    
    let analyzed = 0;
    let skipped = 0;
    const errors = [];
    
    for (const capsule of capsules) {
      try {
        // Skip if already analyzed recently (within 24 hours)
        if (capsule.aiAnalysis?.analysisDate) {
          const hoursSinceAnalysis = (Date.now() - new Date(capsule.aiAnalysis.analysisDate).getTime()) / (1000 * 60 * 60);
          if (hoursSinceAnalysis < 24) {
            skipped++;
            continue;
          }
        }
        
        // Extract text content
        let textContent = '';
        if (typeof capsule.content.text === 'string') {
          textContent = capsule.content.text;
        } else if (capsule.content.description) {
          textContent = capsule.content.description;
        } else if (capsule.title) {
          textContent = capsule.title;
        }
        
        // Decrypt if necessary
        if (textContent && capsule.privacy.encryptionKey) {
          try {
            const encryptionKey = Buffer.from(capsule.privacy.encryptionKey, 'hex');
            const encryptedData = {
              encrypted: textContent,
              iv: capsule.content.iv,
              tag: capsule.content.tag
            };
            textContent = encryptionService.decryptText(encryptedData, encryptionKey);
          } catch (decryptError) {
            console.error(`[Batch Analyze] Decryption error for capsule ${capsule._id}:`, decryptError.message);
          }
        }
        
        if (!textContent || textContent.trim().length === 0) {
          skipped++;
          continue;
        }
        
        // Call Python AI service
        const analysisResponse = await axios.post(
          `${config.pythonService}/analyze/content`,
          { content: textContent, type: 'text' },
          { timeout: 10000 }
        );
        
        const analysis = analysisResponse.data.analysis || analysisResponse.data;
        
        // Map the emotion data to the expected format
        const emotionData = analysis.emotion || {};
        const mappedEmotion = {
          primary: emotionData.primary_emotion || emotionData.dominant_emotion || 'neutral',
          secondary: emotionData.secondary_emotion || 'neutral',
          confidence: emotionData.confidence || 0.5,
          emotions: emotionData.emotions || {},
          sentiment: emotionData.sentiment || analysis.sentiment || {}
        };
        
        // Update capsule
        capsule.aiAnalysis = {
          emotion: mappedEmotion,
          sentiment: analysis.sentiment || {},
          topics: analysis.topics || [],
          keywords: analysis.keywords || [],
          themes: analysis.themes || [],
          classification: analysis.classification || {},
          analysisDate: new Date()
        };
        
        await capsule.save();
        analyzed++;
        
        console.log(`[Batch Analyze] Analyzed capsule ${capsule._id}`);
        
      } catch (error) {
        console.error(`[Batch Analyze] Error analyzing capsule ${capsule._id}:`, error.message);
        errors.push({
          capsuleId: capsule._id,
          error: error.message
        });
        skipped++;
      }
    }
    
    res.json({
      success: true,
      message: `Batch analysis complete: ${analyzed} analyzed, ${skipped} skipped`,
      analyzed,
      skipped,
      total: capsules.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Batch analyze error:', error);
    res.status(500).json({ 
      message: 'Server error during batch analysis',
      error: error.message 
    });
  }
});

// Get capsule analytics
router.get('/:id/analytics', authMiddleware, validateCapsuleOwnership, async (req, res) => {
  try {
    const analytics = {
      views: req.capsule.views,
      lastAccessed: req.capsule.lastAccessed,
      age: req.capsule.age,
      daysUntilUnlock: req.capsule.daysUntilUnlock,
      aiAnalysis: req.capsule.aiAnalysis,
      accessLog: req.capsule.privacy.accessLog.slice(-10) // Last 10 accesses
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Manual trigger for testing reminder emails (admin/dev only)
router.post('/test-reminders', authMiddleware, async (req, res) => {
  try {
    const { manualTriggerReminders } = require('../services/capsuleScheduler');
    const result = await manualTriggerReminders();
    res.json({
      success: true,
      message: 'Reminder check completed',
      result
    });
  } catch (err) {
    console.error('Manual reminder trigger failed:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to trigger reminders',
      error: err.message 
    });
  }
});

module.exports = router;
