const nodemailer = require('nodemailer');

/**
 * Email Service for SoulSafe AI
 * Handles all email communications using Mailtrap
 */

// Create transporter using Gmail or Mailtrap credentials
const createTransporter = () => {
  const isGmail = process.env.MAILTRAP_HOST === 'smtp.gmail.com';
  
  const config = {
    host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_PORT) || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  };

  // Add secure flag for Gmail
  if (isGmail) {
    config.secure = false; // Use STARTTLS for port 587
    config.requireTLS = true;
  }

  return nodemailer.createTransport(config);
};

/**
 * Send welcome email to new users
 * @param {Object} user - User object containing email, firstName, lastName
 * @returns {Promise<Object>} - Email send result
 */
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const { email, firstName, lastName } = user;
    const fullName = `${firstName} ${lastName}`.trim();

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '🎉 Welcome to SoulSafe AI - Your Digital Time Capsule Awaits!',
      html: getWelcomeEmailTemplate(fullName, firstName),
      text: getWelcomeEmailTextVersion(fullName, firstName)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    console.error('Email config:', {
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      user: process.env.MAILTRAP_USER,
      hasPass: !!process.env.MAILTRAP_PASS
    });
    throw error;
  }
};

/**
 * HTML Email Template for Welcome Email
 */
const getWelcomeEmailTemplate = (fullName, firstName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SoulSafe AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f1419;
      color: #e4e6eb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #ffffff;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      color: #f0f0f0;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #ffffff;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #b8b9bc;
      margin-bottom: 25px;
    }
    .features {
      background-color: #1a1f2e;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
      border-left: 4px solid #667eea;
    }
    .feature-item {
      margin-bottom: 20px;
      display: flex;
      align-items: start;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .feature-text {
      flex: 1;
    }
    .feature-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 5px;
    }
    .feature-description {
      font-size: 14px;
      color: #b8b9bc;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    .footer {
      background-color: #0a0d12;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #8b8d91;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎊 Welcome to SoulSafe AI</h1>
      <p>Your Digital Time Capsule Journey Begins Here</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hello ${firstName}! 👋
      </div>

      <div class="message">
        We're thrilled to have you join the <strong>SoulSafe AI</strong> community! Your journey into preserving precious memories with AI-powered security and intelligence starts now.
      </div>

      <div class="message">
        SoulSafe AI is more than just a digital storage platform—it's a sophisticated time capsule that uses artificial intelligence to understand, protect, and preserve your most cherished moments for the future.
      </div>

      <!-- Features Section -->
      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">🔐</div>
          <div class="feature-text">
            <div class="feature-title">End-to-End Encryption</div>
            <div class="feature-description">
              Your memories are protected with military-grade AES-256 encryption. Only you can access your capsules.
            </div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🤖</div>
          <div class="feature-text">
            <div class="feature-title">AI-Powered Insights</div>
            <div class="feature-description">
              Our AI analyzes emotions and context in your memories, providing intelligent recommendations and insights.
            </div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">⏰</div>
          <div class="feature-text">
            <div class="feature-title">Smart Scheduling</div>
            <div class="feature-description">
              Set precise unlock dates or life event triggers. Your memories will be delivered exactly when you want them.
            </div>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📱</div>
          <div class="feature-text">
            <div class="feature-title">Multi-Media Support</div>
            <div class="feature-description">
              Store text, images, videos, audio recordings, and documents—all in one secure place.
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="message">
        <strong>Ready to create your first time capsule?</strong> Start preserving your precious memories and let our AI help you rediscover them at the perfect moment.
      </div>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
          Get Started Now →
        </a>
      </div>

      <div class="message" style="margin-top: 30px; font-size: 14px;">
        Need help getting started? Check out our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #667eea;">Help Center</a> or reply to this email with any questions.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>SoulSafe AI</strong> - Preserving Memories with Intelligence
      </p>
      <p style="margin: 5px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms">Terms of Service</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        © 2025 SoulSafe AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Plain Text Version of Welcome Email
 */
const getWelcomeEmailTextVersion = (fullName, firstName) => {
  return `
🎊 Welcome to SoulSafe AI

Hello ${firstName}!

We're thrilled to have you join the SoulSafe AI community! Your journey into preserving precious memories with AI-powered security and intelligence starts now.

SoulSafe AI is more than just a digital storage platform—it's a sophisticated time capsule that uses artificial intelligence to understand, protect, and preserve your most cherished moments for the future.

What You Can Do with SoulSafe AI:

🔐 End-to-End Encryption
Your memories are protected with military-grade AES-256 encryption. Only you can access your capsules.

🤖 AI-Powered Insights
Our AI analyzes emotions and context in your memories, providing intelligent recommendations and insights.

⏰ Smart Scheduling
Set precise unlock dates or life event triggers. Your memories will be delivered exactly when you want them.

📱 Multi-Media Support
Store text, images, videos, audio recordings, and documents—all in one secure place.

Ready to create your first time capsule?
Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

Need help getting started? Check out our Help Center or reply to this email with any questions.

---
SoulSafe AI - Preserving Memories with Intelligence
© 2025 SoulSafe AI. All rights reserved.

Privacy Policy: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy
Terms of Service: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms
Support: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/support
  `.trim();
};

/**
 * Send OTP email for password reset
 * @param {Object} user - User object containing email, firstName, otp
 * @returns {Promise<Object>} - Email send result
 */
const sendOTPEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const { email, firstName, otp } = user;

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '🔐 Your Password Reset OTP - SoulSafe AI',
      html: getOTPEmailTemplate(firstName, otp),
      text: getOTPEmailTextVersion(firstName, otp)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw error;
  }
};

