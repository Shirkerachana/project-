import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Play,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { screeningService } from '../api/screening.service';
import { candidatesService } from '../api/candidates.service';
import { useToast } from '../context/ToastContext';
import { ScreeningCall, Candidate } from '../types';

export const ScreeningCallsQueuePage: React.FC = () => {
  const toast = useToast();
  const [calls, setCalls] = useState<ScreeningCall[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const [allCalls, allCands] = await Promise.all([
        screeningService.getCalls(),
        candidatesService.getAll()
      ]);
      setCalls(allCalls);
      setCandidates(allCands);
      if (allCands.length > 0) setSelectedCandidateId(allCands[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSingleCall = async () => {
    if (!selectedCandidateId) return;
    setIsBooking(true);
    try {
      const call = await screeningService.bookCall(selectedCandidateId, new Date().toISOString());
      toast.success('AI Screening Call Scheduled', `Automated voice screening call initiated for ${call.candidateName}.`);
      setIsNewCallModalOpen(false);
      await loadCalls();
    } catch (err: any) {
      toast.error('Booking Error', err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const columns: Column<ScreeningCall>[] = [
    {
      key: 'candidateName',
      header: 'Candidate & Role',
      sortable: true,
      render: (call) => (
        <div>
          <Link
            to={`/screening/calls/${call.id}`}
            className="font-bold text-white hover:text-indigo-400 transition-colors text-sm flex items-center gap-1.5"
          >
            <span>{call.candidateName}</span>
            <AIBadge label="AI Call" size="sm" />
          </Link>
          <div className="text-xs text-slate-400 mt-0.5">
            {call.candidatePhone} &bull; Call ID: {call.id}
          </div>
        </div>
      )
    },
    {
      key: 'scheduledAt',
      header: 'Date & Duration',
      render: (call) => (
        <div className="text-xs text-slate-300">
          <div>{new Date(call.scheduledAt).toLocaleString()}</div>
          <div className="text-slate-500 font-mono mt-0.5">
            Duration: {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
          </div>
        </div>
      )
    },
    {
      key: 'overallScore',
      header: 'AI Screen Score',
      sortable: true,
      render: (call) => (
        <div className="text-xs">
          {call.overallScore ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-emerald-400 font-mono">
                {call.overallScore}
              </span>
              <span className="text-slate-500">/100</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Call in progress...</span>
          )}
        </div>
      )
    },
    {
      key: 'transcriptionConfidence',
      header: 'Voice AI Confidence',
      render: (call) => {
        const isLow = call.overallConfidence === 'low' || (typeof call.transcriptionConfidence === 'number' && call.transcriptionConfidence < 0.85);
        return (
          <div className="text-xs">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                isLow
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {call.overallConfidence || (typeof call.transcriptionConfidence === 'number' ? `${Math.round(call.transcriptionConfidence * 100)}%` : 'HIGH')}
            </span>
            {call.confidenceFlagReason && (
              <div className="text-[10px] text-amber-400 truncate max-w-[140px] mt-0.5">
                Verify audio
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (call) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/screening/calls/${call.id}`}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Review Call & Audio</span>
          </Link>

          <Link
            to={`/screening/calls/${call.id}/rtr`}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Mail className="w-3 h-3" />
            <span>RTR Draft</span>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div id="screening-calls-queue-page" className="space-y-6">
      <PageHeader
        title="AI Voice Screening Calls"
        description="Phase 2: Automated telephony screening, speech-to-text transcripts with confidence warnings, and scoring rubrics."
        actions={
          <button
            type="button"
            onClick={() => setIsNewCallModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Book Single Screening Call</span>
          </button>
        }
      />

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Calls</div>
            <div className="text-2xl font-black text-white">{calls.length}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed & Transcribed</div>
            <div className="text-2xl font-black text-emerald-400">
              {calls.filter((c) => c.status === 'completed').length}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Low Confidence Flags</div>
            <div className="text-2xl font-black text-amber-400">
              {calls.filter((c) => c.transcriptionConfidence === 'low').length}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={calls}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        searchPlaceholder="Search calls by candidate name or phone..."
        searchFilter={(c, q) =>
          c.candidateName.toLowerCase().includes(q) ||
          c.candidatePhone.toLowerCase().includes(q)
        }
        emptyTitle="No screening calls found"
        emptyDescription="Schedule a screening call with a sourced candidate to begin."
      />

      {/* Book Single Screening Modal */}
      {isNewCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-400" />
                <span>Initiate AI Automated Voice Call</span>
              </h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Select Candidate
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.requirementTitle})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              The AI voice screener will call the candidate's phone, verify basic work authorization, notice period, and technical familiarity against the question bank.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewCallModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBookSingleCall}
                disabled={isBooking}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                {isBooking ? 'Initiating...' : 'Call Candidate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
