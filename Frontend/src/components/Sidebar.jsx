import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  LayoutDashboard,
  Archive,
  Plus,
  Brain,
  BarChart3,
  Trophy,
  User,
  Settings,
  LogOut,
  Heart,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Neural Dashboard', icon: LayoutDashboard, path: '/dashboard', label: '[DASHBOARD]' },
    { title: 'Memory Vault', icon: Archive, path: '/capsules', label: '[MEMORY_VAULT]' },
    { title: 'Create Capsule', icon: Plus, path: '/capsules/create', label: '[CREATE]' },
    { title: 'Neural Analysis', icon: Brain, path: '/insights', label: '[INSIGHTS]' },
    { title: 'Achievements', icon: Trophy, path: '/milestones', label: '[ACHIEVEMENTS]' },
    { title: 'Neural Profile', icon: User, path: '/profile', label: '[PROFILE]' }
  ];

  return (
    <div className="hidden lg:block w-64 h-screen fixed left-0 top-0 bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/40 shadow-card">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br from-brand-600/25 to-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-brand-500/20 to-brand-700/10 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="w-11 h-11 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mr-3 shadow-glow-sm ring-1 ring-white/10">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">SoulSafe.AI</h1>
        </div>
        
        {/* User Info */}
        <div className="mb-6 p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
              {user?.profilePicture ? (
                <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                  alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
                <User className="w-5 h-5 text-white" style={{ display: 'none' }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
                <span className="text-surface-400 text-xs">Active</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2 flex-1 overflow-y-auto pr-1">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl2 bg-surface-800/60 border border-surface-700/40 hover:border-brand-500/40 hover:bg-surface-700/60 transition-all duration-300 group text-left"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-surface-700 to-surface-800 rounded-xl2 flex items-center justify-center ring-1 ring-white/5 group-hover:ring-brand-500/40 group-hover:shadow-glow-sm">
                  <IconComponent className="w-5 h-5 text-brand-300 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="text-surface-300 text-sm font-medium group-hover:text-white">{item.title}</span>
                  <span className="text-brand-400 text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom Actions */}
      <div className="absolute bottom-0 w-full p-5 space-y-3 bg-gradient-to-t from-surface-900/90 via-surface-900/60 to-transparent">
        <button
          onClick={() => navigate('/settings')}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-sm font-medium"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl2 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium text-sm hover:from-red-500 hover:to-red-400 transition-all duration-300 shadow-glow-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;