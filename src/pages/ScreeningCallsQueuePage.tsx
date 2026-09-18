import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Play,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { calendarService } from '../api/calendar.service';
import { screeningService } from '../api/screening.service';
import { candidatesService } from '../api/candidates.service';
import { emailService } from '../api/email.service';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ScreeningCall, Candidate } from '../types';

export const ScreeningCallsQueuePage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [calls, setCalls] = useState<ScreeningCall[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [isBulkCallModalOpen, setIsBulkCallModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [bulkCandidateIds, setBulkCandidateIds] = useState<string[]>([]);
  const [selectedCallIds, setSelectedCallIds] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isBulkActing, setIsBulkActing] = useState(false);

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
      await Promise.all(
        allCalls
          .filter((call) => (call.transcript && call.transcript.length > 0) || call.recruiterNotes)
          .map((call) =>
            calendarService.upsertScreeningTranscriptEvent({
              callId: call.id,
              candidateId: call.candidateId,
              candidateName: call.candidateName,
              roleTitle: call.requirementTitle,
              scheduledAt: call.scheduledAt,
              durationSeconds: call.durationSeconds,
              summary: call.recruiterNotes,
              transcript: call.transcript,
              score: call.overallScore,
              phone: call.candidatePhone
            })
          )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCalls = calls.filter((c) => selectedCallIds.includes(c.id));
  const selectedCandidateIdsFromCalls: string[] = Array.from(new Set(selectedCalls.map((c) => c.candidateId)));

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

  const handleBulkCall = async () => {
    const ids = selectedCandidateIdsFromCalls.length > 0 ? selectedCandidateIdsFromCalls : bulkCandidateIds;
    if (ids.length === 0) {
      toast.warning('Select Candidates', 'Choose at least one candidate to start bulk calling.');
      return;
    }
    setIsBulkActing(true);
    try {
      const created = await screeningService.bookBatchCalls(ids);
      toast.success('Bulk Calls Initialized', `${created.length} AI screening call(s) started.`);
      setIsBulkCallModalOpen(false);
      setBulkCandidateIds([]);
      setSelectedCallIds([]);
      await loadCalls();
    } catch (err: any) {
      toast.error('Bulk Call Error', err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleBulkMail = async () => {
    if (selectedCalls.length === 0) {
      toast.warning('Select Candidates', 'Select candidates from the list to send mail.');
      return;
    }
    setIsBulkActing(true);
    try {
      for (const call of selectedCalls) {
        await emailService.sendEmail(
          {
            recipient: call.candidateEmail,
            subject: `Screening follow-up: ${call.requirementTitle}`,
            body: `Hello ${call.candidateName},\n\nThank you for completing your AI voice screening call for the ${call.requirementTitle} role. Our team will follow up with next steps shortly.\n\nBest regards,\nTalentPulse Recruitment`
          },
          user ? { id: user.id, name: user.name, email: user.email, role } : undefined
        );
      }
      toast.success('Bulk Mail Sent', `Dispatched follow-up email to ${selectedCalls.length} candidate(s).`);
      navigate('/email');
    } catch (err: any) {
      toast.error('Mail Error', err.message);
    } finally {
      setIsBulkActing(false);
    }
  };

  const handleProceedApprovals = async () => {
    const ids = selectedCandidateIdsFromCalls;
    setIsBulkActing(true);
    try {
      if (ids.length > 0) {
        for (const candidateId of ids) {
          await candidatesService.updateStatus(candidateId, 'Profile_Pending_Approval');
        }
        toast.success('Sent to Approvals', `${ids.length} candidate(s) forwarded to Team Manager Approvals.`);
      }
      navigate('/approvals');
    } catch (err: any) {
      toast.error('Approval Error', err.message);
    } finally {
      setIsBulkActing(false);
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
            {call.candidatePhone} • Call ID: {call.id}
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
              <span className="text-base font-black text-emerald-400 font-mono">{call.overallScore}</span>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleProceedApprovals}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              <UserCheck className="w-4 h-4" />
              <span>Proceed to Team Manager Approvals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={async () => {
                const latest = await candidatesService.getAll();
                setCandidates(latest);
                setIsBulkCallModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Bulk Calling</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNewCallModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Book Single Screening Call</span>
            </button>
          </div>
        }
      />

      {selectedCallIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-bold text-white">{selectedCallIds.length} candidate(s) selected</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkCall}
              disabled={isBulkActing}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Bulk Call
            </button>
            <button
              type="button"
              onClick={handleBulkMail}
              disabled={isBulkActing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold"
            >
              Bulk Mail
            </button>
            <button
              type="button"
              onClick={handleProceedApprovals}
              disabled={isBulkActing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Proceed to Team Manager Approvals
            </button>
          </div>
        </div>
      )}

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
            <div className="text-2xl font-black text-emerald-400">{calls.filter((c) => c.status === 'completed').length}</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Low Confidence Flags</div>
            <div className="text-2xl font-black text-amber-400">{calls.filter((c) => c.overallConfidence === 'low').length}</div>
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
        selectedIds={selectedCallIds}
        onSelectToggle={(id) =>
          setSelectedCallIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
        }
        onSelectAll={(ids) => setSelectedCallIds(ids)}
        emptyTitle="No screening calls found"
        emptyDescription="Schedule a screening call with a sourced candidate to begin."
      />

      {isNewCallModalOpen && (
        <div className="tp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              Initiate AI Automated Voice Call
            </h3>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.requirementTitle})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsNewCallModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleBookSingleCall} disabled={isBooking} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                {isBooking ? 'Initiating...' : 'Call Candidate Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkCallModalOpen && (
        <div className="tp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Bulk AI Screening Calls</h3>
            <p className="text-xs text-slate-400">Select multiple candidates. Each selected candidate will receive an AI screening call.</p>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={candidates.length > 0 && bulkCandidateIds.length === candidates.length}
                onChange={() =>
                  setBulkCandidateIds(
                    bulkCandidateIds.length === candidates.length ? [] : candidates.map((c) => c.id)
                  )
                }
              />
              Select all
            </label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {candidates.map((c) => {
                const checked = bulkCandidateIds.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setBulkCandidateIds((prev) => (checked ? prev.filter((id) => id !== c.id) : [...prev, c.id]))
                      }
                    />
                    <span className="font-semibold">{c.fullName}</span>
                    <span className="text-slate-500">{c.requirementTitle}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsBulkCallModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleBulkCall} disabled={isBulkActing} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                {isBulkActing ? 'Initializing...' : `Start ${bulkCandidateIds.length || 0} Call(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
