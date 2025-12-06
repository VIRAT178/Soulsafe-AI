import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  Heart,
  Plus,
  User,
  LogOut,
  Bell,
  Search,
  Clock,
  Unlock
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unlockedCapsules, setUnlockedCapsules] = useState([]);
  const [recentCapsules, setRecentCapsules] = useState([]); // recently created/updated
  const [unseenCount, setUnseenCount] = useState(0);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/capsules?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  // Live search suggestions (client-side filtering)
  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      const q = searchQuery.trim();
      if (q.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      setSearchLoading(true);
      try {
        const { capsuleAPI } = await import('../services/api.jsx');
        const res = await capsuleAPI.getAll();
        if (!active) return;
        const capsules = res.data.capsules || [];
        const lowered = q.toLowerCase();
        const filtered = capsules.filter(c => (
          c.title?.toLowerCase().includes(lowered) ||
          c.description?.toLowerCase().includes(lowered)
        )).slice(0, 5);
        setSearchResults(filtered);
        setShowSearchResults(true);
      } catch (err) {
        if (active) {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    };
    const debounce = setTimeout(runSearch, 300); // debounce 300ms
    return () => { active = false; clearTimeout(debounce); };
  }, [searchQuery]);

  // Get list of seen notification IDs from localStorage
  const getSeenNotifications = () => {
    try {
      const seen = localStorage.getItem('seenNotifications');
      return seen ? JSON.parse(seen) : [];
    } catch {
      return [];
    }
  };

  // Mark a notification as seen
  const markAsSeen = (capsuleId) => {
    try {
      const seen = getSeenNotifications();
      if (!seen.includes(capsuleId)) {
        seen.push(capsuleId);
        localStorage.setItem('seenNotifications', JSON.stringify(seen));
      }
    } catch (err) {
      console.error('Failed to mark notification as seen:', err);
    }
  };

  // Filter out seen notifications
  const filterUnseenCapsules = (capsules) => {
    const seenIds = getSeenNotifications();
    return capsules.filter(capsule => !seenIds.includes(capsule._id));
  };

  // Fetch unlocked capsules
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // First, check for newly unlocked capsules
        const { capsuleAPI } = await import('../services/api.jsx');
        const checkResult = await capsuleAPI.checkUnlocks();
        
        let allUnlockedCapsules = [];
        let allCapsulesList = [];
        
        if (checkResult.data && checkResult.data.newlyUnlocked) {
          allUnlockedCapsules = checkResult.data.newlyUnlocked;
        } else {
          // Fallback: fetch all capsules and filter unlocked ones
          const allCapsules = await capsuleAPI.getAll();
          const capsules = allCapsules.data.capsules || [];
          allCapsulesList = capsules;
          allUnlockedCapsules = capsules
            .filter(c => c.unlockConditions?.isUnlocked)
            .sort((a, b) => new Date(b.unlockConditions.unlockedAt || b.updatedAt) - new Date(a.unlockConditions.unlockedAt || a.updatedAt))
            .slice(0, 5);
        }
        
        // Filter out seen notifications
        const unseenCapsules = filterUnseenCapsules(allUnlockedCapsules);
        setUnlockedCapsules(unseenCapsules);
        // Recent creations (last 7 days or top 5 newest)
        if (!allCapsulesList.length) {
          const allCapsules = await capsuleAPI.getAll();
          allCapsulesList = allCapsules.data.capsules || [];
        }
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = allCapsulesList
          .filter(c => {
            const created = c.createdAt ? new Date(c.createdAt).getTime() : 0;
            return created >= sevenDaysAgo;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        const unseenRecent = filterUnseenCapsules(recent);
        setRecentCapsules(unseenRecent);
        setUnseenCount(unseenCapsules.length + unseenRecent.length);
      } catch (err) {
        console.error('Failed to fetch unlocked capsules:', err);
        setUnlockedCapsules([]);
        setRecentCapsules([]);
        setUnseenCount(0);
      }
    };
    
    if (user) {
      fetchNotifications();
      // Refresh every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Notifications dropdown
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Search results dropdown
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center mr-3 shadow-glow-sm ring-1 ring-white/10">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SoulSafe.AI</span>
          </div>

          {/* Search Bar - hidden on xs, visible on sm+ */}
          <div className="relative flex-1 max-w-md mx-8 hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="input-modern w-full pl-10 pr-10 py-2 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
            {showSearchResults && (
              <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-surface-900/95 backdrop-blur-md border border-surface-700/50 rounded-xl2 shadow-card z-50 overflow-hidden overflow-x-hidden">
                <div className="p-3 border-b border-surface-700/40 flex items-center justify-between">
                  <span className="text-xs text-surface-400">{searchLoading ? 'Searching…' : 'Results'}</span>
                  {searchResults.length > 0 && (
                    <button
                      className="text-brand-400 text-xs hover:text-brand-300"
                      onClick={() => handleSearch({ preventDefault: () => {} })}
                    >
                      View All
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchLoading && searchResults.length === 0 ? (
                    <div className="p-4 text-center text-surface-500 text-xs">Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-surface-500 text-xs">No matches found</div>
                  ) : (
                    searchResults.map(c => (
                      <button
                        key={c._id}
                        onClick={() => { navigate(`/capsules/${c._id}`); setShowSearchResults(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-800/70 transition-colors flex items-start gap-3 border-b border-surface-800/40"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center shadow-glow-sm ring-1 ring-white/10 flex-shrink-0">
                          <Unlock className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{c.title || 'Untitled Capsule'}</p>
                          <p className="text-surface-400 text-[10px] truncate">{c.description || 'No description'}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-brand-400 focus:outline-none hover:text-brand-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Right side - hidden on xs, visible on sm+ */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => navigate('/capsules/create')}
              className="btn-primary text-sm gap-2 px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            
            {/* Notifications Bell with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-surface-300 hover:text-brand-400 transition-colors duration-300 relative rounded-xl2 hover:bg-surface-800/60"
              >
                <Bell className="w-5 h-5" />
                {unseenCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 max-w-sm bg-surface-900/95 backdrop-blur-md border border-surface-700/50 rounded-xl2 shadow-card z-50 overflow-hidden animate-float">
                  <div className="p-4 border-b border-surface-700/40 bg-gradient-to-r from-brand-500/10 to-brand-600/10">
                    <h3 className="text-white font-bold text-sm">Notifications</h3>
                    <p className="text-surface-400 text-xs mt-1">Unlocked and recent activity</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Unlocked Capsules Section */}
                    <div>
                      <div className="px-4 py-2 bg-surface-800/40 text-xs font-medium tracking-wide text-surface-400">Unlocked Capsules</div>
                      {unlockedCapsules.length > 0 ? (
                        unlockedCapsules.map((capsule) => (
                          <button
                            key={capsule._id}
                            onClick={() => {
                              markAsSeen(capsule._id);
                              setUnseenCount(prev => Math.max(0, prev - 1));
                              setUnlockedCapsules(prev => prev.filter(c => c._id !== capsule._id));
                              navigate(`/capsules/${capsule._id}`);
                              setShowNotifications(false);
                            }}
                            className="w-full p-4 hover:bg-surface-800/70 transition-colors duration-300 border-b border-surface-800/40 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center flex-shrink-0 shadow-glow-sm ring-1 ring-white/10">
                                <Unlock className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-semibold truncate">{capsule.title}</h4>
                                <p className="text-surface-400 text-xs mt-1 line-clamp-2">{capsule.description || 'No description'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-brand-400" />
                                  <p className="text-brand-400 text-xs">
                                    {capsule.unlockConditions?.unlockedAt 
                                      ? new Date(capsule.unlockConditions.unlockedAt).toLocaleDateString()
                                      : 'Recently unlocked'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-surface-500 text-xs">No unlocked capsules</div>
                      )}
                    </div>
                    {/* Recent Creations Section */}
                    <div>
                      <div className="px-4 py-2 bg-surface-800/40 text-xs font-medium tracking-wide text-surface-400">Recently Created</div>
                      {recentCapsules.length > 0 ? (
                        recentCapsules.map(capsule => (
                          <button
                            key={capsule._id}
                            onClick={() => {
                              markAsSeen(capsule._id);
                              setUnseenCount(prev => Math.max(0, prev - 1));
                              setRecentCapsules(prev => prev.filter(c => c._id !== capsule._id));
                              navigate(`/capsules/${capsule._id}`);
                              setShowNotifications(false);
                            }}
                            className="w-full p-4 hover:bg-surface-800/70 transition-colors duration-300 border-b border-surface-800/40 text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center flex-shrink-0 shadow-glow-sm ring-1 ring-white/10 ${
                                capsule.status === 'locked' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                                capsule.status === 'processing' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                capsule.status === 'unlocked' ? 'bg-gradient-to-br from-brand-600 to-brand-500' :
                                'bg-gradient-to-br from-surface-700 to-surface-800'
                              }`}>
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-semibold truncate">{capsule.title || 'Untitled Capsule'}</h4>
                                <p className="text-surface-400 text-xs mt-1 line-clamp-2">{capsule.description || 'No description'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="w-3 h-3 text-brand-400" />
                                  <p className="text-brand-400 text-xs">
                                    {capsule.createdAt ? new Date(capsule.createdAt).toLocaleDateString() : 'Unknown date'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-surface-500 text-xs">No recent capsules</div>
                      )}
                    </div>
                  </div>
                  {unlockedCapsules.length > 0 && (
                    <div className="p-3 bg-surface-800/40 border-t border-surface-700/40">
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => {
                            // Mark all as seen (both sections)
                            [...unlockedCapsules, ...recentCapsules].forEach(capsule => markAsSeen(capsule._id));
                            setUnlockedCapsules([]);
                            setRecentCapsules([]);
                            setUnseenCount(0);
                          }}
                          className="text-surface-400 hover:text-red-400 text-xs font-medium transition-colors"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => {
                            navigate('/capsules');
                            setShowNotifications(false);
                          }}
                          className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
                        >
                          View All →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 hover:bg-surface-800/70 p-2 rounded-xl2 transition-colors duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                {user?.profilePicture ? (
                  <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                    alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                  <User className="w-4 h-4 text-white" style={{ display: 'none' }} />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-medium text-sm">{user?.firstName} {user?.lastName}</p>
              </div>
            </button>
            <button
              onClick={logout}
              className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 rounded-xl2 hover:bg-surface-800/60"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="sm:hidden flex flex-col gap-2 py-2 bg-surface-800/70 backdrop-blur-md rounded-xl2 mx-2 mb-2 border border-surface-700/40">
            <form onSubmit={handleSearch} className="relative px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="input-modern w-full pl-10 pr-4 py-2 text-sm"
                />
              </div>
            </form>
            <button
              onClick={() => navigate('/capsules/create')}
              className="btn-primary text-sm gap-2 mx-2 py-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-surface-300 hover:text-brand-400 transition-colors duration-300 mx-2 relative rounded-xl2 hover:bg-surface-700/60"
            >
              <Bell className="w-5 h-5" />
              {unseenCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 hover:bg-surface-700/60 p-2 rounded-xl2 transition-colors duration-300 mx-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl2 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                {user?.profilePicture ? (
                  <img
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                    alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
                  <User className="w-4 h-4 text-white" style={{ display: 'none' }} />
              </div>
              <p className="text-white font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            </button>
            <button
              onClick={logout}
              className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 mx-2 rounded-xl2 hover:bg-surface-700/60"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;