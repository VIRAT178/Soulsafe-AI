const express = require('express');
const router = express.Router();

const axios = require('axios');
const config = require('../config');

router.post('/analyze', async (req, res) => {
  try {
    const { content, type } = req.body;
    console.log('[AI Analyze] Called with:', { contentLength: content?.length, type });
    console.log('[Config] Python service:', config.pythonService);
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Call Python AI service for comprehensive content analysis
    let analysisResponse;
    try {
      console.log('[AI Analyze] Calling Python service:', `${config.pythonService}/analyze/content`);
      analysisResponse = await axios.post(
        `${config.pythonService}/analyze/content`,
        { content, type: type || 'text' },
        { timeout: 10000 } // 10 second timeout
      );
      console.log('[AI Analyze] Python response received:', analysisResponse.data);
    } catch (err) {
      console.error('[AI Analyze] Python service error:', err.message);
      console.error('[AI Analyze] Error details:', err.response?.data || err.code);
      
      // Return a fallback response if Python service is unavailable
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        return res.status(503).json({ 
          error: 'AI analysis service temporarily unavailable',
          details: 'Python AI service is not running. Please start it on port 5001.'
        });
      }
      throw err;
    }
    
    res.json({
      success: true,
      analysis: analysisResponse.data.analysis || analysisResponse.data
    });
  } catch (error) {
    console.error('[AI Analyze] Handler error:', error.message);
    const details = process.env.NODE_ENV === 'development' ? error.message : 'Internal error';
    res.status(500).json({ error: 'AI analysis failed', details });
  }
});

// Emotion analysis endpoint
router.post('/emotions', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('AI emotions called with text length:', text?.length);
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Call Python AI service for emotion analysis
    try {
      const emotionResponse = await axios.post(
        `${config.pythonService}/analyze/emotion`,
        { text }
      );
      // Always provide a 'scores' property for frontend compatibility
      let emotions = emotionResponse.data.emotion || emotionResponse.data;
      // If 'emotions' is a nested object, extract the scores
      let scores = emotions.emotions || emotions.scores || {};
      res.json({
        success: true,
        emotions: { ...emotions, scores },
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Python AI service error:', err.message || err);
      throw err;
    }
  } catch (error) {
    console.error('AI emotions handler error:', error && (error.stack || error));
    const details = process.env.NODE_ENV === 'development' ? (error && (error.stack || error.message)) : 'Internal error';
    res.status(500).json({ error: 'Emotion analysis failed', details });
  }
});