/**
 * HTML Email Template for OTP Email
 */
const getOTPEmailTemplate = (firstName, otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f1419;
      color: #e4e6eb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #ffffff;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      color: #f0f0f0;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #ffffff;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #b8b9bc;
      margin-bottom: 25px;
    }
    .otp-container {
      background-color: #1a1f2e;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
      border: 2px solid #667eea;
    }
    .otp-label {
      font-size: 14px;
      color: #b8b9bc;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .otp-code {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 10px 0;
    }
    .otp-expiry {
      font-size: 14px;
      color: #ff6b6b;
      margin-top: 15px;
      font-weight: 600;
    }
    .warning-box {
      background-color: #2a1f1f;
      border-left: 4px solid #ff6b6b;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .warning-title {
      font-size: 16px;
      font-weight: 600;
      color: #ff6b6b;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    .warning-text {
      font-size: 14px;
      color: #b8b9bc;
      line-height: 1.6;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 30px 0;
    }
    .footer {
      background-color: #0a0d12;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #8b8d91;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🔐 Password Reset</h1>
      <p>Secure Your Account</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hello ${firstName}! 👋
      </div>

      <div class="message">
        We received a request to reset your password for your <strong>SoulSafe AI</strong> account. Use the verification code below to complete the password reset process.
      </div>

      <!-- OTP Display -->
      <div class="otp-container">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏰ Expires in 10 minutes</div>
      </div>

      <div class="message">
        Enter this code on the password reset page to verify your identity and set a new password.
      </div>

      <!-- Security Warning -->
      <div class="warning-box">
        <div class="warning-title">⚠️ Security Notice</div>
        <div class="warning-text">
          <strong>Never share this code with anyone.</strong> SoulSafe AI staff will never ask for your verification code. If you didn't request this password reset, please ignore this email and ensure your account is secure.
        </div>
      </div>

      <div class="divider"></div>

      <div class="message" style="font-size: 14px;">
        If the code has expired, you can request a new one from the password reset page. For additional security assistance, visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #667eea;">Help Center</a>.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>SoulSafe AI</strong> - Preserving Memories with Intelligence
      </p>
      <p style="margin: 5px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms">Terms of Service</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        © 2025 SoulSafe AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Plain Text Version of OTP Email
 */
const getOTPEmailTextVersion = (firstName, otp) => {
  return `
🔐 Password Reset - SoulSafe AI

Hello ${firstName}!

We received a request to reset your password for your SoulSafe AI account. Use the verification code below to complete the password reset process.

YOUR VERIFICATION CODE: ${otp}

⏰ This code expires in 10 minutes.

Enter this code on the password reset page to verify your identity and set a new password.

⚠️ SECURITY NOTICE
Never share this code with anyone. SoulSafe AI staff will never ask for your verification code. If you didn't request this password reset, please ignore this email and ensure your account is secure.

If the code has expired, you can request a new one from the password reset page.

Need help? Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/help

---
SoulSafe AI - Preserving Memories with Intelligence
© 2025 SoulSafe AI. All rights reserved.

Privacy Policy: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy
Terms of Service: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms
Support: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/support
  `.trim();
};

/**
 * Send password reset success notification email
 * @param {Object} user - User object containing email, firstName
 * @returns {Promise<Object>} - Email send result
 */
const sendPasswordResetSuccessEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const { email, firstName } = user;

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '✅ Your Password Has Been Reset - SoulSafe AI',
      html: getPasswordResetSuccessTemplate(firstName),
      text: getPasswordResetSuccessTextVersion(firstName)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset success email sent to:', email);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
  } catch (error) {
    console.error('❌ Error sending password reset success email:', error.message);
    throw error;
  }
};

