import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Send,
  Bot,
  User,
  Brain,
  Zap,
  MessageCircle,
  Sparkles,
  ArrowUp
} from 'lucide-react';

const AIChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello ${user?.firstName || 'User'}! I'm your AI advisor from SoulSafe. I can help you analyze your memories, provide insights, and assist with your digital time capsules. What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the real AI chat API
      const { aiAPI } = await import('../services/api.jsx');
      const { data } = await aiAPI.chat(currentInput);
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response || data.message || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
        metadata: data.metadata
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput) => {
    // This function is kept as a fallback but not used anymore
    const responses = [
      "That's an interesting perspective! Based on your memory patterns, I can see you value deep connections and meaningful experiences.",
      "I've analyzed your recent capsules and noticed some fascinating emotional patterns. Would you like me to elaborate on what I found?",
      "Your neural data suggests you're in a reflective phase. This could be an excellent time to create a milestone capsule.",
      "I can help you organize your memories more effectively. Have you considered using our advanced tagging system?",
      "Your emotional intelligence scores are quite high! This indicates strong self-awareness in your memory preservation.",
      "Based on your interaction patterns, I recommend exploring the insights dashboard for deeper analysis.",
      "I notice you haven't created a capsule recently. Would you like some suggestions for meaningful content to preserve?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickPrompt = async (prompt) => {
    setInputMessage(prompt);
    // Directly invoke send with synthetic event
    setTimeout(() => {
      handleSendMessage({ preventDefault: () => {} });
    }, 50);
  };

  const quickPrompts = [
    "What can you help me with?",
    "Analyze my recent memories",
    "Help me create a capsule",
    "Show me insights about my patterns",
    "How does encryption work?",
    "Suggest capsule ideas"
  ];

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-brand-600/30 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-tl from-brand-500/25 to-brand-700/10 rounded-full blur-3xl"></div>
      </div>
      
      <Navbar />

      {/* Main Chat Interface */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">
            AI Chat Advisor
          </h1>
          <p className="text-surface-400 text-sm">
            Get personalized insights and guidance from your AI assistant
          </p>
        </div>

        {/* Chat Container */}
        <div className="card-modern flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center flex-shrink-0 shadow-glow-sm ring-1 ring-white/10 ${
                  message.type === 'ai' 
                    ? 'bg-gradient-to-br from-brand-600 to-brand-500' 
                    : 'bg-gradient-to-br from-brand-500 to-brand-600'
                }`}>
                  {message.type === 'ai' ? (
                    <Brain className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-4 rounded-xl2 text-sm whitespace-pre-line ${
                    message.type === 'ai'
                      ? 'glass-card text-white'
                      : 'bg-brand-400/10 border border-brand-400/30 text-brand-400'
                  }`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-surface-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                  <Brain className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="glass-card">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-6 py-4 border-t border-surface-700/40 relative z-20">
              <p className="text-surface-400 text-xs mb-3">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="pill hover:bg-brand-400/20 transition-colors text-xs relative z-30"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-surface-700/40">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask your AI advisor anything..."
                  className="input-modern w-full relative z-20"
                  disabled={isTyping}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative z-20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* AI Features Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-modern relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-brand-400" />
              <h3 className="font-semibold text-white">Memory Analysis</h3>
            </div>
            <p className="text-surface-400 text-sm">
              Advanced pattern recognition in your stored memories and emotional data.
            </p>
          </div>

          <div className="card-modern relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-brand-400" />
              <h3 className="font-semibold text-white">Smart Suggestions</h3>
            </div>
            <p className="text-surface-400 text-sm">
              Personalized recommendations for capsule creation and milestone tracking.
            </p>
          </div>

          <div className="card-modern relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-brand-400" />
              <h3 className="font-semibold text-white">Neural Insights</h3>
            </div>
            <p className="text-surface-400 text-sm">
              Deep learning analysis of your personal growth and life patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
