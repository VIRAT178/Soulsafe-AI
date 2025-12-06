import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  Sparkles, 
  MessageCircle, 
  Brain, 
  Lock, 
  Calendar, 
  Heart,
  Send,
  User,
  Bot,
  ArrowRight,
  Star,
  Shield
} from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: "Hey Emon...",
      time: "6:30 pm",
      avatar: "🤖"
    },
    {
      id: 2,
      type: 'user',
      message: "Yeah, Fine",
      time: "6:40 pm"
    },
    {
      id: 3,
      type: 'user',
      message: "What about you?",
      time: "6:40 pm"
    },
    {
      id: 4,
      type: 'bot',
      message: "Hey I wanted to know that about your experience on UI/UX part.",
      time: "6:41 pm",
      avatar: "🤖"
    },
    {
      id: 5,
      type: 'user',
      message: "Yes, I have experience of 3+ year on ui/ux",
      time: "6:43 pm"
    }
  ]);

  const [email, setEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleJoinBeta = () => {
    if (email) {
      navigate('/register', { state: { email } });
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full filter blur-[120px] animate-float"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-700/15 rounded-full filter blur-[120px] animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left side - Main content */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 sm:py-16 lg:py-8">
          <div className="max-w-2xl mx-auto lg:mx-0 w-full">
            {/* Logo/Brand */}
            <div className="flex items-center mb-10 lg:mb-12">
              <div className="w-11 h-11 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-500/30">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SoulSafe<span className="text-brand-400">.AI</span></span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Your Memories,</span>
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Secured Forever</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-surface-400 mb-8 leading-relaxed max-w-lg">
              AI-powered memory vault that keeps your precious moments safe and helps you discover insights you never knew existed.
            </p>

            {/* Email signup */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern flex-1"
              />
              <button
                onClick={handleJoinBeta}
                className="btn-primary px-8 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Login link */}
            <div className="flex items-center gap-2 mb-12">
              <span className="text-surface-400 text-sm">Already have an account?</span>
              <button
                onClick={handleLogin}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors text-sm"
              >
                Sign In →
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: Brain, label: 'AI Analysis', color: 'blue' },
                { icon: Lock, label: 'Secure Vault', color: 'green' },
                { icon: Calendar, label: 'Time Capsule', color: 'purple' },
                { icon: Sparkles, label: 'Smart Insights', color: 'orange' }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center group cursor-pointer">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-${feature.color}-500/30 transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm text-surface-300 font-medium group-hover:text-white transition-colors">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Mobile/Tablet Preview Cards - Show below features on smaller screens */}
            <div className="mt-12 lg:hidden space-y-4">
              {/* AI Assistant Card */}
              <div className="card-modern p-4 hover:shadow-glow-sm transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">AI Analysis</h4>
                    <p className="text-surface-400 text-xs">Smart insights</p>
                  </div>
                </div>
                <p className="text-surface-400 text-sm leading-relaxed">
                  Intelligent AI analyzes your memories and provides personalized recommendations.
                </p>
              </div>

              {/* Security Card */}
              <div className="card-modern p-4 hover:shadow-glow-sm transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Secure Vault</h4>
                    <p className="text-surface-400 text-xs">Military-grade encryption</p>
                  </div>
                </div>
                <p className="text-surface-400 text-sm leading-relaxed">
                  Your memories are protected with advanced encryption and zero-knowledge architecture.
                </p>
              </div>

              {/* Time Capsule Card */}
              <div className="card-modern p-4 hover:shadow-glow-sm transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Time Capsule</h4>
                    <p className="text-surface-400 text-xs">Schedule memories</p>
                  </div>
                </div>
                <p className="text-surface-400 text-sm leading-relaxed">
                  Create scheduled messages that unlock at the perfect moment for future generations.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right side - Preview Cards */}
        <div className="hidden lg:flex flex-col justify-center px-6 lg:w-96 xl:w-[420px] gap-5">
          {/* AI Assistant Card */}
          <div className="card-modern p-5 hover:shadow-glow-sm transition-all duration-300 group border-brand-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">AI Analysis</h4>
                <p className="text-surface-400 text-xs">Smart insights</p>
              </div>
            </div>
            <p className="text-surface-400 text-sm leading-relaxed">
              Intelligent AI analyzes your memories and provides personalized recommendations.
            </p>
          </div>

          {/* Security Card */}
          <div className="card-modern p-5 hover:shadow-glow-sm transition-all duration-300 group border-brand-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Secure Vault</h4>
                <p className="text-surface-400 text-xs">Military-grade encryption</p>
              </div>
            </div>
            <p className="text-surface-400 text-sm leading-relaxed">
              Your memories are protected with advanced encryption and zero-knowledge architecture.
            </p>
          </div>

          {/* Time Capsule Card */}
          <div className="card-modern p-5 hover:shadow-glow-sm transition-all duration-300 group border-brand-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Time Capsule</h4>
                <p className="text-surface-400 text-xs">Schedule memories</p>
              </div>
            </div>
            <p className="text-surface-400 text-sm leading-relaxed">
              Create scheduled messages that unlock at the perfect moment for future generations.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          50% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px); }
          20% { transform: translateX(2px); }
          30% { transform: translateX(-1px); }
          40% { transform: translateX(1px); }
          50% { transform: translateX(0); }
        }
        
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-glitch {
          animation: glitch 0.3s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        /* Matrix-style text shadow */
        .text-glow {
          text-shadow: 0 0 10px currentColor;
        }
        
        /* Cyber border glow effect */
        .border-glow {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }
        
        /* Ensure proper spacing on mobile */
        @media (max-width: 768px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: 100dvh;
          }
        }
        
        /* Prevent horizontal scroll on mobile */
        body {
          overflow-x: hidden;
          background: #000;
        }
        
        /* Custom scrollbar for terminal */
        .terminal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 2px;
        }
        .terminal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Welcome;
