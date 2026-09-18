import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Sparkles,
  Send,
  Clock
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { DynamicFieldsEditor, DynamicField } from '../components/common/DynamicFieldsEditor';
import { screeningService } from '../api/screening.service';
import { candidatesService } from '../api/candidates.service';
import { useToast } from '../context/ToastContext';
import { RTREmail, Candidate } from '../types';

const buildRtrFields = (draft: RTREmail): DynamicField[] => {
  const defaults: DynamicField[] = [
    { id: 'candidateName', label: 'Candidate Full Name', value: draft.candidateName || '', removable: true },
    { id: 'candidateEmail', label: 'Candidate Email', value: draft.candidateEmail || '', type: 'email', removable: true },
    { id: 'positionTitle', label: 'Position Title', value: draft.positionTitle || draft.requirementTitle || '', removable: true },
    { id: 'clientName', label: 'Client Organization', value: draft.clientName || '', removable: true },
    { id: 'proposedCompensation', label: 'Proposed Compensation / Bill Rate', value: draft.proposedCompensation || draft.hourlyRateOrSalary || '', removable: true },
    { id: 'sponsoringEmployer', label: 'Sponsoring Recruitment Agency', value: draft.sponsoringEmployer || 'TalentPulse', removable: true }
  ];
  const extras = (draft.customFields || []).map((field) => ({
    id: field.id,
    label: field.label,
    value: field.value,
    removable: true
  }));
  return [...defaults, ...extras];
};

export const RTREmailReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [draft, setDraft] = useState<RTREmail | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [bodyText, setBodyText] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const d = await screeningService.getRTRDraft(id);
        if (d) {
          setDraft(d);
          setFields(buildRtrFields(d));
          setBodyText(d.bodyText);
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

  const getValue = (fieldId: string) => fields.find((f) => f.id === fieldId)?.value || '';
  const candidateName = getValue('candidateName') || draft.candidateName;
  const candidateEmail = getValue('candidateEmail') || draft.candidateEmail;
  const positionTitle = getValue('positionTitle') || draft.requirementTitle;
  const clientName = getValue('clientName') || draft.clientName;
  const isAcknowledged = draft.status === 'acknowledged' || candidate?.rtrAcknowledged;

  const handleSendRTR = async () => {
    setIsSending(true);
    try {
      const customFields = fields
        .filter((f) => !['candidateName', 'candidateEmail', 'positionTitle', 'clientName', 'proposedCompensation', 'sponsoringEmployer'].includes(f.id))
        .map((f) => ({ id: f.id, label: f.label, value: f.value }));

      const updated = await screeningService.sendRTR(draft.id, {
        candidateName,
        candidateEmail,
        positionTitle,
        clientName,
        proposedCompensation: getValue('proposedCompensation'),
        sponsoringEmployer: getValue('sponsoringEmployer'),
        customFields,
        bodyText
      });
      setDraft(updated);
      toast.success(
        'RTR Authorization Email Sent',
        `Right-to-Represent document dispatched to ${candidateEmail}.`
      );
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      toast.error('Send Error', err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="rtr-email-review-page" className="space-y-6">
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

      {!isAcknowledged && (
        <div
          className={`p-5 rounded-2xl border ${
            draft.status === 'sent'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {draft.status === 'sent' ? (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm uppercase font-mono tracking-wider">
                {draft.status === 'sent' ? 'Awaiting Candidate Click' : 'Draft Ready for Review'}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {draft.status === 'sent'
                  ? 'Email dispatched with a secure digital signature link.'
                  : 'AI extracted the salary expectations and position title from the screening conversation. Review terms below and send.'}
              </p>
            </div>
          </div>
        </div>
      )}

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
                Add or remove terms as needed before transmission.
              </p>
            </div>
          </div>
        </div>

        <DynamicFieldsEditor fields={fields} onChange={setFields} addLabel="Add RTR Field" />

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Body Content</label>
          <textarea
            rows={8}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Link
            to={`/screening/calls/${id}`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Back to Call Recording
          </Link>

          <button
            type="button"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={isSending || isAcknowledged}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40"
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

      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleSendRTR}
        title="Send Right-to-Represent Email"
        message={`Send binding Right-to-Represent email to ${candidateEmail} for role "${positionTitle}" at "${clientName}".`}
        confirmLabel="Send Email Now"
        isLoading={isSending}
      />
    </div>
  );
};
