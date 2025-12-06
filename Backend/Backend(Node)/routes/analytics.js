const express = require('express');
const router = express.Router();
const Capsule = require('../models/CapsuleModel');
const { authMiddleware } = require('../middleware/auth');

// Get user analytics and insights
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user's capsules within date range
    const capsules = await Capsule.find({
      owner: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Aggregate emotion data
    const emotionData = {
      happiness: 0,
      excitement: 0,
      nostalgia: 0,
      gratitude: 0,
      love: 0,
      anxiety: 0,
      sadness: 0,
      neutral: 0
    };

    let totalEmotions = 0;
    const emotionHistory = [];
    const activityByDay = {};
    const activityByHour = {};
    const topCategories = {};
    let totalWords = 0;
    let wordCount = 0;

    capsules.forEach(capsule => {
      // Process AI analysis if available
      if (capsule.aiAnalysis && capsule.aiAnalysis.emotion) {
        const emotion = capsule.aiAnalysis.emotion;
        
        // Map emotion to our categories
        if (emotion.primary) {
          const emotionKey = mapEmotionToCategory(emotion.primary);
          if (emotionData.hasOwnProperty(emotionKey)) {
            emotionData[emotionKey] += (emotion.confidence || 0.5) * 100;
            totalEmotions++;
          }
        }

        emotionHistory.push({
          date: capsule.createdAt,
          emotion: emotion.primary,
          confidence: emotion.confidence
        });
      }

      // Activity patterns
      const date = capsule.createdAt.toISOString().split('T')[0];
      const hour = capsule.createdAt.getHours();
      const day = capsule.createdAt.toLocaleDateString('en-US', { weekday: 'long' });

      activityByDay[day] = (activityByDay[day] || 0) + 1;
      activityByHour[hour] = (activityByHour[hour] || 0) + 1;

      // Categories
      if (capsule.category) {
        topCategories[capsule.category] = (topCategories[capsule.category] || 0) + 1;
      }

      // Word count estimation
      if (capsule.content && capsule.content.text) {
        const words = capsule.content.text.split(/\s+/).length;
        totalWords += words;
        wordCount++;
      }
    });

    // Normalize emotion data
    if (totalEmotions > 0) {
      Object.keys(emotionData).forEach(key => {
        emotionData[key] = Math.round(emotionData[key] / totalEmotions);
      });
    }

    // Find most active patterns
    const mostActiveDay = Object.keys(activityByDay).reduce((a, b) => 
      activityByDay[a] > activityByDay[b] ? a : b, 'Sunday'
    );

    const mostActiveHour = Object.keys(activityByHour).reduce((a, b) => 
      activityByHour[a] > activityByHour[b] ? a : b, '20'
    );

    const averageWords = wordCount > 0 ? Math.round(totalWords / wordCount) : 0;

    // Generate timeline data
    const timeline = generateTimelineData(capsules, timeRange);

    // Generate predictions and recommendations
    const predictions = generatePredictions(capsules, emotionData);

    const insights = {
      summary: {
        totalCapsules: capsules.length,
        totalMemories: capsules.reduce((sum, c) => sum + (c.content?.memories?.length || 1), 0),
        aiInsights: capsules.filter(c => c.aiAnalysis).length,
        futureUnlocks: capsules.filter(c => !c.unlockConditions.isUnlocked).length
      },
      emotions: emotionData,
      patterns: {
        mostActiveDay,
        mostActiveTime: `${mostActiveHour}:00-${parseInt(mostActiveHour) + 1}:00`,
        averageWordsPerMemory: averageWords,
        memoryFrequency: calculateFrequency(capsules.length, timeRange),
        topCategories: Object.keys(topCategories)
          .sort((a, b) => topCategories[b] - topCategories[a])
          .slice(0, 5)
      },
      timeline,
      predictions,
      activityData: {
        byDay: activityByDay,
        byHour: activityByHour,
        emotionHistory: emotionHistory.slice(-20) // Last 20 emotions
      }
    };

    res.json({
      success: true,
      insights,
      timeRange,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Analytics insights error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate insights',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get emotion trends over time
router.get('/emotions/trends', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query;

    const capsules = await Capsule.find({
      owner: userId,
      'aiAnalysis.emotion': { $exists: true }
    }).sort({ createdAt: -1 }).limit(100);

    const trends = processEmotionTrends(capsules, period);

    res.json({
      success: true,
      trends,
      period
    });

  } catch (error) {
    console.error('Emotion trends error:', error);
    res.status(500).json({ error: 'Failed to get emotion trends' });
  }
});

// Helper functions
function mapEmotionToCategory(emotion) {
  const emotionMap = {
    'joy': 'happiness',
    'happy': 'happiness',
    'happiness': 'happiness',
    'excited': 'excitement',
    'excitement': 'excitement',
    'nostalgic': 'nostalgia',
    'nostalgia': 'nostalgia',
    'grateful': 'gratitude',
    'gratitude': 'gratitude',
    'love': 'love',
    'loving': 'love',
    'anxious': 'anxiety',
    'anxiety': 'anxiety',
    'worried': 'anxiety',
    'sad': 'sadness',
    'sadness': 'sadness',
    'depressed': 'sadness',
    'neutral': 'neutral'
  };
  
  return emotionMap[emotion.toLowerCase()] || 'neutral';
}

function calculateFrequency(count, timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const frequency = count / (days / 7); // per week
  
  if (frequency >= 3) return 'Daily';
  if (frequency >= 1) return 'Weekly';
  if (frequency >= 0.25) return 'Monthly';
  return 'Rarely';
}

function generateTimelineData(capsules, timeRange) {
  const timeline = [];
  const groupBy = timeRange === '7d' ? 'day' : timeRange === '30d' ? 'week' : 'month';
  
  // Group capsules by time period
  const groups = {};
  capsules.forEach(capsule => {
    let key;
    const date = new Date(capsule.createdAt);
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!groups[key]) {
      groups[key] = { memories: 0, emotions: [] };
    }
    groups[key].memories++;
    
    if (capsule.aiAnalysis?.emotion?.primary) {
      groups[key].emotions.push(capsule.aiAnalysis.emotion.primary);
    }
  });

  // Convert to timeline format
  Object.keys(groups).sort().forEach(key => {
    const group = groups[key];
    const dominantEmotion = getDominantEmotion(group.emotions);
    
    timeline.push({
      date: key,
      memories: group.memories,
      emotions: dominantEmotion
    });
  });

  return timeline.slice(-10); // Last 10 periods
}

function getDominantEmotion(emotions) {
  if (emotions.length === 0) return 'neutral';
  
  const counts = {};
  emotions.forEach(emotion => {
    counts[emotion] = (counts[emotion] || 0) + 1;
  });
  
  const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  
  // Map to sentiment categories
  const positiveEmotions = ['joy', 'happiness', 'excitement', 'love', 'gratitude'];
  const negativeEmotions = ['sadness', 'anxiety', 'anger', 'fear'];
  
  if (positiveEmotions.includes(dominant)) return 'positive';
  if (negativeEmotions.includes(dominant)) return 'negative';
  return 'mixed';
}

function generatePredictions(capsules, emotionData) {
  const predictions = {
    nextMilestone: 'Continue creating memories to unlock insights',
    emotionalTrend: 'Stable emotional patterns detected',
    recommendedActions: []
  };

  // Analyze trends
  if (capsules.length > 5) {
    const recentCapsules = capsules.slice(0, 5);
    const olderCapsules = capsules.slice(5, 10);
    
    const recentPositive = recentCapsules.filter(c => 
      c.aiAnalysis?.emotion?.primary && 
      ['joy', 'happiness', 'excitement', 'love'].includes(c.aiAnalysis.emotion.primary)
    ).length;
    
    const olderPositive = olderCapsules.filter(c => 
      c.aiAnalysis?.emotion?.primary && 
      ['joy', 'happiness', 'excitement', 'love'].includes(c.aiAnalysis.emotion.primary)
    ).length;

    if (recentPositive > olderPositive) {
      predictions.emotionalTrend = 'Increasing positivity trend detected';
    } else if (recentPositive < olderPositive) {
      predictions.emotionalTrend = 'Consider focusing on positive experiences';
    }
  }

  // Generate recommendations
  if (emotionData.happiness > 70) {
    predictions.recommendedActions.push('Create a celebration memory capsule');
  }
  if (emotionData.nostalgia > 60) {
    predictions.recommendedActions.push('Document family history memories');
  }
  if (capsules.length > 10) {
    predictions.recommendedActions.push('Schedule a future unlock for reflection');
  }
  
  predictions.recommendedActions.push('Share meaningful memories with loved ones');

  return predictions;
}

function processEmotionTrends(capsules, period) {
  // Implementation for emotion trends over time
  return capsules.map(capsule => ({
    date: capsule.createdAt,
    emotion: capsule.aiAnalysis?.emotion?.primary || 'neutral',
    confidence: capsule.aiAnalysis?.emotion?.confidence || 0
  }));
}

module.exports = router;
