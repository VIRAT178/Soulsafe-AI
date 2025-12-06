import React from 'react';
import { motion } from 'framer-motion';

const RecentActivity = ({ activities }) => {
  return (
    <div className="card-modern">
      <h2 className="text-sm font-semibold mb-4 text-white tracking-wide">Recent Activity</h2>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl2 bg-surface-800/60 border border-surface-700/40 hover:border-brand-500/40 hover:bg-surface-700/60 transition-colors"
          >
            <div className="text-lg select-none">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-medium text-surface-200 mb-1 line-clamp-1">{activity.action}</p>
              <p className="text-[10px] text-surface-500">{activity.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;