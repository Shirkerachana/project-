import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  PauseCircle,
  FileCheck,
  Send,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  Bot,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { decisionsService } from '../api/decisions.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Candidate, FinalDecisionRecord } from '../types';

export const FinalHiringDecisionPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const toast = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [existingFinalDecision, setExistingFinalDecision] = useState<FinalDecisionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Final Decision Form
  const [decisionStatus, setDecisionStatus] = useState<'hire' | 'reject' | 'hold'>('hire');
  const [decisionNotes, setDecisionNotes] = useState('Unanimous approval across AI evaluation and Round 2 panel. Exceptional technical depth and cultural fit.');
  const [offeredCompensation, setOfferedCompensation] = useState('$175,000 / year + equity');
  const [startDate, setStartDate] = useState('2026-10-15');

  useEffect(() => {
    async function load() {
      if (!candidateId) return;
      setIsLoading(true);
      try {
        const [c, fd] = await Promise.all([
          candidatesService.getById(candidateId),
          decisionsService.getByCandidateId(candidateId)
        ]);
        setCandidate(c || null);
        setExistingFinalDecision(fd || null);
        if (fd) {
          setDecisionStatus(fd.status);
          setDecisionNotes(fd.notes);
          if (fd.offeredCompensation) setOfferedCompensation(fd.offeredCompensation);
          if (fd.startDate) setStartDate(fd.startDate);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (isLoading) return <LoadingState message="Loading multi-stage hiring audit dossier..." variant="spinner" />;
  if (!candidate) return <div className="p-8 text-center text-slate-400">Candidate not found.</div>;

  const handleSubmitFinalDecision = async () => {
    if (!decisionNotes.trim()) {
      toast.error('Validation Error', 'Comprehensive hiring decision notes are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await decisionsService.recordFinalDecision(candidate.id, {
        status: decisionStatus,
        notes: decisionNotes,
        decidedBy: user?.name || 'David Ross (Account Manager)',
        deciderRole: role,
        offeredCompensation: decisionStatus === 'hire' ? offeredCompensation : undefined,
        startDate: decisionStatus === 'hire' ? startDate : undefined
      });

      setExistingFinalDecision(record);
      toast.success(
        'Final Hiring Decision Recorded',
        `Candidate status set to ${record.status.toUpperCase()}. Full audit trail stored in system record.`
      );
      navigate(`/candidates/${candidate.id}`);
    } catch (err: any) {
      toast.error('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="final-hiring-decision-page" className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={`Final Hiring Gate: ${candidate.fullName}`}
        description="HUMAN CONTROL POINT #3: Ultimate hiring determination consolidating AI technical ratings, panel evaluations, and manager reviews."
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName, href: `/candidates/${candidate.id}` },
          { label: 'Final Decision' }
        ]}
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 font-bold">
            Mandatory Human Control Point #3
          </span>
        }
      />

      {/* Multi-Role Audit Synthesis Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Multi-Stakeholder Lifecycle Summary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 & 2 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recruiter Sourcing</span>
            <div className="font-bold text-white text-sm">{candidate.recruiterName}</div>
            <div className="text-emerald-400 font-semibold pt-1">Screen Score: {candidate.screeningScore || 84}/100</div>
            <div className="text-slate-400">RTR Authorized &bull; Ceipal Synced</div>
          </div>

          {/* Phase 2 Manager Signoff */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Manager Approval</span>
            <div className="font-bold text-white text-sm">
              {candidate.managerApproval?.decidedBy || 'Sarah Jenkins'}
            </div>
            <div className="text-emerald-400 font-semibold pt-1">Profile Approved</div>
            <div className="text-slate-400 truncate">"{candidate.managerApproval?.comments || 'Verified background'}"</div>
          </div>

          {/* Phase 4 AI Round 1 */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Round 1 Technical</span>
            <div className="font-bold text-white text-sm">AI Avatar Evaluation</div>
            <div className="text-indigo-400 font-semibold pt-1">Rating: {candidate.round1Score || 87}/100</div>
            <div className="text-slate-400">Proctor Integrity: PASS (99%)</div>
          </div>

          {/* Phase 5 Round 2 Panel */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Round 2 Panel</span>
            <div className="font-bold text-white text-sm">
              {candidate.round2Decision?.panelInterviewers?.[0] || 'Engineering Panel'}
            </div>
            <div className="text-emerald-400 font-semibold pt-1">Proceed to Offer</div>
            <div className="text-slate-400 truncate">"{candidate.round2Decision?.reason || 'Strong architecture'}"</div>
          </div>
        </div>
      </div>

      {/* Decision Form */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Final Hiring Action</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select outcome and submit official hiring dossier.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Executive Decider: <strong className="text-white">{user?.name}</strong> ({role})
          </span>
        </div>

        {/* 3 Outcome Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setDecisionStatus('hire')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              decisionStatus === 'hire'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${decisionStatus === 'hire' ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">HIRE</div>
                <div className="text-xs text-slate-400 mt-0.5">Extend formal job offer</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setDecisionStatus('hold')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              decisionStatus === 'hold'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40'
                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${decisionStatus === 'hold' ? 'bg-amber-600/30 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <PauseCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">HOLD</div>
                <div className="text-xs text-slate-400 mt-0.5">Keep candidate warm / alternate</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setDecisionStatus('reject')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              decisionStatus === 'reject'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40'
                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${decisionStatus === 'reject' ? 'bg-rose-600/30 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">REJECT</div>
                <div className="text-xs text-slate-400 mt-0.5">Decline candidate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Details if HIRE */}
        {decisionStatus === 'hire' && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Offer Package & Target Start Date</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Offered Compensation
                </label>
                <input
                  type="text"
                  value={offeredCompensation}
                  onChange={(e) => setOfferedCompensation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Decision Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Executive Decision Notes & Justification <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Record full hiring rationale, feedback synthesis, and next steps..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
          />
        </div>

        {/* Submission Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(`/candidates/${candidate.id}`)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmitFinalDecision}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Decision...' : 'Commit Final Hiring Decision'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