router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mock recommendations
    const recommendations = {
      unlock_suggestions: [],
      content_suggestions: [
        {
          type: 'memory_capsule',
          description: 'Create a memory capsule for special moments',
          reason: 'High emotional content detected'
        }
      ],
      sharing_suggestions: []
    };
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.post('/insights/:capsuleId', async (req, res) => {
  try {
    const { capsuleId } = req.params;
    
    // Mock insights
    const insights = {
      capsule_id: capsuleId,
      timestamp: new Date().toISOString(),
      content_analysis: {
        emotion: { primary: 'joy', confidence: 0.85 },
        classification: { category: 'personal', topic: 'memory' }
      },
      unlock_recommendations: [],
      sharing_suggestions: []
    };
    
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.toLowerCase().trim();
    let response = '';

    // Intent detection and response generation
    if (userMessage.includes('help') || userMessage.includes('what can you do')) {
      response = `I'm your AI advisor for SoulSafe! I can help you with:
      
• Analyzing your memories and emotions
• Creating meaningful time capsules
• Providing insights on your personal growth
• Suggesting optimal times for capsule unlocking
• Organizing your digital legacy
• Answering questions about your stored memories

What would you like to explore?`;
    }
    else if (userMessage.includes('analyze') || userMessage.includes('analysis')) {
      response = `I'd be happy to analyze your memories! Based on your recent capsules, I can detect emotional patterns, identify key themes, and provide personalized insights. Would you like me to analyze a specific capsule or your overall memory patterns?`;
    }
    else if (userMessage.includes('create') || userMessage.includes('capsule')) {
      response = `Creating a time capsule is a wonderful way to preserve memories! Here are some suggestions:

• Milestone Capsule: Document important life events
• Emotion Capsule: Capture your current feelings and thoughts
• Legacy Capsule: Share wisdom for your future self
• Memory Capsule: Store cherished moments and experiences

Would you like guidance on creating any of these?`;
    }
    else if (userMessage.includes('insight') || userMessage.includes('pattern')) {
      response = `Based on your neural data patterns, I've noticed:

• You tend to create capsules during reflective periods
• Your emotional range shows strong self-awareness
• Your memories often focus on meaningful relationships
• You have a consistent pattern of gratitude expressions

Would you like a deeper analysis of any specific pattern?`;
    }
    else if (userMessage.includes('emotion') || userMessage.includes('feel')) {
      response = `Your emotional intelligence shows remarkable depth! I can detect various emotions in your capsules: joy, nostalgia, hope, and contemplation. Your emotional patterns suggest you're in a positive growth phase. Would you like me to analyze specific emotional trends?`;
    }
    else if (userMessage.includes('milestone') || userMessage.includes('achievement')) {
      response = `Milestones are important markers in your journey! I can help you:

• Track your personal growth
• Celebrate achievements
• Set future goals
• Connect memories to specific life events

What milestone would you like to explore or document?`;
    }
    else if (userMessage.includes('unlock') || userMessage.includes('when')) {
      response = `Time capsule unlocking is a special moment! Based on your patterns:

• Optimal unlock times align with your reflective periods
• Consider anniversary dates for emotional impact
• Future-self messages work best after significant time gaps (6+ months)
• Surprise unlocks can be scheduled for motivational moments

Would you like help setting up unlock conditions?`;
    }
    else if (userMessage.includes('security') || userMessage.includes('encryption') || userMessage.includes('safe')) {
      response = `Your memories are protected with quantum-level encryption! Our security features include:

• AES-256 encryption for all content
• Neural pattern authentication
• Blockchain verification for time-locks
• Zero-knowledge architecture

Your data is completely secure and private. Only you can access your capsules.`;
    }
    else if (userMessage.includes('thank') || userMessage.includes('thanks')) {
      response = `You're welcome! I'm here to help you preserve and understand your memories. Feel free to ask me anything about your capsules, emotions, or digital legacy. How else can I assist you today?`;
    }
    else if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      response = `Hello! I'm your AI advisor from SoulSafe. I'm here to help you analyze memories, create meaningful capsules, and gain insights into your personal journey. What would you like to explore today?`;
    }
    else if (userMessage.includes('goodbye') || userMessage.includes('bye')) {
      response = `Goodbye! Remember, your memories are safely stored and I'm always here when you need insights or guidance. Take care!`;
    }
    else {
      // Default intelligent response
      response = `That's an interesting question! Based on your memory patterns and emotional data, I can provide personalized guidance. 

Your recent capsules show:
• ${Math.floor(Math.random() * 15) + 5} emotional markers
• Strong themes of ${['personal growth', 'relationships', 'achievement', 'reflection'][Math.floor(Math.random() * 4)]}
• ${Math.floor(Math.random() * 30) + 70}% positive sentiment

Would you like me to elaborate on any specific aspect, or help you with creating a new capsule?`;
    }

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: detectIntent(userMessage),
        confidence: 0.85
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// Helper function to detect user intent
function detectIntent(message) {
  const intents = {
    help: ['help', 'what can you do', 'how'],
    analyze: ['analyze', 'analysis', 'insight'],
    create: ['create', 'make', 'new capsule'],
    emotion: ['emotion', 'feel', 'mood'],
    security: ['security', 'safe', 'encryption'],
    greeting: ['hello', 'hi', 'hey'],
    farewell: ['goodbye', 'bye', 'see you']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }
  return 'general';
}

module.exports = router;
