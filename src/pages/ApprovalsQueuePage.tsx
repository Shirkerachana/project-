import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { Candidate } from '../types';

export const ApprovalsQueuePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleOpenDecision = (cand: Candidate, type: 'approve' | 'reject') => {
    setSelectedCandidate(cand);
    setDecisionType(type);
    setComments(
      type === 'approve'
        ? 'Verified candidate background, screening recording, and signed RTR.'
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
          ? `${updated.fullName} has been approved.`
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

  if (isLoading) return <LoadingState message="Loading approval queues..." variant="spinner" />;

  return (
    <div id="approvals-queue-page" className="space-y-6">
      <PageHeader
        title="Candidate Profile Approvals"
        description="Team Managers inspect candidate dossiers, screening scores, and signed RTRs."
      />

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
              ? 'Approving records Team Manager sign-off for this candidate profile.'
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
    </div>
  );
};
