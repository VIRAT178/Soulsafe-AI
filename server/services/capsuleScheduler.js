const Capsule = require('../models/CapsuleModel');
const User = require('../models/UserModel');
const { sendCapsuleReminderEmail } = require('./emailService');

/**
 * Check for capsules that will unlock in 24 hours and send reminder emails
 * This function should be called periodically (e.g., every hour via cron job)
 */
const checkAndSendReminders = async () => {
  try {
    // Check if DB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Skipping reminder check - database not connected');
      return { success: false, error: 'Database not connected' };
    }
    
    console.log('🔍 Checking for capsules requiring 24-hour reminders...');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find capsules that will unlock between 24-25 hours from now
    // and haven't been reminded yet (no reminderSent field or it's false)
    const capsulesNeedingReminder = await Capsule.find({
      'unlockConditions.type': 'date',
      'unlockConditions.isUnlocked': false,
      'unlockConditions.unlockDate': {
        $gte: in24Hours,
        $lt: in25Hours
      },
      reminderSent: { $ne: true }
    }).populate('owner', 'email firstName preferences');

    console.log(`📧 Found ${capsulesNeedingReminder.length} capsule(s) requiring reminders`);

    let successCount = 0;
    let failCount = 0;

    for (const capsule of capsulesNeedingReminder) {
      try {
        const user = capsule.owner;
        
        // Check if user has email notifications enabled
        if (user && user.preferences?.notifications?.email !== false) {
          await sendCapsuleReminderEmail(user, capsule);
          
          // Mark reminder as sent
          capsule.reminderSent = true;
          await capsule.save();
          
          console.log(`✅ Reminder sent for capsule: "${capsule.title}" to ${user.email}`);
          successCount++;
        } else {
          console.log(`⏭️ Skipping reminder for "${capsule.title}" - email notifications disabled`);
        }
      } catch (emailErr) {
        console.error(`❌ Failed to send reminder for capsule ${capsule._id}:`, emailErr.message);
        failCount++;
      }
    }

    console.log(`✅ Reminder check complete: ${successCount} sent, ${failCount} failed`);
    
    return {
      success: true,
      totalChecked: capsulesNeedingReminder.length,
      sent: successCount,
      failed: failCount
    };
  } catch (error) {
    console.error('❌ Error in capsule reminder scheduler:', error);
    throw error;
  }
};

/**
 * Start the scheduler to run every hour
 * Call this function when the server starts
 */
const startScheduler = () => {
  console.log('🚀 Starting capsule reminder scheduler...');
  
  // Run immediately on startup
  checkAndSendReminders().catch(err => {
    console.error('Initial reminder check failed:', err);
  });
  
  // Then run every hour (3600000 ms)
  const intervalId = setInterval(() => {
    checkAndSendReminders().catch(err => {
      console.error('Scheduled reminder check failed:', err);
    });
  }, 3600000); // 1 hour in milliseconds

  console.log('✅ Capsule reminder scheduler started (runs every hour)');
  
  return intervalId;
};

/**
 * Manual trigger for testing/admin purposes
 */
const manualTriggerReminders = async () => {
  console.log('🔧 Manual trigger: Checking for reminders...');
  return await checkAndSendReminders();
};

module.exports = {
  startScheduler,
  checkAndSendReminders,
  manualTriggerReminders
};
