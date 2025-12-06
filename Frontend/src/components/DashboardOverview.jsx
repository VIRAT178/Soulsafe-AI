import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { capsuleAPI, aiAPI } from '../services/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0 });
  const [recent, setRecent] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const capsules = await capsuleAPI.getAll();
        const total = capsules.data.length;
        const unlocked = capsules.data.filter(c => c.unlocked).length;
        const locked = total - unlocked;
        setStats({ total, unlocked, locked });
        setRecent(capsules.data.slice(0, 5));
        // Fetch AI insights for the most recent capsule
        if (capsules.data.length > 0) {
          const capsule = capsules.data[0];
          const insightsRes = await aiAPI.analyze(capsule.content);
          setAiInsights(insightsRes.data.analysis ? [insightsRes.data.analysis] : []);
        }
      } catch (err) {
        setStats({ total: 0, unlocked: 0, locked: 0 });
        setRecent([]);
        setAiInsights([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="section-heading">Dashboard Overview</h2>
        <p className="text-surface-400 text-sm">Your capsule statistics and latest neural activity.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Capsules" value={stats.total} subtext="All stored entries" />
        <StatsCard title="Unlocked" value={stats.unlocked} subtext="Accessible now" />
        <StatsCard title="Locked" value={stats.locked} subtext="Awaiting unlock" />
      </div>
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
        <RecentActivity activities={recent.map(c => ({ icon: '📦', action: c.title, timestamp: new Date(c.createdAt).toLocaleDateString() }))} />
      </div>
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-lg">AI Insights</h3>
        {loading ? <span className="text-surface-400 text-sm">Loading...</span> : (
          aiInsights.length > 0 ? (
            <div className="card-modern text-xs overflow-hidden">
              <pre className="whitespace-pre-wrap leading-relaxed text-surface-300">{JSON.stringify(aiInsights[0], null, 2)}</pre>
            </div>
          ) : <span className="text-surface-400 text-sm">No insights available.</span>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
