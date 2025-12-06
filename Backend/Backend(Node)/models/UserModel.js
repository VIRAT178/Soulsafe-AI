const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    storageUsed: {
      type: Number,
      default: 0
    },
    storageLimit: {
      type: Number,
      default: 1024 * 1024 * 1024 // 1GB for free plan
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // OTP for password reset
  passwordResetOTP: String,
  passwordResetOTPExpires: Date,
  lastOTPRequestTime: Date,
  
  // Social media integrations for milestone tracking
  socialAccounts: {
    facebook: {
      accessToken: String,
      accountData: mongoose.Schema.Types.Mixed,
      connectedAt: Date,
      lastChecked: Date,
      achievedMilestones: [String]
    },
    instagram: {
      accessToken: String,
      accountData: mongoose.Schema.Types.Mixed,
      connectedAt: Date,
      lastChecked: Date,
      achievedMilestones: [String]
    },
    linkedin: {
      accessToken: String,
      accountData: mongoose.Schema.Types.Mixed,
      connectedAt: Date,
      lastChecked: Date,
      achievedMilestones: [String]
    },
    twitter: {
      accessToken: String,
      accountData: mongoose.Schema.Types.Mixed,
      connectedAt: Date,
      lastChecked: Date,
      achievedMilestones: [String]
    }
  },
  
  // Calendar integration for life events
  calendarData: {
    provider: {
      type: String,
      enum: ['google', 'outlook', 'apple']
    },
    accessToken: String,
    events: [{
      title: String,
      description: String,
      date: Date,
      type: String,
      importance: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }],
    connectedAt: Date,
    lastSynced: Date
  },
  
  // Milestone history
  milestoneHistory: [{
    type: {
      type: String,
      enum: ['social_milestone', 'career_milestone', 'education_milestone', 'relationship_milestone', 'life_milestone', 'content_milestone', 'professional_milestone']
    },
    event: String,
    platform: String,
    date: Date,
    significance: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    details: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI preferences and settings
  aiPreferences: {
    emotionAnalysis: {
      type: Boolean,
      default: true
    },
    contentRecommendations: {
      type: Boolean,
      default: true
    },
    unlockSuggestions: {
      type: Boolean,
      default: true
    },
    milestoneTracking: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Only hash if not already a bcrypt hash (starts with $2a$ or $2b$ or $2y$)
  if (/^\$2[aby]\$/.test(this.password)) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Check if user has reached storage limit
userSchema.methods.hasReachedStorageLimit = function() {
  return this.subscription.storageUsed >= this.subscription.storageLimit;
};

// Get storage usage percentage
userSchema.methods.getStorageUsagePercentage = function() {
  return (this.subscription.storageUsed / this.subscription.storageLimit) * 100;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Virtual for user's display name
userSchema.virtual('displayName').get(function() {
  return this.getFullName();
});

// Transform JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
