import React from 'react';
import { Brain, Zap } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Processing…' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} text-brand-400 animate-pulse`} />
        </div>
      </div>
      {text && (
        <div className="flex items-center gap-2">
          <span className="text-brand-300 font-medium text-sm tracking-tight animate-pulse">{text}</span>
          <Zap className="w-3 h-3 text-brand-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;