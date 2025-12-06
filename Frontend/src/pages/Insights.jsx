import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { analyticsAPI, capsuleAPI } from '../services/api.jsx';
import { toast } from 'react-hot-toast';
import {
  Brain,
  Heart,
  TrendingUp,
  Activity,
  Zap,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  X,
  Filter,
  Download,
  Loader,
  AlertCircle,
  RefreshCw,
  Archive,
  Cpu
} from 'lucide-react';

const Insights = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('emotions');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch real analytics data
  const fetchAnalytics = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      
      const response = await analyticsAPI.getInsights(timeRange);
      
      console.log('[Insights] Analytics response:', response.data);
      
      if (response.data.success) {
        setAnalyticsData(response.data.insights);
        console.log('[Insights] Emotion data:', response.data.insights.emotions);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load insights');
      
      // Fallback to demo data if API fails
      setAnalyticsData({
        summary: {
          totalCapsules: 0,
          totalMemories: 0,
          aiInsights: 0,
          futureUnlocks: 0
        },
        emotions: {
          happiness: 0,
          excitement: 0,
          nostalgia: 0,
          gratitude: 0,
          love: 0,
          anxiety: 0,
          sadness: 0,
          neutral: 100
        },
        patterns: {
          mostActiveDay: 'N/A',
          mostActiveTime: 'N/A',
          averageWordsPerMemory: 0,
          memoryFrequency: 'No data',
          topCategories: []
        },
        timeline: [],
        predictions: {
          nextMilestone: 'Create your first memory capsule to unlock insights',
          emotionalTrend: 'No data available yet',
          recommendedActions: [
            'Create your first memory capsule',
            'Add emotional content to unlock AI analysis',
            'Set up future unlock dates'
          ]
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handleAnalyzeAll = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const response = await capsuleAPI.analyzeAll();
      
      if (response.data.success) {
        toast.success(`Analysis complete! Analyzed: ${response.data.analyzed}, Skipped: ${response.data.skipped}, Total: ${response.data.total}`, {
          duration: 4000
        });
        
        // Refresh analytics after analysis
        fetchAnalytics(true);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      console.error('Batch analysis error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to analyze capsules';
      setError(errorMsg);
      toast.error(`Analysis Error: ${errorMsg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const getEmotionColor = (emotion, value) => {
    if (value > 70) return 'text-brand-400';
    if (value > 40) return 'text-brand-300';
    return 'text-red-400'; // keep red for low values as alert color
  };

  const getEmotionBarWidth = (value) => {
    return `${Math.min(value, 100)}%`;
  };

  const handleExport = () => {
    if (!analyticsData) {
      toast.error('No data available to export');
      return;
    }

    try {
      // Create export data with timestamp
      const exportData = {
        exportedAt: new Date().toISOString(),
        timeRange,
        user: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email
        },
        analytics: analyticsData
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soulsafe-insights-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      toast.success('Analytics data downloaded successfully!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export data');
    }
  };

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
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-brand-400 text-sm hidden sm:block">AI Insights</div>
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

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">AI Insights</h1>
          <p className="text-surface-400 text-sm">AI analysis of memory patterns and emotional data</p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative z-10">
          <div className="flex gap-4 flex-wrap">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
              className="input-modern disabled:opacity-50 relative z-10"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 relative z-10"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button 
              onClick={handleAnalyzeAll}
              disabled={analyzing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 relative z-10"
              title="Analyze all capsules with AI to generate emotion insights"
            >
              <Cpu className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
              {analyzing ? 'Analyzing...' : 'AI Analyze'}
            </button>
            
            <button 
              onClick={handleExport}
              disabled={loading || !analyticsData}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
              title="Export analytics data as JSON"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              Error: {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-4 text-brand-400">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="text-lg">Analyzing neural patterns...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && analyticsData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
              <div className="card-modern relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Archive className="w-6 h-6 text-brand-400" />
                  <span className="text-2xl font-bold text-brand-400">{analyticsData.summary.totalCapsules}</span>
                </div>
                <p className="text-surface-400 text-sm uppercase">Capsules</p>
              </div>
              
              <div className="card-modern relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-6 h-6 text-brand-400" />
                  <span className="text-2xl font-bold text-brand-400">{analyticsData.summary.totalMemories}</span>
                </div>
                <p className="text-surface-400 text-sm uppercase">Memories</p>
              </div>
              
              <div className="card-modern relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-6 h-6 text-brand-400" />
                  <span className="text-2xl font-bold text-brand-400">{analyticsData.summary.aiInsights}</span>
                </div>
                <p className="text-surface-400 text-sm uppercase">AI Insights</p>
              </div>
              
              <div className="card-modern relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-6 h-6 text-brand-400" />
                  <span className="text-2xl font-bold text-brand-400">{analyticsData.summary.futureUnlocks}</span>
                </div>
                <p className="text-surface-400 text-sm uppercase">Future Unlocks</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emotion Analysis */}
          <div className="lg:col-span-2 relative z-10">
            <div className="card-modern mb-8 relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Emotion Analysis</h3>
              
              {/* Show warning if no AI insights */}
              {analyticsData.summary.aiInsights === 0 && (
                <div className="mb-6 p-4 glass-card border border-brand-400/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Cpu className="w-5 h-5 text-brand-400" />
                    <span className="text-brand-400 font-semibold">No AI Analysis Detected</span>
                  </div>
                  <p className="text-surface-300 text-sm">
                    Click the <span className="text-brand-400">AI Analyze</span> button above to analyze your capsules and generate emotion insights.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {Object.entries(analyticsData.emotions || {}).map(([emotion, value]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-surface-400 capitalize tracking-wider text-sm w-28">
                        {emotion}
                      </span>
                      <div className="flex-1 bg-surface-800 rounded-xl2 h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 bg-gradient-to-r from-brand-600 to-brand-500`}
                          style={{ width: getEmotionBarWidth(value) }}
                        />
                      </div>
                    </div>
                    <span className="font-bold ml-4 text-brand-400">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Timeline */}
            <div className="card-modern relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Memory Timeline</h3>
              <div className="space-y-4">
                {analyticsData.timeline && analyticsData.timeline.length > 0 ? (
                  analyticsData.timeline.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-4 glass-card">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-brand-400" />
                      <div>
                        <span className="text-white">{period.date}</span>
                        <p className="text-surface-400 text-sm">{period.memories} memories created</p>
                      </div>
                    </div>
                    <div className="pill">
                      {period.emotions.replace('_', ' ')}
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                    <p className="text-surface-400">No timeline data</p>
                    <p className="text-surface-500 text-sm mt-2">Create more memories to see patterns</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6 relative z-10">
            {/* AI Predictions */}
            <div className="card-modern relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">AI Predictions</h3>
              <div className="space-y-4">
                <div className="p-3 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-400 text-xs font-semibold">Milestone Forecast</span>
                  </div>
                  <p className="text-surface-300 text-sm">
                    {analyticsData.predictions?.nextMilestone || 'No predictions available'}
                  </p>
                </div>
                
                <div className="p-3 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-400 text-xs font-semibold">Trend Analysis</span>
                  </div>
                  <p className="text-surface-300 text-sm">
                    {analyticsData.predictions?.emotionalTrend || 'No trend data available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="card-modern relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">Pattern Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 glass-card">
                  <span className="text-surface-400 text-sm">Active Day</span>
                  <span className="text-brand-400 text-sm font-semibold">{analyticsData.patterns?.mostActiveDay || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-card">
                  <span className="text-surface-400 text-sm">Active Time</span>
                  <span className="text-brand-400 text-sm font-semibold">{analyticsData.patterns?.mostActiveTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-card">
                  <span className="text-surface-400 text-sm">Avg Words</span>
                  <span className="text-brand-400 text-sm font-semibold">{analyticsData.patterns?.averageWordsPerMemory || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 glass-card">
                  <span className="text-surface-400 text-sm">Frequency</span>
                  <span className="text-brand-400 text-sm font-semibold">{analyticsData.patterns?.memoryFrequency || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card-modern relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {analyticsData.predictions?.recommendedActions?.map((action, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 glass-card hover:border-brand-400/30 transition-colors cursor-pointer">
                    <Zap className="w-4 h-4 text-brand-400" />
                    <span className="text-surface-300 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Topics */}
            <div className="card-modern relative z-10">
              <h3 className="text-lg font-bold text-white mb-4">Top Topics</h3>
              <div className="flex flex-wrap gap-2">
                {analyticsData.patterns?.topCategories && analyticsData.patterns.topCategories.length > 0 ? (
                  analyticsData.patterns.topCategories.map((topic, index) => (
                  <span
                    key={index}
                    className="pill"
                  >
                    #{topic}
                  </span>
                  ))
                ) : (
                  <div className="text-center py-4 w-full">
                    <p className="text-surface-400 text-sm">No topics detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Insights;
