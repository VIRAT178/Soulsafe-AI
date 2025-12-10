import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  Brain,
  Heart,
  Calendar,
  Lock,
  Sparkles,
  Plus,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  Clock,
  Archive,
  Zap,
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState([]);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [aiPreview, setAiPreview] = React.useState(null);
  const [aiLoading, setAiLoading] = React.useState(true);
  const [aiError, setAiError] = React.useState(null);

  React.useEffect(() => {
    async function fetchStatsAndAI() {
      try {
        // Fetch capsules for stats and activity
        const { data } = await import('../services/api.jsx').then(m => m.capsuleAPI.getAll());
        console.log('Dashboard: Fetched capsules data:', data);
        const capsules = data.capsules || [];
        console.log('Dashboard: Capsules array:', capsules);
        setStats([
          {
            title: 'Time Capsules',
            value: capsules.length,
            change: '',
            icon: Archive,
            color: 'from-purple-500 to-pink-500',
            link: '/capsules'
          },
          {
            title: 'AI Insights',
            value: capsules.reduce((acc, c) => acc + (c.content?.aiAnalysis?.emotions?.length || 0), 0),
            change: '',
            icon: Brain,
            color: 'from-blue-500 to-cyan-500',
            link: '/insights'
          },
          {
            title: 'Memories Stored',
            value: capsules.reduce((acc, c) => acc + (c.content?.text ? 1 : 0), 0),
            change: '',
            icon: Heart,
            color: 'from-green-500 to-emerald-500',
            link: '/capsules'
          },
          {
            title: 'Future Unlocks',
            value: capsules.filter(c => c.unlockConditions?.type === 'date' && !c.unlockConditions?.isUnlocked).length,
            change: '',
            icon: Clock,
            color: 'from-orange-500 to-red-500',
            link: '/milestones'
          }
        ]);
        const activityData = capsules.slice(0, 3).map((c, idx) => ({
          id: c._id || idx,
          type: c.status,
          title: c.title || 'Untitled Capsule',
          description: c.description || 'No description',
          time: c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Recently created',
          icon: Archive,
          color: 'text-brand-400'
        }));
        console.log('Dashboard: Recent activity:', activityData);
        setRecentActivity(activityData);

        // Fetch AI insights preview (summary, emotions, suggestions, etc)
        setAiLoading(true);
        setAiError(null);
        const { analyticsAPI } = await import('../services/api.jsx');
        const aiRes = await analyticsAPI.getInsights('30d');
        if (aiRes.data && aiRes.data.success) {
          setAiPreview(aiRes.data.insights);
        } else {
          setAiPreview(null);
          setAiError('No AI insights available');
        }
      } catch (err) {
        setAiPreview(null);
        setAiError('Failed to load AI insights');
      } finally {
        setAiLoading(false);
      }
    }
    fetchStatsAndAI();
  }, []);

  const quickActions = [
    {
      title: 'Create Capsule',
      description: 'Store new memories',
      icon: Plus,
      color: 'from-brand-600 to-brand-500',
      action: () => navigate('/capsules/create')
    },
    {
      title: 'AI Chat',
      description: 'Talk to your AI advisor',
      icon: MessageCircle,
      color: 'from-brand-600 to-brand-500',
      action: () => navigate('/chat')
    },
    {
      title: 'View Insights',
      description: 'Analyze your data',
      icon: BarChart3,
      color: 'from-brand-600 to-brand-500',
      action: () => navigate('/insights')
    },
    {
      title: 'Milestones',
      description: 'Track achievements',
      icon: Calendar,
      color: 'from-brand-600 to-brand-500',
      action: () => navigate('/milestones')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-surface-400 text-sm sm:text-base">
            Here's what's happening with your memories today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => navigate(stat.link)}
              className="card-modern text-left hover:scale-[1.02] transition-transform cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10`}>
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-surface-400 text-sm mb-2">{stat.title}</p>
              <div className="divider my-3"></div>
              <span className="text-xs text-brand-400 font-medium">View Details →</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="card-modern text-left group p-5 sm:p-6"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl2 flex items-center justify-center mb-4 shadow-glow-sm ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-surface-400 text-sm">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
            <div className="card-modern overflow-hidden p-0">
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Archive className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                      <p className="text-surface-400 text-sm">No capsules yet</p>
                      <button
                        onClick={() => navigate('/capsules/create')}
                        className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                      >
                        Create your first capsule →
                      </button>
                    </div>
                  ) : recentActivity.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => navigate(`/capsules/${activity.id}`)}
                      className="w-full flex items-start gap-3 sm:gap-4 p-3 sm:p-4 glass-card hover:border-brand-500/40 transition-all duration-300 text-left cursor-pointer group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center flex-shrink-0 shadow-glow-sm ring-1 ring-white/10">
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm group-hover:text-brand-300 transition-colors truncate">{activity.title}</h4>
                        <p className="text-surface-400 text-xs mt-1 line-clamp-2">{activity.description}</p>
                        <p className="text-surface-500 text-xs mt-2">{activity.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-surface-800/40 border-t border-surface-700/40">
                <button
                  onClick={() => navigate('/capsules')}
                  className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                >
                  View All Activity →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Preview (Dynamic) */}
        <div className="mt-6 sm:mt-8">
          <div className="card-modern p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-brand-400" />
                  AI Insights
                </h2>
                <p className="text-surface-400 text-sm">{aiLoading ? 'Loading AI analysis...' : aiError ? aiError : 'AI analysis of your recent activity'}</p>
              </div>
              <button
                onClick={() => navigate('/insights')}
                className="btn-primary flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                View Full Analysis
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Emotion Scan */}
              <div className="glass-card p-4 sm:p-5 hover:border-brand-500/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">Emotions</span>
                </div>
                {aiLoading ? (
                  <p className="text-surface-400 text-sm">Loading...</p>
                ) : aiPreview && aiPreview.emotions ? (
                  <div className="space-y-3">
                    {Object.entries(aiPreview.emotions).slice(0, 5).map(([emotion, value]) => (
                      <div key={emotion}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-surface-300 text-xs capitalize">{emotion}</span>
                          <span className="text-brand-400 text-xs font-bold">{value}%</span>
                        </div>
                        <div className="w-full bg-surface-700/60 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-brand-600 to-brand-400 h-1.5 rounded-full transition-all duration-500" style={{width: `${value}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-surface-400 text-sm">No emotion data</p>
                )}
              </div>
              {/* Security Status (Dynamic) */}
              <div className="glass-card p-4 sm:p-5 hover:border-brand-500/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">Security</span>
                </div>
                {aiLoading ? (
                  <p className="text-surface-400 text-sm">Loading...</p>
                ) : aiPreview && (aiPreview.securityStatus || aiPreview.summary || aiPreview.patterns) ? (
                  <>
                    {aiPreview.securityStatus ? (
                      <p className="text-brand-400 text-sm">{aiPreview.securityStatus}</p>
                    ) : aiPreview.summary && aiPreview.summary.encryptionLevel ? (
                      <p className="text-surface-300 text-sm">Encryption: <span className="text-brand-400 font-semibold">{aiPreview.summary.encryptionLevel.toUpperCase()}</span></p>
                    ) : aiPreview.summary ? (
                      <p className="text-surface-300 text-sm">Encryption active. {aiPreview.summary.totalCapsules} capsules secured.</p>
                    ) : (
                      <p className="text-surface-400 text-sm">No security data</p>
                    )}
                  </>
                ) : (
                  <p className="text-surface-400 text-sm">No security data</p>
                )}
              </div>
              {/* AI Suggestions */}
              <div className="glass-card p-4 sm:p-5 hover:border-brand-500/40 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">Suggestions</span>
                </div>
                {aiLoading ? (
                  <p className="text-surface-400 text-sm">Loading...</p>
                ) : aiPreview && aiPreview.predictions && aiPreview.predictions.recommendedActions ? (
                  <ul className="space-y-2">
                    {aiPreview.predictions.recommendedActions.slice(0, 4).map((action, idx) => (
                      <li key={idx} className="text-surface-300 text-sm flex items-start gap-2">
                        <span className="text-brand-400 mt-0.5 font-bold">•</span>
                        <span className="flex-1">{action}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-surface-400 text-sm">No suggestions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;