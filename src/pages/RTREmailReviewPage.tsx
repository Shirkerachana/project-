import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { screeningService } from '../api/screening.service';
import { candidatesService } from '../api/candidates.service';
import { useToast } from '../context/ToastContext';
import { RTREmail, Candidate } from '../types';

export const RTREmailReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [draft, setDraft] = useState<RTREmail | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSimulatingAck, setIsSimulatingAck] = useState(false);

  // Editable Draft Fields
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [proposedCompensation, setProposedCompensation] = useState('');
  const [sponsoringEmployer, setSponsoringEmployer] = useState('');
  const [bodyText, setBodyText] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const d = await screeningService.getRTRDraft(id);
        if (d) {
          setDraft(d);
          setCandidateName(d.candidateName);
          setCandidateEmail(d.candidateEmail);
          setPositionTitle(d.positionTitle);
          setClientName(d.clientName);
          setProposedCompensation(d.proposedCompensation);
          setSponsoringEmployer(d.sponsoringEmployer);
          setBodyText(d.bodyText);

          // Get candidate
          const c = await candidatesService.getById(d.candidateId);
          setCandidate(c || null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return <LoadingState message="Loading AI RTR draft..." variant="spinner" />;
  if (!draft) return <div className="p-8 text-center text-slate-400">RTR Draft not found for this call.</div>;

  const handleSendRTR = async () => {
    setIsSending(true);
    try {
      const updated = await screeningService.sendRTR(draft.id, {
        candidateName,
        candidateEmail,
        positionTitle,
        clientName,
        proposedCompensation,
        sponsoringEmployer,
        bodyText
      });
      setDraft(updated);
      toast.success(
        'RTR Authorization Email Sent',
        `Right-to-Represent document dispatched to ${candidateEmail}. Candidate acknowledgement is required to advance.`
      );
      setIsConfirmModalOpen(false);

      if (candidate) {
        const c = await candidatesService.getById(candidate.id);
        setCandidate(c || null);
      }
    } catch (err: any) {
      toast.error('Send Error', err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Simulate Candidate Digital Acknowledgement
  const handleSimulateCandidateAcknowledge = async () => {
    if (!candidate) return;
    setIsSimulatingAck(true);
    try {
      const updated = await screeningService.recordRTRAcknowledgement(candidate.id, draft.id);
      setCandidate(updated);
      toast.success(
        'RTR Acknowledged by Candidate',
        'Candidate has digitally signed the Right-to-Represent authorization. Profile is now forwarded to Team Manager Approval Queue.'
      );
      if (draft) {
        setDraft({ ...draft, status: 'acknowledged', acknowledgedAt: new Date().toISOString() });
      }
    } catch (err: any) {
      toast.error('Acknowledgement Error', err.message);
    } finally {
      setIsSimulatingAck(false);
    }
  };

  const isAcknowledged = draft.status === 'acknowledged' || candidate?.rtrAcknowledged;

  return (
    <div id="rtr-email-review-page" className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={`Review Right-to-Represent (RTR): ${candidateName}`}
        description="Phase 2: Review and edit the AI-drafted RTR authorization email before sending to candidate."
        breadcrumbs={[
          { label: 'Screening Calls', href: '/screening/calls' },
          { label: 'Screening Call', href: `/screening/calls/${id}` },
          { label: 'RTR Review' }
        ]}
        badge={<AIBadge label="AI Pre-Drafted Email" />}
      />

      {/* Critical Workflow Gate Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isAcknowledged
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : draft.status === 'sent'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {isAcknowledged ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : draft.status === 'sent' ? (
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>RTR Workflow Gate Status:</span>
              <span className="uppercase font-mono tracking-wider font-extrabold">
                {isAcknowledged ? 'Authorized & Signed' : draft.status === 'sent' ? 'Awaiting Candidate Click' : 'Draft Ready for Review'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              {isAcknowledged
                ? 'Candidate has granted exclusive Right to Represent. Candidate profile has been forwarded to the Team Manager Approval Queue.'
                : draft.status === 'sent'
                ? 'Email dispatched with secure digital signature link. Candidate must acknowledge before Team Manager can approve for Ceipal.'
                : 'AI extracted the salary expectations and position title from the screening conversation. Review terms below and send.'}
            </p>
          </div>
        </div>

        {/* Demo Fast-Track Button: Allows reviewer to simulate the candidate's click immediately */}
        {draft.status === 'sent' && !isAcknowledged && (
          <button
            type="button"
            onClick={handleSimulateCandidateAcknowledge}
            disabled={isSimulatingAck}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSimulatingAck ? 'Signing...' : 'Simulate Candidate RTR Acknowledge'}</span>
          </button>
        )}

        {isAcknowledged && (
          <Link
            to="/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shrink-0"
          >
            <span>Proceed to Team Manager Approvals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Editable RTR Email Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Right-to-Represent (RTR) Authorization Document</span>
                <AIBadge label="AI Formatted" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure legal accuracy before transmission. All terms below are binding upon candidate click.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Terms Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Candidate Full Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Candidate Email</label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Position Title</label>
            <input
              type="text"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Client Organization</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Proposed Compensation / Bill Rate
            </label>
            <input
              type="text"
              value={proposedCompensation}
              onChange={(e) => setProposedCompensation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Sponsoring Recruitment Agency
            </label>
            <input
              type="text"
              value={sponsoringEmployer}
              onChange={(e) => setSponsoringEmployer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Email Body */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Email Body Content
          </label>
          <textarea
            rows={8}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
          />
        </div>

        {/* Transmission Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Link
            to={`/screening/calls/${id}`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Back to Call Recording
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSending || isAcknowledged}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>
                {isAcknowledged
                  ? 'RTR Already Signed'
                  : draft.status === 'sent'
                  ? 'Re-send RTR Authorization'
                  : 'Send RTR Authorization to Candidate'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSendRTR}
        title="Send Right-to-Represent Email"
        message={`Send binding Right-to-Represent email to ${candidateEmail} for role "${positionTitle}" at "${clientName}". The workflow will await the candidate's digital confirmation.`}
        confirmLabel="Send Email Now"
        isLoading={isSending}
      />
    </div>
  );
};
