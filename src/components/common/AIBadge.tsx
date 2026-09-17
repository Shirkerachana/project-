import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface AIBadgeProps {
  label?: string;
  variant?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  label = 'AI Generated',
  variant = 'subtle',
  size = 'sm'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    subtle: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold',
    solid: 'bg-indigo-600 text-white font-semibold shadow-sm',
    outline: 'border border-indigo-300 dark:border-indigo-400/40 text-indigo-800 dark:text-indigo-300 font-semibold'
  };

  return (
    <span
      id={`ai-badge-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 rounded-full tracking-wide ${sizeClasses} ${variantClasses[variant]}`}
    >
      <Sparkles className={size === 'sm' ? 'w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-pulse' : 'w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400'} />
      <span>{label}</span>
    </span>
  );
};
