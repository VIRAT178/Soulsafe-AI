import React from 'react';
import { motion } from 'framer-motion';

const QuickActions = () => {
  const actions = [
    { title: 'New Capsule', icon: '📝', path: '/capsules/create' },
    { title: 'AI Chat', icon: '🤖', path: '/chat' },
    { title: 'Analytics', icon: '📊', path: '/analytics' },
    { title: 'Settings', icon: '⚙️', path: '/settings' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.a
          key={index}
          href={action.path}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="card-modern py-5 text-center group"
        >
          <div className="text-2xl mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">{action.icon}</div>
          <h3 className="text-sm font-medium text-surface-300 group-hover:text-white">{action.title}</h3>
        </motion.a>
      ))}
    </div>
  );
};

export default QuickActions;