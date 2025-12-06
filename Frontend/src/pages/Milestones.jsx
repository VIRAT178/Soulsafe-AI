import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { milestoneAPI } from '../services/api.jsx';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Trophy,
  Users,
  Briefcase,
  Heart,
  Star,
  Plus,
  ExternalLink,
  X,
  Zap,
  Target,
  Award,
  Crown,
  Shield,
  Brain,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

const Milestones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
     type: 'life_milestone',
    event: '',
    date: '',
     significance: 'medium',
    details: ''
  });


  // AI milestone suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    fetchMilestones();
    checkConnectedAccounts();
    fetchAiSuggestions();
  }, []);

  // Fetch real milestones from backend
  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const { data } = await milestoneAPI.getHistory();
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI milestone suggestions
  const fetchAiSuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { analyticsAPI } = await import('../services/api.jsx');
      const aiRes = await analyticsAPI.getInsights('30d');
      if (aiRes.data && aiRes.data.insights && aiRes.data.insights.predictions && aiRes.data.insights.predictions.recommendedActions) {
        setAiSuggestions(aiRes.data.insights.predictions.recommendedActions);
      } else {
        setAiSuggestions([]);
        setAiError('No AI suggestions available');
      }
    } catch (err) {
      setAiSuggestions([]);
      setAiError('Failed to load AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  // ...existing code...

  const checkConnectedAccounts = async () => {
    // Check neural network connections
    setConnectedAccounts({
      neural_net: true,
      quantum_vault: false,
      ai_matrix: true,
      memory_bank: false,
      social_graph: false
    });
  };

  const handleConnectSocial = async (platform) => {
    try {
      // In a real implementation, this would open OAuth flow
      toast.success(`${platform} connection initiated`);
      // Simulate connection
      setConnectedAccounts(prev => ({
        ...prev,
        [platform]: true
      }));
    } catch (error) {
      toast.error(`Failed to connect ${platform}`);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      const response = await milestoneAPI.addManual(newMilestone);
      console.log('Milestone added:', response);
      toast.success('Milestone added successfully');
      setShowAddModal(false);
      setNewMilestone({
        type: 'life_milestone',
        event: '',
        date: '',
        significance: 'medium',
        details: ''
      });
      fetchMilestones();
    } catch (error) {
      console.error('Failed to add milestone:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add milestone';
      toast.error(errorMessage);
    }
  };

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'social_milestone':
        return <Users className="w-5 h-5" />;
      case 'career_milestone':
      case 'professional_milestone':
        return <Briefcase className="w-5 h-5" />;
      case 'education_milestone':
        return <Star className="w-5 h-5" />;
      case 'relationship_milestone':
        return <Heart className="w-5 h-5" />;
      case 'life_milestone':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getSignificanceColor = (significance) => {
    switch (significance) {
      case 'high':
        return 'bg-brand-600/20 text-brand-300 border-brand-500/30';
      case 'medium':
        return 'bg-brand-500/20 text-brand-400 border-brand-500/30';
      case 'low':
        return 'bg-surface-700/60 text-surface-300 border-surface-600/30';
      default:
        return 'bg-surface-700/60 text-surface-300 border-surface-600/30';
    }
  };

  const neuralPlatforms = [
    { name: 'neural_net', label: 'Neural Network', color: 'bg-brand-600', icon: Brain },
    { name: 'quantum_vault', label: 'Quantum Vault', color: 'bg-brand-500', icon: Shield },
    { name: 'ai_matrix', label: 'AI Matrix', color: 'bg-brand-600', icon: Zap },
    { name: 'memory_bank', label: 'Memory Bank', color: 'bg-brand-500', icon: Trophy },
    { name: 'social_graph', label: 'Social Graph', color: 'bg-brand-600', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center animate-float">
          <Brain className="w-12 h-12 text-brand-400 animate-pulse mx-auto mb-4" />
          <p className="text-white">Loading Achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-brand-600/30 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-to-tl from-brand-500/25 to-brand-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/40 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mr-3 shadow-glow-sm ring-1 ring-white/10">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-surface-400 text-sm hidden sm:block">Milestones</div>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-surface-400 hover:text-brand-400 transition-colors duration-300 rounded-xl2 hover:bg-surface-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">
            Life Milestones
          </h1>
          <p className="text-surface-400 text-sm sm:text-base">
            Track your achievements and celebrate life's important moments
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Add Milestone
          </button>
        </div>

        {/* Connected Platforms */}
        <div className="card-modern mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-400" />
            Connected Platforms
          </h2>
          <p className="text-surface-400 mb-6">Connect platforms to automatically track achievements</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {neuralPlatforms.map((platform) => (
              <div key={platform.name} className="glass-card p-4 hover:border-brand-500/40 transition-all hover:shadow-glow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 ${platform.color} rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10 flex-shrink-0`}>
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white text-sm truncate">{platform.label}</span>
                  </div>
                  {connectedAccounts[platform.name] ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                      <span className="text-brand-400 text-xs sm:text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial(platform.name)}
                      className="text-brand-400 text-xs sm:text-sm font-medium hover:text-brand-300 transition-colors flex-shrink-0"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Timeline */}
        <div className="card-modern mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary-400" />
            Achievement Timeline
          </h2>
          {loading ? (
            <div className="text-center py-12 animate-float">
              <Brain className="w-12 h-12 text-primary-400 animate-pulse mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Loading Achievements</h3>
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Achievements Yet</h3>
              <p className="text-surface-400 mb-4">Connect platforms or add achievements manually</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 glass-card hover:border-brand-500/40 transition-all hover:shadow-glow-sm group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10 group-hover:scale-110 transition-transform">
                    {milestone.unlocked ? (
                      <Unlock className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm sm:text-base">{milestone.event}</h3>
                      <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${
                        getSignificanceColor(milestone.significance)
                      }`}>
                        {milestone.significance}
                      </span>
                      {milestone.platform && <span className="text-xs sm:text-sm text-brand-400 font-medium">{milestone.platform}</span>}
                      {milestone.unlocked && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
                          <span className="text-brand-400 text-xs font-medium">Unlocked</span>
                        </div>
                      )}
                    </div>
                    <p className="text-surface-300 text-sm mb-2">{milestone.details}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-surface-500">
                      <span>{milestone.date ? new Date(milestone.date).toLocaleDateString() : 'N/A'}</span>
                      <span>Added: {milestone.addedAt ? new Date(milestone.addedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Milestone Suggestions */}
        <div className="card-modern mb-8 ring-2 ring-brand-500/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            AI Milestone Suggestions
          </h2>
          {aiLoading ? (
            <div className="text-center py-8 animate-float">
              <Brain className="w-8 h-8 text-brand-400 animate-pulse mx-auto mb-2" />
              <p className="text-white text-sm">Analyzing your achievements...</p>
            </div>
          ) : aiError ? (
            <p className="text-red-400 text-sm">{aiError}</p>
          ) : aiSuggestions.length > 0 ? (
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 sm:p-4 glass-card hover:border-brand-500/40 transition-colors">
                  <Sparkles className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <p className="text-surface-200 text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-sm">No AI suggestions available.</p>
          )}
        </div>
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-surface-900/95 backdrop-blur-xl border border-brand-500/30 rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-2xl shadow-brand-500/20 relative max-h-[90vh] overflow-y-auto">
              {/* Gradient decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent"></div>
            
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-bold gradient-text">Add Milestone</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-surface-400 hover:text-white transition-colors p-2 hover:bg-surface-800/60 rounded-xl2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
            <form onSubmit={handleAddMilestone}>
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">Achievement Type</label>
                  <select
                    value={newMilestone.type}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, type: e.target.value }))}
                      className="input-modern w-full"
                  >
                      <option value="life_milestone">Life Milestone</option>
                      <option value="career_milestone">Career Milestone</option>
                      <option value="professional_milestone">Professional Milestone</option>
                      <option value="education_milestone">Education Milestone</option>
                      <option value="relationship_milestone">Relationship Milestone</option>
                      <option value="social_milestone">Social Milestone</option>
                      <option value="content_milestone">Content Milestone</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Event Description</label>
                  <input
                    type="text"
                    value={newMilestone.event}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, event: e.target.value }))}
                      className="input-modern w-full"
                      placeholder="e.g., Graduated from University"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Event Date</label>
                  <input
                    type="date"
                    value={newMilestone.date}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                      className="input-modern w-full"
                    required
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Significance Level</label>
                  <select
                    value={newMilestone.significance}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, significance: e.target.value }))}
                      className="input-modern w-full"
                  >
                      <option value="low">Low - Standard Achievement</option>
                      <option value="medium">Medium - Notable Achievement</option>
                      <option value="high">High - Critical Achievement</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">Details <span className="text-dark-400 text-xs">(Optional)</span></label>
                  <textarea
                    value={newMilestone.details}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, details: e.target.value }))}
                      className="input-modern w-full resize-none"
                      rows="4"
                      placeholder="Additional details about this achievement..."
                  />
                </div>
              </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                    className="btn-secondary w-full sm:w-auto"
                >
                    Cancel
                </button>
                <button
                  type="submit"
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Milestones;
