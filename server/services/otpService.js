const crypto = require('crypto');

/**
 * OTP Service for Password Reset
 * Handles OTP generation, validation, and verification
 */

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6-digit OTP code
 */
const generateOTP = () => {
  // Generate 6-digit random number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiry time (10 minutes from now)
 * @returns {Date} - Expiry timestamp
 */
const generateOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Verify if OTP is valid
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiryTime - OTP expiry time
 * @returns {Object} - Validation result with success flag and message
 */
const verifyOTP = (providedOTP, storedOTP, expiryTime) => {
  // Check if OTP exists
  if (!storedOTP) {
    return {
      success: false,
      message: 'No OTP found. Please request a new one.'
    };
  }

  // Check if OTP has expired
  if (new Date() > expiryTime) {
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  // Check if OTP matches
  if (providedOTP !== storedOTP) {
    return {
      success: false,
      message: 'Invalid OTP. Please try again.'
    };
  }

  return {
    success: true,
    message: 'OTP verified successfully.'
  };
};

/**
 * Generate a secure reset token (fallback for email links)
 * @returns {string} - Secure random token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash OTP for secure storage (optional, for extra security)
 * @param {string} otp - Plain OTP
 * @returns {string} - Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Check if OTP request is rate limited
 * @param {Date} lastOTPRequestTime - Last time OTP was requested
 * @param {number} cooldownMinutes - Cooldown period in minutes (default: 1)
 * @returns {Object} - Rate limit status
 */
const checkRateLimit = (lastOTPRequestTime, cooldownMinutes = 1) => {
  if (!lastOTPRequestTime) {
    return { allowed: true };
  }

  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeSinceLastRequest = Date.now() - new Date(lastOTPRequestTime).getTime();

  if (timeSinceLastRequest < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000);
    return {
      allowed: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      remainingSeconds
    };
  }

  return { allowed: true };
};

module.exports = {
  generateOTP,
  generateOTPExpiry,
  verifyOTP,
  generateResetToken,
  hashOTP,
  checkRateLimit
};
