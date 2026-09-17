import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { Candidate } from '../types';

export const ApprovalsQueuePage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Decision State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ceipal mark submitted state
  const [ceipalModalCand, setCeipalModalCand] = useState<Candidate | null>(null);
  const [ceipalAppId, setCeipalAppId] = useState('');
  const [isSubmittingCeipal, setIsSubmittingCeipal] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const list = await candidatesService.getAll();
      setCandidates(list);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApprovals = candidates.filter(
    (c) => c.status === 'Profile_Pending_Approval' || (c.rtrAcknowledged && !c.managerApproval)
  );

  const approvedAwaitingCeipal = candidates.filter(
    (c) => c.status === 'Profile_Approved' && !c.ceipalId
  );

  const handleOpenDecision = (cand: Candidate, type: 'approve' | 'reject') => {
    setSelectedCandidate(cand);
    setDecisionType(type);
    setComments(
      type === 'approve'
        ? 'Verified candidate background, screening recording, and signed RTR. Approved for client Ceipal submission.'
        : 'Skills alignment does not meet client minimum threshold.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!selectedCandidate) return;
    if (!comments.trim()) {
      toast.error('Validation Error', 'Mandatory decision comments required for audit trail.');
      return;
    }

    setIsProcessing(true);
    try {
      const isApproved = decisionType === 'approve';
      const updated = await candidatesService.recordManagerApproval(
        selectedCandidate.id,
        isApproved,
        comments,
        user?.name || 'Sarah Jenkins (Team Manager)'
      );

      toast.success(
        isApproved ? 'Candidate Profile Approved' : 'Candidate Profile Rejected',
        isApproved
          ? `${updated.fullName} approved. Recruiter task generated for Ceipal submission.`
          : `${updated.fullName} has been rejected from the pipeline.`
      );

      setSelectedCandidate(null);
      await loadApprovals();
    } catch (err: any) {
      toast.error('Approval Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCeipalSubmission = async () => {
    if (!ceipalModalCand) return;
    const appId = ceipalAppId.trim() || `CP-${Math.floor(100000 + Math.random() * 900000)}`;

    setIsSubmittingCeipal(true);
    try {
      const updated = await candidatesService.markCeipalSubmitted(ceipalModalCand.id, appId);
      toast.success(
        'Ceipal Submission Recorded',
        `${updated.fullName} marked as Ceipal Submitted with ID ${appId}. Candidate is now unlocked for Phase 3: AI Availability Scheduling!`
      );
      setCeipalModalCand(null);
      await loadApprovals();
    } catch (err: any) {
      toast.error('Ceipal Error', err.message);
    } finally {
      setIsSubmittingCeipal(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading approval queues..." variant="spinner" />;

  return (
    <div id="approvals-queue-page" className="space-y-6">
      <PageHeader
        title="Candidate Profile Approvals & Ceipal Gating"
        description="HUMAN CONTROL POINT #1: Team Managers explicitly inspect candidate dossiers, screening scores, and signed RTRs before submission to Ceipal ATS."
        badge={
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Mandatory Human Gate
          </span>
        }
      />

      {/* Human Gate Alert Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-500/40 flex items-start gap-3.5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-normal">
          <strong className="text-amber-900 dark:text-amber-300 font-bold">AI Workflow Constraint:</strong> Under no circumstances can AI automatically submit a candidate to the client ATS or book availability calls until a <strong className="text-amber-900 dark:text-amber-300 font-bold">human Team Manager approves the profile</strong> and the recruiter confirms Ceipal submission.
        </div>
      </div>

      {/* Section 1: Team Manager Approval Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <span>Pending Manager Approvals ({pendingApprovals.length})</span>
          </h2>
          <span className="text-xs text-slate-400">RTR signed candidates awaiting sign-off</span>
        </div>

        {pendingApprovals.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Approvals queue is clear"
            description="All RTR-signed candidates have been reviewed and decided by the Team Manager."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <ScoreGauge
                    score={cand.screeningScore || 0}
                    maxScore={100}
                    label="Screen Score"
                    size="sm"
                  />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/candidates/${cand.id}`}
                        className="text-base font-bold text-white hover:text-indigo-400 transition-colors"
                      >
                        {cand.fullName}
                      </Link>
                      <StatusBadge status={cand.status} />
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> RTR Signed
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Target Role: <strong className="text-indigo-700 dark:text-indigo-300 font-bold">{cand.requirementTitle}</strong> &bull; Recruiter: <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.recruiterName || 'Assigned Recruiter'}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.map((s) => (
                        <span key={s} className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link
                    to={`/candidates/${cand.id}`}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-center transition-colors shadow-sm"
                  >
                    View 360 Dossier
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenDecision(cand, 'reject')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600 text-rose-700 dark:text-rose-300 dark:hover:text-white border border-rose-200 dark:border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDecision(cand, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Profile</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Approved Profiles -> Ceipal Submission Tasks for Recruiter */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-cyan-400" />
            <span>Ceipal ATS Submission Tasks ({approvedAwaitingCeipal.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Manager approved profiles awaiting client ATS upload
          </span>
        </div>

        {approvedAwaitingCeipal.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 text-center">
            No approved candidates currently awaiting Ceipal submission.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {approvedAwaitingCeipal.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span>{cand.fullName}</span>
                    <span className="text-xs text-cyan-800 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-300 dark:border-cyan-700/60 px-2 py-0.5 rounded font-semibold">
                      Approved by {cand.managerApproval?.decidedBy}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Role: <span className="font-semibold text-slate-800 dark:text-slate-200">{cand.requirementTitle}</span> &bull; Sign-off comment: <span className="italic font-medium text-slate-700 dark:text-slate-300">"{cand.managerApproval?.comments}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCeipalModalCand(cand);
                      setCeipalAppId(`CP-${Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Submitted in Ceipal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal (Approve / Reject) */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title={decisionType === 'approve' ? 'Approve Candidate Profile' : 'Reject Candidate Profile'}
        subtitle={selectedCandidate ? `${selectedCandidate.fullName} for ${selectedCandidate.requirementTitle}` : ''}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              decisionType === 'approve'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            {decisionType === 'approve'
              ? 'Approving unlocks this candidate for client submission in Ceipal and subsequent AI interview scheduling.'
              : 'Rejecting terminates candidate processing. A rejection notification will be logged in the audit trail.'}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Team Manager Decision Comments & Audit Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="State clear reasons for approval or rejection..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDecision}
              disabled={isProcessing}
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                decisionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isProcessing ? 'Recording...' : decisionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ceipal Submission Modal */}
      <Modal
        isOpen={!!ceipalModalCand}
        onClose={() => setCeipalModalCand(null)}
        title="Record Ceipal ATS Submission"
        subtitle={ceipalModalCand?.fullName}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Record the applicant tracking ID once you have submitted this candidate to Ceipal. This triggers Phase 3: AI Availability Scheduling.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Ceipal Applicant ID
            </label>
            <input
              type="text"
              value={ceipalAppId}
              onChange={(e) => setCeipalAppId(e.target.value)}
              placeholder="e.g. CP-829104"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCeipalModalCand(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCeipalSubmission}
              disabled={isSubmittingCeipal}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {isSubmittingCeipal ? 'Saving...' : 'Confirm Ceipal Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
