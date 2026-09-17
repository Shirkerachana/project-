import React from 'react';
import { Mic, Volume2, Cpu, Sparkles } from 'lucide-react';

export type AvatarState = 'speaking' | 'listening' | 'processing' | 'idle';

interface InterviewLiveIndicatorProps {
  state: AvatarState;
  questionNumber?: number;
  totalQuestions?: number;
}

export const InterviewLiveIndicator: React.FC<InterviewLiveIndicatorProps> = ({
  state,
  questionNumber,
  totalQuestions
}) => {
  const configs = {
    speaking: {
      label: 'AI Avatar Speaking',
      sublabel: 'Synthesizing speech & asking question',
      icon: Volume2,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      ringColor: 'ring-indigo-500/50'
    },
    listening: {
      label: 'AI Listening to Answer',
      sublabel: 'Transcribing & analyzing response in real-time',
      icon: Mic,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
      ringColor: 'ring-emerald-500/50'
    },
    processing: {
      label: 'AI Evaluating & Generating Next Probe',
      sublabel: 'Synthesizing response & verifying rubric points',
      icon: Cpu,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      ringColor: 'ring-amber-500/50'
    },
    idle: {
      label: 'Session Connected',
      sublabel: 'Awaiting interaction',
      icon: Sparkles,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      ringColor: 'ring-slate-700'
    }
  }[state];

  const Icon = configs.icon;

  return (
    <div id="interview-live-indicator" className="flex items-center justify-between gap-4 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${configs.badgeColor} ring-4 ${configs.ringColor}`}>
          <Icon className="w-5 h-5" />
          {state === 'listening' && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">{configs.label}</span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
              Live WebRTC
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{configs.sublabel}</div>
        </div>
      </div>

      {questionNumber && totalQuestions && (
        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Question</span>
          <span className="text-base font-extrabold text-white font-mono">
            {questionNumber} <span className="text-slate-500 text-xs">/ {totalQuestions}</span>
          </span>
        </div>
      )}
    </div>
  );
};
