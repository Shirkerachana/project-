import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  PhoneCall,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Send,
  Bell,
  AlertCircle,
  Play,
  Loader2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { schedulingService } from '../api/scheduling.service';
import { candidatesService } from '../api/candidates.service';
import { useToast } from '../context/ToastContext';
import { AvailabilityCallRecord, BookedInterview, Candidate } from '../types';

export const SchedulingPage: React.FC = () => {
  const toast = useToast();

  const [calls, setCalls] = useState<AvailabilityCallRecord[]>([]);
  const [interviews, setInterviews] = useState<BookedInterview[]>([]);
  const [eligibleCandidates, setEligibleCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger call modal
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  // Active call monitoring simulation
  const [activeCallingId, setActiveCallingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, iList, candList] = await Promise.all([
        schedulingService.getAvailabilityCalls(),
        schedulingService.getBookedInterviews(),
        candidatesService.getAll()
      ]);
      setCalls(cList);
      setInterviews(iList);

      // Candidates ready for availability call (Phase 2 completed & Ceipal submitted)
      const eligible = candList.filter(
        (c) => c.status === 'Ceipal_Submitted' || c.status === 'Availability_Calling' || c.status === 'Slot_Booked'
      );
      setEligibleCandidates(eligible);
      if (eligible.length > 0) setSelectedCandidateId(eligible[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCallNow = async () => {
    if (!selectedCandidateId) return;
    setIsCalling(true);
    try {
      const record = await schedulingService.triggerAvailabilityCall(selectedCandidateId);
      setActiveCallingId(record.id);
      setIsTriggerModalOpen(false);
      toast.success(
        'AI Availability Call Triggered',
        `Automated voice dialer calling ${record.candidateName} to offer open evaluator slots.`
      );

      // Poll state after delay
      setTimeout(async () => {
        await loadData();
        setActiveCallingId(null);
        toast.info(
          'Slot Confirmed',
          `${record.candidateName} selected slot: ${record.chosenSlot || 'Thursday 2:00 PM EST'}. Calendar invite synced.`
        );
      }, 4000);
    } catch (err: any) {
      toast.error('Trigger Error', err.message);
    } finally {
      setIsCalling(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading availability dialer and calendar records..." variant="spinner" />;

  return (
    <div id="scheduling-page" className="space-y-6">
      <PageHeader
        title="AI Availability Calling & Slot Booking"
        description="Phase 3: Automated telephony agent negotiates interview availability with candidates and confirms calendar reservations."
        badge={<AIBadge label="Autonomous Scheduling" />}
        actions={
          <button
            type="button"
            onClick={() => setIsTriggerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Trigger Availability Call</span>
          </button>
        }
      />

      {/* Live In-Progress Dialing Monitor */}
      {activeCallingId && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center border border-purple-500/40">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>AI Automated Availability Negotiation In Progress</span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                AI voice dialer is presenting evaluator slots to candidate via telephone WebRTC stream...
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-purple-300 font-bold px-3 py-1 rounded bg-purple-900/60 border border-purple-500/40">
            CONNECTING CALL
          </span>
        </div>
      )}

      {/* Grid: Booked Interviews & Calendar Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Confirmed Booked Interviews with Reminders */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
              <span>Confirmed Interview Bookings ({interviews.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Synced to Google & Outlook Calendar</span>
          </div>

          <div className="space-y-4">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">{item.candidateName}</h3>
                      <AIBadge label="AI Scheduled" size="sm" />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Position: {item.requirementTitle} &bull; Evaluator: {item.evaluatorName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Calendar Synced</span>
                    </span>
                    <Link
                      to={`/interviews/round1/${item.candidateId}/setup`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                    >
                      Round 1 Setup
                    </Link>
                  </div>
                </div>

                {/* Timeslot card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Confirmed Timeslot
                    </span>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>
                        {new Date(item.slotStart).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        &bull;{' '}
                        {new Date(item.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        -{' '}
                        {new Date(item.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Candidate Direct Access Link
                    </span>
                    <div className="font-mono text-xs text-indigo-300 truncate">
                      {item.joinLink}
                    </div>
                  </div>
                </div>

                {/* Reminder Dispatch Logs */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Automated Reminder Logs</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.remindersSent.map((rem, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-300 font-medium">{rem.type} Reminder</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(rem.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 cols: Call Records History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-purple-400" />
              <span>Availability Calls ({calls.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{call.candidateName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      call.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {call.status}
                  </span>
                </div>

                <div className="text-slate-400">
                  Offered: {call.offeredSlots?.length ?? 0} slots &bull; Chosen: <strong className="text-indigo-300">{call.chosenSlot || 'None'}</strong>
                </div>

                <p className="text-[11px] text-slate-400/90 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  {call.callNotes}
                </p>

                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Call Time: {new Date(call.calledAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trigger Modal */}
      <Modal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        title="Trigger AI Availability Phone Call"
        subtitle="AI voice agent will call candidate to negotiate interview slot."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Ceipal-Approved Candidate
            </label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {eligibleCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} &bull; {c.requirementTitle} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Dispatch Mode
            </label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Immediate Telephony Dialing (Voice Agent queries active Evaluator Slots)
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTriggerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartCallNow}
              disabled={isCalling}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isCalling ? 'Dialing...' : 'Start AI Voice Call Now'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
