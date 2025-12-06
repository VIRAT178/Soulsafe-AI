import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Brain,
  Heart,
  Lock,
  Activity,
  Calendar,
  Zap,
  Archive
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Neural interface operator',
    profilePicture: user?.profilePicture || null
  });
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePicture || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      // Backend only accepts firstName, lastName, and preferences
      // username and email updates not supported yet
      if (formData.profilePicture instanceof File) {
        data.append('profilePicture', formData.profilePicture);
      }
      
      const { data: res } = await import('../services/api.jsx').then(m => m.authAPI.updateProfile(data));
      toast.success('Profile updated successfully');
      
      // Update user context with new data
      if (res?.user) {
        setUser(res.user);
        // Update formData to reflect saved changes
        setFormData({
          ...formData,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          profilePicture: res.user.profilePicture
        });
        if (res.user.profilePicture) {
          setProfilePicPreview(res.user.profilePicture);
        }
      }
      setEditing(false);
    } catch (error) {
      toast.error('Profile update failed');
      console.error('Profile update error:', error);
    }
  };

  const [userStats, setUserStats] = useState({
    totalCapsules: 0,
    totalMemories: 0,
    aiAnalyses: 0,
    securityLevel: user?.subscription?.plan?.toUpperCase() || 'FREE',
    neuralActivity: 'HIGH',
    lastSync: user?.lastLogin || ''
  });

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await import('../services/api.jsx').then(m => m.capsuleAPI.getAll());
        const capsules = data.capsules || [];
        setUserStats({
          totalCapsules: capsules.length,
          totalMemories: capsules.reduce((acc, c) => acc + (c.content?.text ? 1 : 0), 0),
          aiAnalyses: capsules.reduce((acc, c) => acc + (c.content?.aiAnalysis?.emotions?.length || 0), 0),
          securityLevel: user?.subscription?.plan?.toUpperCase() || 'FREE',
          neuralActivity: 'HIGH',
          lastSync: user?.lastLogin || ''
        });
      } catch (err) {
        setUserStats({
          totalCapsules: 0,
          totalMemories: 0,
          aiAnalyses: 0,
          securityLevel: user?.subscription?.plan?.toUpperCase() || 'FREE',
          neuralActivity: 'HIGH',
          lastSync: user?.lastLogin || ''
        });
      }
    }
    fetchStats();
  }, [user]);

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
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-brand-400 text-sm">Neural Profile</div>
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
        <div className="mb-8">
          <h1 className="section-heading">Neural Profile</h1>
          <p className="text-surface-400 text-sm">Manage your identity and preferences</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 relative z-10">
            <div className="card-modern relative z-10">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mx-auto mb-4 shadow-glow ring-1 ring-white/10 overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                      alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                    <User className="w-12 h-12 text-white" style={{ display: 'none' }} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{user?.firstName} {user?.lastName}</h2>
                <p className="text-surface-400 text-sm">@{user?.username}</p>
                <div className="mt-3">
                  <span className="pill">
                    <span className="inline-flex w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
                    Neural Active
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-9 h-9 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                    <Mail className="w-4 h-4 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-surface-500 text-xs">Email</p>
                    <p className="text-white text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-9 h-9 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                    <Shield className="w-4 h-4 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-surface-500 text-xs">Security Level</p>
                    <p className="text-brand-400 text-sm font-semibold">{userStats.securityLevel}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-9 h-9 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5">
                    <Activity className="w-4 h-4 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-surface-500 text-xs">Neural Activity</p>
                    <p className="text-brand-400 text-sm font-semibold">{userStats.neuralActivity}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setEditing(!editing)}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {editing ? (
                  <>
                    <X className="w-5 h-5" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit3 className="w-5 h-5" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-2 relative z-10">
            {editing ? (
              <div className="card-modern relative z-10">
                <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {/* Profile Picture Upload */}
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, profilePicture: file });
                            const reader = new FileReader();
                            reader.onloadend = () => setProfilePicPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-surface-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl2 file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500 relative z-20 cursor-pointer"
                      />
                      {profilePicPreview && (
                        <img
                          src={profilePicPreview}
                          alt="Profile Preview"
                          className="w-16 h-16 rounded-xl2 border-2 border-brand-500 object-cover ring-1 ring-white/10"
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative z-20">
                      <label className="block text-sm font-medium text-surface-200 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input-modern w-full relative z-20"
                        placeholder="John"
                      />
                    </div>
                    <div className="relative z-20">
                      <label className="block text-sm font-medium text-surface-200 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input-modern w-full relative z-20"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="input-modern w-full opacity-50 cursor-not-allowed relative z-20"
                      placeholder="johndoe"
                    />
                    <p className="text-xs text-surface-500 mt-1">Username cannot be changed</p>
                  </div>
                  
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="input-modern w-full opacity-50 cursor-not-allowed relative z-20"
                      placeholder="you@example.com"
                    />
                    <p className="text-xs text-surface-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-surface-200 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="input-modern w-full relative z-20"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex gap-4 relative z-20">
                    <button
                      type="submit"
                      className="btn-primary flex-1 flex items-center justify-center gap-2 relative z-20"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 relative z-20"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="card-modern">
                  <h3 className="text-xl font-bold text-white mb-6">Your Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4 glass-card">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mx-auto mb-3 shadow-glow-sm ring-1 ring-white/10">
                        <Archive className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{userStats.totalCapsules}</div>
                      <div className="text-sm text-surface-400">Time Capsules</div>
                    </div>
                    <div className="text-center p-4 glass-card">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mx-auto mb-3 shadow-glow-sm ring-1 ring-white/10">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{userStats.totalMemories}</div>
                      <div className="text-sm text-surface-400">Memories</div>
                    </div>
                    <div className="text-center p-4 glass-card">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mx-auto mb-3 shadow-glow-sm ring-1 ring-white/10">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{userStats.aiAnalyses}</div>
                      <div className="text-sm text-surface-400">AI Analyses</div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="card-modern">
                  <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 glass-card">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-brand-400" />
                        <span className="text-surface-300">Last Sync</span>
                      </div>
                      <span className="text-white text-sm">{userStats.lastSync || 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 glass-card">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-brand-400" />
                        <span className="text-surface-300">Encryption</span>
                      </div>
                      <span className="text-brand-400 text-sm font-semibold">{userStats.securityLevel} Enabled</span>
                    </div>
                    <div className="flex items-center justify-between p-4 glass-card">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-brand-400" />
                        <span className="text-surface-300">Neural Status</span>
                      </div>
                      <span className="text-brand-400 text-sm font-semibold">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
                          {userStats.neuralActivity} Activity
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;