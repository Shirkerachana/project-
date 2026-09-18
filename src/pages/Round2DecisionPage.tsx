import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Mail,
  Send,
  AlertTriangle,
  ArrowRight,
  Bot
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { round2Service } from '../api/round2.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Candidate, Round2DecisionRecord } from '../types';

export const Round2DecisionPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [existingDecision, setExistingDecision] = useState<Round2DecisionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Decision Form
  const [proceed, setProceed] = useState<boolean>(true);
  const [reason, setReason] = useState('Demonstrated strong systems architecture capabilities during Round 1 AI evaluation. Clear communication and deep Kafka/Go proficiency.');
  
  // Schedule Round 2 panel if Proceed
  const [round2Date, setRound2Date] = useState('2026-09-22T14:00');
  const [panelInterviewer1, setPanelInterviewer1] = useState('Marcus Brody (Lead Architect)');
  const [panelInterviewer2, setPanelInterviewer2] = useState('Rachel Adams (Engineering Manager)');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/talentpulse-r2-panel');

  // Rejection email draft if No-Go
  const [rejectionEmailBody, setRejectionEmailBody] = useState(
    'Thank you for taking the time to complete the initial technical round with us. While our evaluators were impressed with your background, we have chosen to proceed with candidates whose skills more closely align with the immediate needs of this position.'
  );

  useEffect(() => {
    async function load() {
      if (!candidateId) return;
      setIsLoading(true);
      try {
        const [c, d] = await Promise.all([
          candidatesService.getById(candidateId),
          round2Service.getDecisionByCandidateId(candidateId)
        ]);
        setCandidate(c || null);
        setExistingDecision(d || null);
        if (d) {
          setProceed(d.proceed);
          setReason(d.reason);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (isLoading) return <LoadingState message="Loading candidate dossier and gate status..." variant="spinner" />;
  if (!candidate) return <div className="p-8 text-center text-slate-400">Candidate not found.</div>;

  const handleSubmitDecision = async () => {
    if (!reason.trim()) {
      toast.error('Validation Error', 'Mandatory decision justification required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await round2Service.recordDecision(candidate.id, {
        proceed,
        reason,
        decidedBy: user?.name || 'Sarah Jenkins (Team Manager)',
        panelInterviewers: proceed ? [panelInterviewer1, panelInterviewer2] : [],
        scheduledDate: proceed ? round2Date : undefined,
        meetingLink: proceed ? meetingLink : undefined,
        rejectionEmailSent: !proceed
      });

      setExistingDecision(record);
      toast.success(
        proceed ? 'Proceed to Round 2 Confirmed' : 'Candidate Rejected',
        proceed
          ? `Round 2 panel scheduled with ${panelInterviewer1}. Candidate status updated.`
          : 'Candidate marked as rejected. Rejection notification dispatched.'
      );

      navigate(`/candidates/${candidate.id}`);
    } catch (err: any) {
      toast.error('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="round2-decision-page" className="space-y-6">
      <PageHeader
        title={`Round 2 Go/No-Go Gate: ${candidate.fullName}`}
        description="HUMAN CONTROL POINT #2: Explicit human decision required following Phase 4 AI technical evaluation."
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName, href: `/candidates/${candidate.id}` },
          { label: 'Round 2 Gate' }
        ]}
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Mandatory Human Control Point
          </span>
        }
      />

      {/* Candidate Snapshot Summary Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{candidate.fullName}</h3>
            <StatusBadge status={candidate.status} />
          </div>

          <div className="text-xs text-slate-300">
            Role: <strong className="text-indigo-300">{candidate.requirementTitle}</strong> &bull; Experience: {candidate.experienceYears} yrs &bull; Location: {candidate.location}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {candidate.skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-xs text-slate-300">
                {s}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to={`/interviews/round1/${candidate.id}/report`}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Bot className="w-4 h-4" />
              <span>Inspect Full AI Round 1 Scored Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 border-t lg:border-t-0 lg:border-l border-slate-800 text-center">
          <ScoreGauge
            score={candidate.round1Score || 87}
            maxScore={100}
            label="AI Round 1 Score"
            size="md"
          />
        </div>
      </div>

      {/* Gate Decision Form */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Record Evaluator Decision</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Decide whether candidate advances to Round 2 Human Panel or is rejected from the funnel.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Logged by: <strong className="text-slate-200">{user?.name}</strong>
          </span>
        </div>

        {/* Binary Decision Radio Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setProceed(true)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              proceed
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${proceed ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">GO &mdash; Advance to Round 2 Panel</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Schedule human technical panel interview with team lead.
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setProceed(false)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              !proceed
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40'
                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${!proceed ? 'bg-rose-600/30 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">NO-GO &mdash; Reject Candidate</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Terminate process and dispatch respectful rejection notice.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Justification */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Decision Rationale & Audit Justification <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this candidate should or should not advance..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
          />
        </div>

        {/* Conditional Subsection: Panel Scheduling when Proceed */}
        {proceed ? (
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Round 2 Panel Interview Scheduling</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Panel Date & Time</label>
                <input
                  type="datetime-local"
                  value={round2Date}
                  onChange={(e) => setRound2Date(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Meeting Link</label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Panel Evaluator</label>
                <input
                  type="text"
                  value={panelInterviewer1}
                  onChange={(e) => setPanelInterviewer1(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Secondary Panel Evaluator</label>
                <input
                  type="text"
                  value={panelInterviewer2}
                  onChange={(e) => setPanelInterviewer2(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Candidate Rejection Notification Email Draft</span>
            </h4>
            <textarea
              rows={4}
              value={rejectionEmailBody}
              onChange={(e) => setRejectionEmailBody(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={handleSubmitDecision}
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 ${
              proceed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {isSubmitting ? 'Recording...' : proceed ? 'Confirm & Advance to Round 2' : 'Confirm & Send Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};
