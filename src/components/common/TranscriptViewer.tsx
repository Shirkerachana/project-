import React, { useState } from 'react';
import { TranscriptEntry } from '../../types';
import { Bot, User, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { AIBadge } from './AIBadge';

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  overallConfidence?: 'high' | 'medium' | 'low';
  confidenceFlagReason?: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  overallConfidence = 'high',
  confidenceFlagReason
}) => {
  const [filterFlagsOnly, setFilterFlagsOnly] = useState<boolean>(false);

  const displayedEntries = filterFlagsOnly
    ? transcript.filter((t) => t.hasFlag || t.confidence < 0.75)
    : transcript;

  const flagCount = transcript.filter((t) => t.hasFlag || t.confidence < 0.75).length;

  return (
    <div id="transcript-viewer" className="space-y-4">
      {/* Confidence Flag Header */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          overallConfidence === 'low'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : overallConfidence === 'medium'
            ? 'bg-sky-950/30 border-sky-500/40 text-sky-200'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {overallConfidence === 'low' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-sm flex items-center gap-2">
              <span>
                AI Transcription Confidence:{' '}
                <span className="uppercase tracking-wider">{overallConfidence}</span>
              </span>
              {overallConfidence === 'low' && (
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500 text-slate-950">
                  ACTION: Verify Audio
                </span>
              )}
            </div>
            {confidenceFlagReason && (
              <p className="text-xs mt-1 text-slate-300 leading-relaxed max-w-2xl">
                {confidenceFlagReason}
              </p>
            )}
          </div>
        </div>

        {flagCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterFlagsOnly(!filterFlagsOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
              filterFlagsOnly
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterFlagsOnly ? 'Show Full Transcript' : `Show ${flagCount} Flagged Only`}</span>
          </button>
        )}
      </div>

      {/* Transcript Chat Flow */}
      <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 max-h-[520px] overflow-y-auto">
        {displayedEntries.map((entry) => {
          const isAI = entry.speaker === 'AI';
          const isLowConfidence = entry.confidence < 0.75 || entry.hasFlag;

          return (
            <div
              key={entry.id}
              className={`flex gap-3 p-3.5 rounded-xl border transition-all ${
                isLowConfidence
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30'
                  : isAI
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-indigo-950/20 border-indigo-500/20'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isAI ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {isAI ? 'AI Screener' : 'Candidate'}
                    </span>
                    {isAI && <AIBadge label="Synthetic Voice" size="sm" />}
                    <span className="text-[11px] font-mono text-slate-500">{entry.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                        isLowConfidence
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {Math.round(entry.confidence * 100)}% conf
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>

                {entry.hasFlag && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{entry.flagNote || 'Low audio recognition confidence — please verify against recording'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
