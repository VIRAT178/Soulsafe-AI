import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Heart,
  Brain,
  Clock,
  Archive,
  Zap,
  Shield,
  X
} from 'lucide-react';

const Capsules = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [filterStatus, setFilterStatus] = useState('all');

  const [capsules, setCapsules] = useState([]);
  // Fetch capsules
  React.useEffect(() => {
    async function fetchCapsules() {
      try {
        const { data } = await import('../services/api.jsx').then(m => m.capsuleAPI.getAll());
        setCapsules(data.capsules || []);
      } catch (err) {
        setCapsules([]);
      }
    }
    fetchCapsules();
  }, []);

  // Sync search query from URL param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearchQuery(q);
  }, [location.search]);

  const filteredCapsules = capsules.filter(capsule => {
    const matchesSearch = capsule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capsule.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || capsule.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'locked': return <Lock className="w-5 h-5 text-red-400" />;
      case 'unlocked': return <Unlock className="w-5 h-5 text-brand-400" />;
      case 'processing': return <Brain className="w-5 h-5 text-blue-400 animate-pulse" />;
      default: return <Archive className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'locked': return 'border-red-400/30 shadow-red-400/10';
      case 'unlocked': return 'border-brand-400/30 shadow-brand-400/10';
      case 'processing': return 'border-blue-400/30 shadow-blue-400/10';
      default: return 'border-gray-400/30 shadow-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-dark">
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
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-surface-300 text-sm hidden sm:block">Memory Vault</div>
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
          <h1 className="section-heading">Memory Vault</h1>
          <p className="text-surface-400 text-sm sm:text-base">Your encrypted time capsules and precious memories</p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern w-full pl-10"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-modern w-full"
            >
              <option value="all">All Capsules</option>
              <option value="locked">Locked</option>
              <option value="unlocked">Unlocked</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Create Button */}
          <Link
            to="/capsules/create"
            className="btn-primary flex items-center justify-center gap-2 hover:shadow-glow"
          >
            <Plus className="w-5 h-5" />
            Create Capsule
          </Link>
        </div>

        {/* Capsules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map(capsule => {
            const capsuleId = capsule._id || capsule.id || '';
            const encryptionLevel = capsule.privacy?.encryptionLevel || 'quantum';
            const unlockDate = capsule.unlockConditions?.unlockDate 
              ? new Date(capsule.unlockConditions.unlockDate).toLocaleDateString()
              : 'Not set';
            const memoryCount = capsule.content?.files?.length || 0;
            const aiAnalysis = capsule.aiAnalysis?.summary || capsule.content?.aiAnalysis?.summary || 'No analysis yet';
            const createdDate = capsule.createdAt 
              ? new Date(capsule.createdAt).toLocaleDateString()
              : 'Unknown';
            
            return (
              <div
                key={capsuleId}
                className="card-modern cursor-pointer group hover:scale-[1.02] hover:shadow-glow-sm transition-all duration-300"
                onClick={() => navigate(`/capsules/${capsuleId}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10 ${
                      capsule.status === 'locked' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                      capsule.status === 'unlocked' ? 'bg-gradient-to-br from-brand-600 to-brand-500' :
                      capsule.status === 'processing' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {capsule.status === 'locked' && <Lock className="w-5 h-5 text-white" />}
                      {capsule.status === 'unlocked' && <Unlock className="w-5 h-5 text-white" />}
                      {capsule.status === 'processing' && <Brain className="w-5 h-5 text-white animate-pulse" />}
                      {!['locked', 'unlocked', 'processing'].includes(capsule.status) && <Archive className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base group-hover:text-brand-300 transition-colors">
                        {capsule.title || 'Untitled Capsule'}
                      </h3>
                      <p className="text-surface-400 text-xs capitalize">
                        {(capsule.status || 'draft')}
                      </p>
                    </div>
                  </div>
                  <div className="text-dark-500 text-xs">
                    #{capsuleId.slice(-3)}
                  </div>
                </div>

                {/* Description */}
                <p className="text-surface-400 text-sm mb-4 line-clamp-2">
                  {capsule.description || 'No description provided'}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-surface-500">Memories</span>
                    <span className="text-brand-400 font-medium">{memoryCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-surface-500">Encryption</span>
                    <span className="text-brand-300 font-medium capitalize">{encryptionLevel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-surface-500">Unlock Date</span>
                    <span className="text-brand-200">{unlockDate}</span>
                  </div>
                </div>

                {/* AI Analysis & Tags */}
                <div className="p-3 bg-surface-800/60 border border-surface-700/40 rounded-xl2 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-400 text-xs font-medium">AI Analysis</span>
                  </div>
                  <p className="text-surface-400 text-xs line-clamp-2">
                    {aiAnalysis}
                  </p>
                  {/* AI Tags */}
                  {((capsule.aiAnalysis && capsule.aiAnalysis.tags) || (capsule.content && capsule.content.aiAnalysis && capsule.content.aiAnalysis.tags)) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(capsule.aiAnalysis?.tags || capsule.content?.aiAnalysis?.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-400 text-[10px] tracking-wide"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-surface-500" />
                    <span className="text-surface-500 text-[10px]">{createdDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {capsule.status === 'unlocked' && (
                      <Eye className="w-4 h-4 text-brand-400" />
                    )}
                    <Shield className="w-4 h-4 text-brand-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCapsules.length === 0 && (
          <div className="text-center py-16">
            <div className="card-modern max-w-md mx-auto p-8">
              <Archive className="w-16 h-16 text-surface-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Capsules Found</h3>
              <p className="text-surface-400 mb-6">No memory capsules match your search criteria.</p>
              <Link to="/capsules/create" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Capsule
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capsules;