const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const { authMiddleware } = require('../middleware/auth');
const { sendWelcomeEmail, sendOTPEmail, sendPasswordResetSuccessEmail, sendProfileUpdateSuccessEmail } = require('../services/emailService');
const { generateOTP, generateOTPExpiry, verifyOTP, checkRateLimit } = require('../services/otpService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Multer storage config for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = 'profile_' + Date.now() + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
const IS_DEV = process.env.NODE_ENV !== 'production' || process.env.AUTH_DEBUG === '1';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'soulsafe-super-secret-jwt-key-2023';

// Register new user
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .customSanitizer(v => typeof v === 'string' ? v.trim() : v)
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

  const { username, email, password, firstName, lastName } = req.body;
  console.log('REGISTER DEBUG:', { email, username, passwordLength: password?.length });

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user in MongoDB (let Mongoose pre-save hook hash password)
    const newUser = await User.create({
      username,
      email,
      password, // plain password, will be hashed by pre-save hook
      firstName,
      lastName,
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true
        }
      }
    });

    // Verify that the stored hash matches the provided password right after save
    try {
      const verifyAfterSave = await bcrypt.compare(password, newUser.password);
      console.log('REGISTER DEBUG: bcrypt.compare after save =', verifyAfterSave);
    } catch (e) {
      console.log('REGISTER DEBUG: bcrypt compare threw error:', e?.message);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    }).catch(error => {
      // Log error but don't fail registration if email fails
      console.error('Failed to send welcome email:', error.message);
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
          profilePicture: newUser.profilePicture,
        preferences: newUser.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .customSanitizer(v => typeof v === 'string' ? v.trim() : v)
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }


    const { email, password } = req.body;
    console.log('LOGIN DEBUG:', { email, password });

    // Find user by email in MongoDB
    const user = await User.findOne({ email });
    console.log('LOGIN DEBUG: user found?', !!user, user ? { _id: user._id, email: user.email, password: user.password } : null);
    if (!user) {
      console.log('LOGIN DEBUG: No user found for email');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('LOGIN DEBUG: bcrypt.compare result:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('LOGIN DEBUG: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
          profilePicture: user.profilePicture,
        preferences: user.preferences,
        subscription: user.subscription || {
          plan: 'free',
          storageUsed: 0,
          storageLimit: 1024 * 1024 * 1024
        },
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        subscription: user.subscription || {
          plan: 'free',
          storageUsed: 0,
          storageLimit: 1024 * 1024 * 1024
        },
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { firstName, lastName, preferences } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    // Handle profile picture upload with Cloudinary
    if (req.file) {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pics',
          public_id: `profile_${user._id}_${Date.now()}`,
          overwrite: true,
        });
        user.profilePicture = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ message: 'Profile picture upload failed' });
      }
    }
    
    await user.save();

    // Build list of changed fields to include in the notification email
    const changedFields = [];
    if (firstName) changedFields.push('firstName');
    if (lastName) changedFields.push('lastName');
    if (preferences) changedFields.push('preferences');
    if (req.file) changedFields.push('profilePicture');

    // Send profile update notification email (non-blocking)
    try {
      await sendProfileUpdateSuccessEmail(user, changedFields);
      console.log(`✅ Profile update email sent to: ${user.email}`);
    } catch (emailErr) {
      console.error('⚠️ Failed to send profile update email:', emailErr.message);
      // Do not fail the request if email sending fails
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Debug endpoint to view all registered users (for development only)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      message: 'Registered users from MongoDB',
      storage: 'MongoDB Atlas (Cloud Database)',
      persistent: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`,
        preferences: u.preferences,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users from database' });
  }
});

// ===================================================
// FORGOT PASSWORD & OTP ENDPOINTS
// ===================================================

/**
 * Request password reset - Send OTP to email
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        message: 'If an account with that email exists, an OTP has been sent.'
      });
    }

    // Check rate limiting (prevent OTP spam)
    const rateCheck = checkRateLimit(user.lastOTPRequestTime, 1);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        message: rateCheck.message,
        remainingSeconds: rateCheck.remainingSeconds
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Save OTP to database
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpiry;
    user.lastOTPRequestTime = new Date();
    await user.save();

    // Send OTP email
    await sendOTPEmail({
      email: user.email,
      firstName: user.firstName,
      otp: otp
    });

    console.log(`✅ Password reset OTP sent to: ${email}`);

    res.status(200).json({
      message: 'OTP has been sent to your email address',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Failed to process password reset request. Please try again.' 
    });
  }
});

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify OTP
    const verification = verifyOTP(
      otp,
      user.passwordResetOTP,
      user.passwordResetOTPExpires
    );

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message
      });
    }

    // Generate a temporary reset token for the next step
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' } // Token valid for 15 minutes
    );

    console.log(`✅ OTP verified for: ${email}`);

    res.status(200).json({
      message: 'OTP verified successfully',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
});

/**
 * Reset password with verified OTP
 * POST /api/auth/reset-password
 */
router.post('/reset-password', [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        message: 'Invalid or expired reset token'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.lastOTPRequestTime = undefined;
    await user.save();

    console.log(`✅ Password reset successfully for: ${user.email}`);

    // Send password reset success notification email
    try {
      await sendPasswordResetSuccessEmail(user);
      console.log(`✅ Password reset success email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send password reset success email:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Failed to reset password. Please try again.' 
    });
  }
});

module.exports = router;

// Development-only diagnostics endpoints
if (IS_DEV) {
  // Verify a plaintext password against stored hash for a user
  router.post('/dev/verify-password', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const match = await bcrypt.compare(password, user.password);
      return res.json({
        email,
        userId: user._id,
        match,
        hashPrefix: String(user.password).slice(0, 7),
        hashLen: String(user.password).length,
      });
    } catch (e) {
      console.error('DEV verify-password error:', e);
      return res.status(500).json({ message: 'internal error' });
    }
  });
}