/**
 * HTML Email Template for Password Reset Success
 */
const getPasswordResetSuccessTemplate = (firstName) => {
  const resetDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f1419;
      color: #e4e6eb;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #ffffff;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      color: #f0f0f0;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #ffffff;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #b8b9bc;
      margin-bottom: 25px;
    }
    .success-box {
      background-color: #064e3b;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .success-title {
      font-size: 20px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 10px;
    }
    .success-text {
      font-size: 14px;
      color: #d1d5db;
      line-height: 1.6;
    }
    .info-box {
      background-color: #1a1f2e;
      border-left: 4px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #2c3043;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-size: 14px;
      color: #8b8d91;
      font-weight: 500;
    }
    .info-value {
      font-size: 14px;
      color: #ffffff;
      font-weight: 600;
    }
    .security-tips {
      background-color: #2a1f1f;
      border-left: 4px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .security-title {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .security-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .security-list li {
      font-size: 14px;
      color: #b8b9bc;
      line-height: 1.8;
      padding-left: 25px;
      position: relative;
      margin-bottom: 10px;
    }
    .security-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .warning-box {
      background-color: #2a1f1f;
      border-left: 4px solid #ff6b6b;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .warning-title {
      font-size: 16px;
      font-weight: 600;
      color: #ff6b6b;
      margin-bottom: 10px;
    }
    .warning-text {
      font-size: 14px;
      color: #b8b9bc;
      line-height: 1.6;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 30px 0;
    }
    .footer {
      background-color: #0a0d12;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #8b8d91;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Password Reset Successful</h1>
      <p>Your Account is Secure</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hello ${firstName}! 👋
      </div>

      <div class="message">
        Your password has been successfully reset for your <strong>SoulSafe AI</strong> account. You can now sign in using your new password.
      </div>

      <!-- Success Box -->
      <div class="success-box">
        <div class="success-icon">🎉</div>
        <div class="success-title">Password Changed Successfully!</div>
        <div class="success-text">
          Your password has been updated and your account is secure. You can now use your new password to access your time capsules.
        </div>
      </div>

      <!-- Reset Details -->
      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Reset Date & Time</span>
          <span class="info-value">${resetDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Account Status</span>
          <span class="info-value" style="color: #10b981;">Active & Secure</span>
        </div>
      </div>

      <!-- Security Tips -->
      <div class="security-tips">
        <div class="security-title">🛡️ Security Tips</div>
        <ul class="security-list">
          <li>Use a unique password that you don't use anywhere else</li>
          <li>Enable two-factor authentication for extra security</li>
          <li>Never share your password with anyone</li>
          <li>Update your password regularly (every 3-6 months)</li>
          <li>Use a password manager to store your credentials securely</li>
        </ul>
      </div>

      <div class="message">
        Ready to access your memories? Sign in now with your new password.
      </div>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button">
          Sign In to Your Account →
        </a>
      </div>

      <div class="divider"></div>

      <!-- Warning Box -->
      <div class="warning-box">
        <div class="warning-title">⚠️ Didn't Reset Your Password?</div>
        <div class="warning-text">
          If you didn't request this password reset, your account may be compromised. Please contact our support team immediately at <a href="mailto:support@soulsafe.ai" style="color: #667eea;">support@soulsafe.ai</a> or secure your account by changing your password again.
        </div>
      </div>

      <div class="message" style="margin-top: 30px; font-size: 14px;">
        Need help? Visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #667eea;">Help Center</a> or contact support.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 10px;">
        <strong>SoulSafe AI</strong> - Preserving Memories with Intelligence
      </p>
      <p style="margin: 5px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy">Privacy Policy</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms">Terms of Service</a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support">Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        © 2025 SoulSafe AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Plain Text Version of Password Reset Success Email
 */
const getPasswordResetSuccessTextVersion = (firstName) => {
  const resetDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
✅ Password Reset Successful - SoulSafe AI

Hello ${firstName}!

Your password has been successfully reset for your SoulSafe AI account. You can now sign in using your new password.

🎉 PASSWORD CHANGED SUCCESSFULLY!

Your password has been updated and your account is secure. You can now use your new password to access your time capsules.

RESET DETAILS:
- Reset Date & Time: ${resetDate}
- Account Status: Active & Secure

🛡️ SECURITY TIPS:
✓ Use a unique password that you don't use anywhere else
✓ Enable two-factor authentication for extra security
✓ Never share your password with anyone
✓ Update your password regularly (every 3-6 months)
✓ Use a password manager to store your credentials securely

Ready to access your memories? Sign in now with your new password.
Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

⚠️ DIDN'T RESET YOUR PASSWORD?

If you didn't request this password reset, your account may be compromised. Please contact our support team immediately at support@soulsafe.ai or secure your account by changing your password again.

Need help? Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/help

---
SoulSafe AI - Preserving Memories with Intelligence
© 2025 SoulSafe AI. All rights reserved.

Privacy Policy: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy
Terms of Service: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/terms
Support: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/support
  `.trim();
};

/**
 * Send profile update success notification email
 * @param {Object} user - User object containing email, firstName, changedFields (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendProfileUpdateSuccessEmail = async (user, changedFields = []) => {
  try {
    const transporter = createTransporter();
    const { email, firstName } = user;

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '✅ Your Profile Was Updated - SoulSafe AI',
      html: getProfileUpdateTemplate(firstName, changedFields),
      text: getProfileUpdateTextVersion(firstName, changedFields)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Profile update email sent to:', email);
    return { success: true, messageId: info.messageId, recipient: email };
  } catch (error) {
    console.error('❌ Error sending profile update email:', error.message);
    throw error;
  }
};

/**
 * HTML template for profile update notification
 */
const getProfileUpdateTemplate = (firstName, changedFields = []) => {
  const updateDate = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Map technical field names to user-friendly labels
  const fieldLabels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    preferences: 'Preferences',
    profilePicture: 'Profile Picture'
  };

  const fieldsHtml = changedFields.length > 0
    ? `<ul style="color:#d1d5db;list-style:none;padding-left:0;">${changedFields.map(f => `<li style="padding:6px 0;">✓ <strong>${fieldLabels[f] || f}</strong></li>`).join('')}</ul>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Segoe UI, Tahoma, sans-serif; background:#0f1419; color:#e4e6eb; padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#12131a;border-radius:10px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:28px;text-align:center;color:white;">
      <h2 style="margin:0">Profile Updated</h2>
      <p style="margin:6px 0 0;opacity:0.95">Your SoulSafe AI profile was updated</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:16px;">Hello ${firstName || 'there'},</p>
      <p style="color:#b8b9bc;line-height:1.6;">We wanted to let you know that your profile information was successfully updated on <strong>${updateDate}</strong>.</p>
      ${fieldsHtml}
      <p style="color:#b8b9bc;">If you didn't make this change, please secure your account immediately by changing your password or contacting support at <a href="mailto:support@soulsafe.ai" style="color:#667eea;">support@soulsafe.ai</a>.</p>
      <div style="text-align:center;margin-top:18px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="display:inline-block;padding:12px 26px;border-radius:8px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;font-weight:600;">View Profile</a></div>
    </div>
    <div style="background:#0a0d12;padding:16px;text-align:center;color:#8b8d91;font-size:13px;">© SoulSafe AI</div>
  </div>
</body>
</html>
  `;
};

/**
 * Plain text version for profile update notification
 */
const getProfileUpdateTextVersion = (firstName, changedFields = []) => {
  const updateDate = new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  // Map technical field names to user-friendly labels
  const fieldLabels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    preferences: 'Preferences',
    profilePicture: 'Profile Picture'
  };
  
  const fieldsText = changedFields.length > 0 ? '\n\nUpdated fields:\n' + changedFields.map(f => `✓ ${fieldLabels[f] || f}`).join('\n') : '';
  return `✅ Profile Updated - SoulSafe AI\n\nHello ${firstName || 'there'},\n\nYour profile was updated on ${updateDate}.${fieldsText}\n\nIf you didn't make this change, please secure your account by changing your password or contacting support@soulsafe.ai\n\nVisit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile\n\n— SoulSafe AI`.trim();
};

/**
 * Send capsule created notification email
 * @param {Object} user - User object with email, firstName
 * @param {Object} capsule - Capsule object with title, unlockConditions
 * @returns {Promise<Object>} - Email send result
 */
const sendCapsuleCreatedEmail = async (user, capsule) => {
  try {
    const transporter = createTransporter();
    const { email, firstName } = user;
    const { title, unlockConditions } = capsule;

    const unlockDateFormatted = unlockConditions.unlockDate 
      ? new Date(unlockConditions.unlockDate).toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : 'Not set';

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '🎁 Time Capsule Created Successfully - SoulSafe AI',
      html: getCapsuleCreatedTemplate(firstName, title, unlockDateFormatted, capsule._id),
      text: getCapsuleCreatedTextVersion(firstName, title, unlockDateFormatted)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Capsule created email sent to:', email);
    return { success: true, messageId: info.messageId, recipient: email };
  } catch (error) {
    console.error('❌ Error sending capsule created email:', error.message);
    throw error;
  }
};

/**
 * Send 24-hour reminder before capsule unlock
 * @param {Object} user - User object with email, firstName
 * @param {Object} capsule - Capsule object with title, unlockConditions
 * @returns {Promise<Object>} - Email send result
 */
const sendCapsuleReminderEmail = async (user, capsule) => {
  try {
    const transporter = createTransporter();
    const { email, firstName } = user;
    const { title, unlockConditions } = capsule;

    const unlockDateFormatted = new Date(unlockConditions.unlockDate).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '⏰ Your Time Capsule Unlocks Tomorrow - SoulSafe AI',
      html: getCapsuleReminderTemplate(firstName, title, unlockDateFormatted, capsule._id),
      text: getCapsuleReminderTextVersion(firstName, title, unlockDateFormatted)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Capsule reminder email sent to:', email);
    return { success: true, messageId: info.messageId, recipient: email };
  } catch (error) {
    console.error('❌ Error sending capsule reminder email:', error.message);
    throw error;
  }
};

/**
 * Send capsule unlocked notification email
 * @param {Object} user - User object with email, firstName
 * @param {Object} capsule - Capsule object with title, _id
 * @returns {Promise<Object>} - Email send result
 */
const sendCapsuleUnlockedEmail = async (user, capsule) => {
  try {
    const transporter = createTransporter();
    const { email, firstName } = user;
    const { title } = capsule;

    const mailOptions = {
      from: {
        name: 'SoulSafe AI',
        address: process.env.SENDER_EMAIL || 'noreply@soulsafe.ai'
      },
      to: email,
      subject: '🎉 Your Time Capsule is Now Unlocked! - SoulSafe AI',
      html: getCapsuleUnlockedTemplate(firstName, title, capsule._id),
      text: getCapsuleUnlockedTextVersion(firstName, title)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Capsule unlocked email sent to:', email);
    return { success: true, messageId: info.messageId, recipient: email };
  } catch (error) {
    console.error('❌ Error sending capsule unlocked email:', error.message);
    throw error;
  }
};

/**
 * HTML template for capsule created notification
 */
const getCapsuleCreatedTemplate = (firstName, capsuleTitle, unlockDate, capsuleId) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Segoe UI, Tahoma, sans-serif; background:#0f1419; color:#e4e6eb; padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#12131a;border-radius:10px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:32px;text-align:center;color:white;">
      <div style="font-size:48px;margin-bottom:12px;">🎁</div>
      <h2 style="margin:0">Time Capsule Created!</h2>
      <p style="margin:8px 0 0;opacity:0.95">Your memories are safely stored</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:18px;color:#fff;">Hello ${firstName},</p>
      <p style="color:#b8b9bc;line-height:1.7;">Congratulations! Your time capsule <strong style="color:#667eea;">"${capsuleTitle}"</strong> has been successfully created and securely stored.</p>
      
      <div style="background:#1a1f2e;border-left:4px solid #667eea;border-radius:8px;padding:20px;margin:20px 0;">
        <div style="margin-bottom:12px;">
          <span style="color:#8b8d91;font-size:14px;">Unlock Date:</span>
          <div style="color:#fff;font-weight:600;font-size:16px;margin-top:4px;">${unlockDate}</div>
        </div>
      </div>

      <p style="color:#b8b9bc;line-height:1.7;">We'll send you a reminder 24 hours before your capsule unlocks, and notify you the moment it becomes available.</p>
      
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules/${capsuleId}" style="display:inline-block;padding:14px 32px;border-radius:8px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;font-weight:600;">View Capsule</a>
      </div>
    </div>
    <div style="background:#0a0d12;padding:18px;text-align:center;color:#8b8d91;font-size:13px;">
      <p style="margin:0;">SoulSafe AI - Preserving Memories with Intelligence</p>
      <p style="margin:8px 0 0;">© 2025 SoulSafe AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * HTML template for 24-hour reminder
 */
const getCapsuleReminderTemplate = (firstName, capsuleTitle, unlockDate, capsuleId) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Segoe UI, Tahoma, sans-serif; background:#0f1419; color:#e4e6eb; padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#12131a;border-radius:10px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;color:white;">
      <div style="font-size:48px;margin-bottom:12px;">⏰</div>
      <h2 style="margin:0">Capsule Unlocks Tomorrow!</h2>
      <p style="margin:8px 0 0;opacity:0.95">Get ready to revisit your memories</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:18px;color:#fff;">Hello ${firstName},</p>
      <p style="color:#b8b9bc;line-height:1.7;">Exciting news! Your time capsule <strong style="color:#f59e0b;">"${capsuleTitle}"</strong> will unlock in approximately 24 hours.</p>
      
      <div style="background:#1a1f2e;border-left:4px solid #f59e0b;border-radius:8px;padding:20px;margin:20px 0;">
        <div style="margin-bottom:8px;">
          <span style="color:#8b8d91;font-size:14px;">Unlock Time:</span>
          <div style="color:#fff;font-weight:600;font-size:16px;margin-top:4px;">${unlockDate}</div>
        </div>
        <div style="color:#d1d5db;font-size:14px;margin-top:12px;">
          ⏳ Your memories are almost ready to be revealed!
        </div>
      </div>

      <p style="color:#b8b9bc;line-height:1.7;">We'll send you another notification as soon as your capsule is unlocked and ready to view.</p>
      
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules/${capsuleId}" style="display:inline-block;padding:14px 32px;border-radius:8px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;font-weight:600;">View Capsule Details</a>
      </div>
    </div>
    <div style="background:#0a0d12;padding:18px;text-align:center;color:#8b8d91;font-size:13px;">
      <p style="margin:0;">SoulSafe AI - Preserving Memories with Intelligence</p>
      <p style="margin:8px 0 0;">© 2025 SoulSafe AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * HTML template for capsule unlocked
 */
const getCapsuleUnlockedTemplate = (firstName, capsuleTitle, capsuleId) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Segoe UI, Tahoma, sans-serif; background:#0f1419; color:#e4e6eb; padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#12131a;border-radius:10px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;color:white;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h2 style="margin:0">Your Capsule is Unlocked!</h2>
      <p style="margin:8px 0 0;opacity:0.95">Your memories are ready to view</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:18px;color:#fff;">Hello ${firstName},</p>
      <p style="color:#b8b9bc;line-height:1.7;">Great news! Your time capsule <strong style="color:#10b981;">"${capsuleTitle}"</strong> has been unlocked and is now ready to view.</p>
      
      <div style="background:#064e3b;border:2px solid #10b981;border-radius:10px;padding:24px;margin:24px 0;text-align:center;">
        <div style="font-size:42px;margin-bottom:8px;">✨</div>
        <div style="color:#10b981;font-weight:700;font-size:18px;margin-bottom:8px;">Time to Revisit Your Memories!</div>
        <div style="color:#d1d5db;font-size:14px;">The moment you've been waiting for has arrived</div>
      </div>

      <p style="color:#b8b9bc;line-height:1.7;">Click the button below to open your capsule and rediscover the memories you stored.</p>
      
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules/${capsuleId}" style="display:inline-block;padding:16px 40px;border-radius:8px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;font-weight:600;font-size:16px;">Open Your Capsule →</a>
      </div>

      <p style="color:#8b8d91;font-size:13px;margin-top:24px;line-height:1.6;">
        💡 Tip: You can download, share, or create a new capsule from your dashboard.
      </p>
    </div>
    <div style="background:#0a0d12;padding:18px;text-align:center;color:#8b8d91;font-size:13px;">
      <p style="margin:0;">SoulSafe AI - Preserving Memories with Intelligence</p>
      <p style="margin:8px 0 0;">© 2025 SoulSafe AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Plain text versions
 */
const getCapsuleCreatedTextVersion = (firstName, capsuleTitle, unlockDate) => {
  return `🎁 Time Capsule Created! - SoulSafe AI

Hello ${firstName},

Congratulations! Your time capsule "${capsuleTitle}" has been successfully created and securely stored.

Unlock Date: ${unlockDate}

We'll send you a reminder 24 hours before your capsule unlocks, and notify you the moment it becomes available.

Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules

— SoulSafe AI
Preserving Memories with Intelligence
© 2025 SoulSafe AI. All rights reserved.`.trim();
};

const getCapsuleReminderTextVersion = (firstName, capsuleTitle, unlockDate) => {
  return `⏰ Capsule Unlocks Tomorrow! - SoulSafe AI

Hello ${firstName},

Exciting news! Your time capsule "${capsuleTitle}" will unlock in approximately 24 hours.

Unlock Time: ${unlockDate}

⏳ Your memories are almost ready to be revealed!

We'll send you another notification as soon as your capsule is unlocked and ready to view.

Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules

— SoulSafe AI
© 2025 SoulSafe AI. All rights reserved.`.trim();
};

const getCapsuleUnlockedTextVersion = (firstName, capsuleTitle) => {
  return `🎉 Your Capsule is Unlocked! - SoulSafe AI

Hello ${firstName},

Great news! Your time capsule "${capsuleTitle}" has been unlocked and is now ready to view.

✨ Time to Revisit Your Memories!
The moment you've been waiting for has arrived.

Open your capsule now: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/capsules

💡 Tip: You can download, share, or create a new capsule from your dashboard.

— SoulSafe AI
© 2025 SoulSafe AI. All rights reserved.`.trim();
};

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
  sendProfileUpdateSuccessEmail,
  sendCapsuleCreatedEmail,
  sendCapsuleReminderEmail,
  sendCapsuleUnlockedEmail
};
