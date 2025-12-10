const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'mixed'],
      required: true
    },
    text: String,
    // Encryption metadata for text content (AES-GCM)
    iv: {
      type: String,
      required: false
    },
    tag: {
      type: String,
      required: false
    },
    files: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
      encrypted: {
        type: Boolean,
        default: true
      }
    }],
    aiAnalysis: {
      emotions: [{
        emotion: String,
        confidence: Number
      }],
      sentiment: {
        positive: Number,
        negative: Number,
        neutral: Number
      },
      contextualTags: [String],
      recommendedUnlockDate: Date,
    },
    metadata: {
      duration: Number, // for audio/video
      dimensions: {
        width: Number,
        height: Number
      },
      tags: [String]
    }
  },
  unlockConditions: {
    type: {
      type: String,
      enum: ['date', 'event', 'manual', 'ai_triggered'],
      required: true
    },
    unlockDate: Date,
    eventType: {
      type: String,
      enum: ['birthday', 'anniversary', 'holiday', 'custom']
    },
    eventDate: Date,
    aiTriggers: [{
      emotion: String,
      context: String,
      threshold: Number
    }],
    isUnlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: Date
  },
  recipients: [{
    email: String,
    name: String,
    relationship: String,
    accessLevel: {
      type: String,
      enum: ['view', 'download', 'share'],
      default: 'view'
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],
  aiAnalysis: {
    emotion: {
      primary: String,
      secondary: String,
      confidence: Number
    },
    sentiment: {
      score: Number, // -1 to 1
      magnitude: Number
    },
    topics: [String],
    keywords: [String],
    language: String,
    analyzedAt: Date
  },
  privacy: {
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private'
    },
    encryptionLevel: {
      type: String,
      enum: ['basic', 'neural', 'quantum', 'quantum_plus'],
      default: 'quantum'
    },
    encryptionKey: String,
    accessLog: [{
      user: mongoose.Schema.Types.ObjectId,
      action: String,
      timestamp: Date,
      ipAddress: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'unlocked', 'archived', 'deleted'],
    default: 'draft'
  },
  tags: [String],
  category: {
    type: String,
    enum: ['personal', 'family', 'work', 'creative', 'memories', 'milestone', 'other'],
    default: 'personal'
  },
  size: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  lastAccessed: Date,
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
capsuleSchema.index({ owner: 1, status: 1 });
capsuleSchema.index({ 'unlockConditions.unlockDate': 1 });
capsuleSchema.index({ 'unlockConditions.isUnlocked': 1 });
capsuleSchema.index({ category: 1 });
capsuleSchema.index({ tags: 1 });
capsuleSchema.index({ createdAt: -1 });

// Virtual for capsule age
capsuleSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for days until unlock
capsuleSchema.virtual('daysUntilUnlock').get(function() {
  if (this.unlockConditions.type === 'date' && this.unlockConditions.unlockDate) {
    const now = new Date();
    const unlockDate = new Date(this.unlockConditions.unlockDate);
    const diffTime = unlockDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to check if capsule should be unlocked
capsuleSchema.methods.shouldUnlock = function() {
  if (this.unlockConditions.isUnlocked) return false;
  
  switch (this.unlockConditions.type) {
    case 'date':
      return this.unlockConditions.unlockDate && 
             new Date() >= new Date(this.unlockConditions.unlockDate);
    case 'event':
      return this.unlockConditions.eventDate && 
             new Date() >= new Date(this.unlockConditions.eventDate);
    case 'manual':
      return false; // Manual unlock only
    case 'ai_triggered':
      // This would be determined by AI service
      return false;
    default:
      return false;
  }
};

// Method to unlock capsule
capsuleSchema.methods.unlock = function() {
  this.unlockConditions.isUnlocked = true;
  this.unlockConditions.unlockedAt = new Date();
  this.status = 'unlocked';
  return this.save();
};

// Method to increment view count
capsuleSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Method to add access log entry
capsuleSchema.methods.logAccess = function(userId, action, ipAddress) {
  this.privacy.accessLog.push({
    user: userId,
    action: action,
    timestamp: new Date(),
    ipAddress: ipAddress
  });
  return this.save();
};

// Pre-save middleware to calculate size
capsuleSchema.pre('save', function(next) {
  if (this.content.files && this.content.files.length > 0) {
    this.size = this.content.files.reduce((total, file) => total + file.size, 0);
  }
  next();
});

// Transform JSON output
capsuleSchema.methods.toJSON = function() {
  const capsuleObject = this.toObject();
  delete capsuleObject.privacy.encryptionKey;
  return capsuleObject;
};

module.exports = mongoose.model('Capsule', capsuleSchema);
