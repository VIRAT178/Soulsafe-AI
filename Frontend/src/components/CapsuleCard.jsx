import React from 'react';

const CapsuleCard = ({ capsule, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="card-modern text-left group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-brand-300 transition-colors">{capsule.title}</h3>
        <span className="pill text-[10px]">{capsule.unlockConditions?.isUnlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
      <p className="text-sm text-surface-400 line-clamp-3 mb-4 min-h-[3.75rem]">{capsule.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between text-xs pt-3 border-t border-surface-700/40">
        <span className="text-surface-500">{new Date(capsule.createdAt).toLocaleDateString()}</span>
        <span className="text-brand-400 font-medium group-hover:text-brand-300">View →</span>
      </div>
    </button>
  );
};

export default CapsuleCard;