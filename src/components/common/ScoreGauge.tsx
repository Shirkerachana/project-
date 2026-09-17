import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  maxScore = 100,
  label,
  size = 'md',
  showPercentage = true
}) => {
  const percentage = Math.round((score / maxScore) * 100);

  const getColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-400 stroke-emerald-500';
    if (pct >= 70) return 'text-sky-400 stroke-sky-500';
    if (pct >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getTrackColor = (pct: number) => {
    if (pct >= 85) return 'stroke-emerald-100 dark:stroke-emerald-950';
    if (pct >= 70) return 'stroke-sky-100 dark:stroke-sky-950';
    if (pct >= 50) return 'stroke-amber-100 dark:stroke-amber-950';
    return 'stroke-rose-100 dark:stroke-rose-950';
  };

  const dimensions = {
    sm: { size: 54, stroke: 5, fontSize: 'text-sm font-bold' },
    md: { size: 84, stroke: 7, fontSize: 'text-xl font-bold' },
    lg: { size: 120, stroke: 10, fontSize: 'text-3xl font-extrabold' }
  }[size];

  const radius = (dimensions.size - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div id="score-gauge" className="flex flex-col items-center justify-center gap-1.5">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.size}
          height={dimensions.size}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            className={`fill-none ${getTrackColor(percentage)}`}
            strokeWidth={dimensions.stroke}
          />
          {/* Progress arc */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${getColor(percentage)}`}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${dimensions.fontSize} tracking-tight text-slate-900 dark:text-white`}>
            {score}
            {showPercentage && <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-0.5">/{maxScore}</span>}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
          {label}
        </span>
      )}
    </div>
  );
};
