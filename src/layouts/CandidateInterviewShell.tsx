import React from 'react';
import { Sparkles, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CandidateInterviewShellProps {
  children: React.ReactNode;
  candidateName?: string;
  roleTitle?: string;
}

export const CandidateInterviewShell: React.FC<CandidateInterviewShellProps> = ({
  children,
  candidateName,
  roleTitle
}) => {
  const { isBright, toggleTheme } = useTheme();

  return (
    <div
      id="candidate-interview-shell"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
    >
      {/* Discreet Candidate Top Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">TalentPulse</span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase font-semibold">
                Live AI Interview
              </span>
            </div>
            {candidateName && (
              <div className="text-[11px] text-slate-400">
                Candidate: <strong className="text-slate-200">{candidateName}</strong> {roleTitle && `• ${roleTitle}`}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={toggleTheme}
            title={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {isBright ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isBright ? 'Dark' : 'Bright'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Encrypted</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PROCTORING ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Candidate Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Minimal Footer */}
      <footer className="py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-900">
        TalentPulse AI Assessment Platform &bull; Session token authenticated &bull; All conversations encrypted and proctored.
      </footer>
    </div>
  );
};
