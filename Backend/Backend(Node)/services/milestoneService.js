const axios = require('axios');
// Simple console logger for now
const logger = {
  error: (msg, error) => console.error(`[ERROR] ${msg}`, error),
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

class MilestoneService {
  constructor() {
    this.socialMediaAPIs = {
      facebook: process.env.FACEBOOK_API_KEY,
      instagram: process.env.INSTAGRAM_API_KEY,
      linkedin: process.env.LINKEDIN_API_KEY,
      twitter: process.env.TWITTER_API_KEY
    };
  }

  /**
   * Check for social media milestones
   */
  async checkSocialMediaMilestones(userId, userSocialAccounts) {
    const milestones = [];

    try {
      for (const platform of Object.keys(userSocialAccounts)) {
        const platformMilestones = await this.checkPlatformMilestones(
          platform, 
          userSocialAccounts[platform]
        );
        milestones.push(...platformMilestones);
      }

      return milestones;
    } catch (error) {
      logger.error('Error checking social media milestones:', error);
      return [];
    }
  }

  /**
   * Check platform-specific milestones
   */
  async checkPlatformMilestones(platform, accountData) {
    switch (platform) {
      case 'facebook':
        return await this.checkFacebookMilestones(accountData);
      case 'instagram':
        return await this.checkInstagramMilestones(accountData);
      case 'linkedin':
        return await this.checkLinkedInMilestones(accountData);
      case 'twitter':
        return await this.checkTwitterMilestones(accountData);
      default:
        return [];
    }
  }

  /**
   * Check Facebook milestones
   */
  async checkFacebookMilestones(accountData) {
    const milestones = [];
    
    try {
      // Check for relationship status changes
      if (accountData.relationshipStatus === 'married') {
        milestones.push({
          type: 'relationship_milestone',
          event: 'marriage',
          platform: 'facebook',
          date: accountData.relationshipDate,
          significance: 'high'
        });
      }

      // Check for job changes
      if (accountData.workHistory && accountData.workHistory.length > 0) {
        const latestJob = accountData.workHistory[0];
        if (this.isRecentEvent(latestJob.startDate)) {
          milestones.push({
            type: 'career_milestone',
            event: 'new_job',
            platform: 'facebook',
            date: latestJob.startDate,
            significance: 'medium',
            details: latestJob.company
          });
        }
      }

      // Check for graduation
      if (accountData.education && accountData.education.length > 0) {
        const latestEducation = accountData.education[0];
        if (latestEducation.graduationDate && this.isRecentEvent(latestEducation.graduationDate)) {
          milestones.push({
            type: 'education_milestone',
            event: 'graduation',
            platform: 'facebook',
            date: latestEducation.graduationDate,
            significance: 'high',
            details: latestEducation.school
          });
        }
      }

    } catch (error) {
      logger.error('Facebook milestone check error:', error);
    }

    return milestones;
  }

  /**
   * Check Instagram milestones
   */
  async checkInstagramMilestones(accountData) {
    const milestones = [];

    try {
      // Check follower milestones
      const followerCount = accountData.followerCount;
      const followerMilestones = [1000, 5000, 10000, 50000, 100000];
      
      for (const milestone of followerMilestones) {
        if (followerCount >= milestone && !accountData.achievedMilestones?.includes(`followers_${milestone}`)) {
          milestones.push({
            type: 'social_milestone',
            event: 'follower_milestone',
            platform: 'instagram',
            date: new Date(),
            significance: 'medium',
            details: `${milestone} followers achieved`
          });
        }
      }

      // Check for viral posts (high engagement)
      if (accountData.recentPosts) {
        for (const post of accountData.recentPosts) {
          if (post.likes > 1000 || post.comments > 100) {
            milestones.push({
              type: 'content_milestone',
              event: 'viral_post',
              platform: 'instagram',
              date: post.date,
              significance: 'low',
              details: `Post with ${post.likes} likes, ${post.comments} comments`
            });
          }
        }
      }

    } catch (error) {
      logger.error('Instagram milestone check error:', error);
    }

    return milestones;
  }

  /**
   * Check LinkedIn milestones
   */
  async checkLinkedInMilestones(accountData) {
    const milestones = [];

    try {
      // Check for job promotions
      if (accountData.positions && accountData.positions.length > 1) {
        const currentPosition = accountData.positions[0];
        const previousPosition = accountData.positions[1];
        
        if (this.isPromotion(currentPosition, previousPosition)) {
          milestones.push({
            type: 'career_milestone',
            event: 'promotion',
            platform: 'linkedin',
            date: currentPosition.startDate,
            significance: 'high',
            details: `Promoted to ${currentPosition.title}`
          });
        }
      }

      // Check for skill endorsements
      if (accountData.skills) {
        for (const skill of accountData.skills) {
          if (skill.endorsements >= 50) {
            milestones.push({
              type: 'professional_milestone',
              event: 'skill_recognition',
              platform: 'linkedin',
              date: new Date(),
              significance: 'low',
              details: `${skill.name} skill highly endorsed`
            });
          }
        }
      }

      // Check for certifications
      if (accountData.certifications) {
        for (const cert of accountData.certifications) {
          if (this.isRecentEvent(cert.date)) {
            milestones.push({
              type: 'education_milestone',
              event: 'certification',
              platform: 'linkedin',
              date: cert.date,
              significance: 'medium',
              details: cert.name
            });
          }
        }
      }

    } catch (error) {
      logger.error('LinkedIn milestone check error:', error);
    }

    return milestones;
  }

  /**
   * Check Twitter milestones
   */
  async checkTwitterMilestones(accountData) {
    const milestones = [];

    try {
      // Check follower milestones
      const followerCount = accountData.followersCount;
      const followerMilestones = [100, 500, 1000, 5000, 10000];
      
      for (const milestone of followerMilestones) {
        if (followerCount >= milestone && !accountData.achievedMilestones?.includes(`followers_${milestone}`)) {
          milestones.push({
            type: 'social_milestone',
            event: 'follower_milestone',
            platform: 'twitter',
            date: new Date(),
            significance: 'medium',
            details: `${milestone} followers achieved`
          });
        }
      }

      // Check for viral tweets
      if (accountData.recentTweets) {
        for (const tweet of accountData.recentTweets) {
          if (tweet.retweets > 100 || tweet.likes > 500) {
            milestones.push({
              type: 'content_milestone',
              event: 'viral_tweet',
              platform: 'twitter',
              date: tweet.date,
              significance: 'low',
              details: `Tweet with ${tweet.retweets} retweets, ${tweet.likes} likes`
            });
          }
        }
      }

    } catch (error) {
      logger.error('Twitter milestone check error:', error);
    }

    return milestones;
  }

  /**
   * Check life events from calendar integration
   */
  async checkCalendarMilestones(userId, calendarData) {
    const milestones = [];

    try {
      const importantEvents = ['birthday', 'anniversary', 'graduation', 'wedding', 'baby', 'retirement'];
      
      for (const event of calendarData.events) {
        if (this.isImportantEvent(event, importantEvents)) {
          milestones.push({
            type: 'life_milestone',
            event: event.type,
            platform: 'calendar',
            date: event.date,
            significance: this.getEventSignificance(event.type),
            details: event.description
          });
        }
      }

    } catch (error) {
      logger.error('Calendar milestone check error:', error);
    }

    return milestones;
  }

  /**
   * Check if event happened recently (within last 30 days)
   */
  isRecentEvent(eventDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(eventDate) >= thirtyDaysAgo;
  }

  /**
   * Check if position change is a promotion
   */
  isPromotion(currentPosition, previousPosition) {
    const promotionKeywords = ['senior', 'lead', 'manager', 'director', 'vp', 'chief'];
    const currentTitle = currentPosition.title.toLowerCase();
    const previousTitle = previousPosition.title.toLowerCase();
    
    return promotionKeywords.some(keyword => 
      currentTitle.includes(keyword) && !previousTitle.includes(keyword)
    );
  }

  /**
   * Check if calendar event is important
   */
  isImportantEvent(event, importantEvents) {
    return importantEvents.some(important => 
      event.title.toLowerCase().includes(important) || 
      event.description?.toLowerCase().includes(important)
    );
  }

  /**
   * Get event significance level
   */
  getEventSignificance(eventType) {
    const highSignificance = ['wedding', 'graduation', 'baby', 'retirement'];
    const mediumSignificance = ['birthday', 'anniversary', 'promotion'];
    
    if (highSignificance.includes(eventType)) return 'high';
    if (mediumSignificance.includes(eventType)) return 'medium';
    return 'low';
  }

  /**
   * Trigger capsule unlocks based on milestones
   */
  async triggerMilestoneUnlocks(userId, milestones) {
    const Capsule = require('../models/CapsuleModel');
    const triggeredUnlocks = [];

    try {
      // Find capsules with milestone-based unlock conditions
      const capsules = await Capsule.find({
        owner: userId,
        'unlockConditions.type': 'event',
        'unlockConditions.isUnlocked': false
      });

      for (const capsule of capsules) {
        for (const milestone of milestones) {
          if (this.shouldTriggerUnlock(capsule.unlockConditions, milestone)) {
            await capsule.unlock();
            triggeredUnlocks.push({
              capsuleId: capsule._id,
              milestone: milestone,
              unlockedAt: new Date()
            });
          }
        }
      }

      return triggeredUnlocks;
    } catch (error) {
      logger.error('Error triggering milestone unlocks:', error);
      return [];
    }
  }

  /**
   * Check if milestone should trigger capsule unlock
   */
  shouldTriggerUnlock(unlockConditions, milestone) {
    if (unlockConditions.eventType === milestone.event) {
      return true;
    }
    
    // Check for AI-triggered conditions
    if (unlockConditions.aiTriggers) {
      return unlockConditions.aiTriggers.some(trigger => 
        trigger.context === milestone.type && 
        milestone.significance === 'high'
      );
    }
    
    return false;
  }
}

module.exports = new MilestoneService();
