import React from 'react';

const StatsCard = ({ title, value, icon, subtext }) => {
  return (
    <div className="card-modern group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-surface-300 tracking-wide uppercase">{title}</h3>
          <p className="text-3xl font-semibold text-white flex items-center gap-2">
            {value}
            {icon && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl2 bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-glow-sm">
                {icon}
              </span>
            )}
          </p>
          {subtext && <p className="text-xs text-surface-400">{subtext}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl2 bg-gradient-to-br from-brand-500/20 to-brand-600/30 flex items-center justify-center ring-1 ring-brand-500/30 animate-pulse-soft" aria-hidden>
          {icon && React.cloneElement(icon, { className: 'w-5 h-5 text-brand-300' })}
        </div>
      </div>
      <div className="divider" />
      <div className="flex items-center justify-between text-xs">
        <span className="pill">Realtime</span>
        <span className="text-brand-400 font-medium">Updated now</span>
      </div>
    </div>
  );
};

export default StatsCard;