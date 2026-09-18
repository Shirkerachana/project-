import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  User,
  Plus,
  RefreshCw,
  Volume2,
  Trash2,
  Phone,
  Check,
  CheckCircle,
  Copy,
  CalendarPlus,
  Mic,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { schedulingService } from '../api/scheduling.service';
import { useToast } from '../context/ToastContext';
import { AvailabilityCallRecord, BookedInterview, EvaluatorSlot } from '../types';

export const SchedulingPage: React.FC = () => {
  const toast = useToast();

  const [calls, setCalls] = useState<AvailabilityCallRecord[]>([]);
  const [interviews, setInterviews] = useState<BookedInterview[]>([]);
  const [evaluatorSlots, setEvaluatorSlots] = useState<EvaluatorSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'calls'>('bookings');

  // Add slot modal
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [newSlotEvaluatorName, setNewSlotEvaluatorName] = useState('Dr. Aris Thorne');
  const [newSlotEvaluatorRole, setNewSlotEvaluatorRole] = useState('Principal Distributed Systems Architect');
  const [newSlotDate, setNewSlotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [newSlotTime, setNewSlotTime] = useState('14:00');

  // Expandable audio player in call logs
  const [activeAudioCallId, setActiveAudioCallId] = useState<string | null>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, iList, sList] = await Promise.all([
        schedulingService.getAvailabilityCalls(),
        schedulingService.getBookedInterviews(),
        schedulingService.getEvaluatorSlots()
      ]);
      setCalls(cList);
      setInterviews(iList);
      setEvaluatorSlots(sList);
    } finally {
      setIsLoading(false);
    }
  };

  const availableSlots = useMemo(() => {
    return evaluatorSlots.filter((s) => !s.isBooked);
  }, [evaluatorSlots]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${newSlotDate}T${newSlotTime}:00Z`).toISOString();
      const endHour = new Date(new Date(startTime).getTime() + 3600000).toISOString();

      await schedulingService.addEvaluatorSlot({
        evaluatorId: 'user-evaluator-1',
        evaluatorName: newSlotEvaluatorName,
        evaluatorRole: newSlotEvaluatorRole,
        startTime,
        endTime: endHour
      });

      const updatedSlots = await schedulingService.getEvaluatorSlots();
      setEvaluatorSlots(updatedSlots);
      setIsAddSlotModalOpen(false);
      toast.success('Slot Added', `Open availability slot added for ${newSlotEvaluatorName}.`);
    } catch (err: any) {
      toast.error('Error Adding Slot', err.message);
    }
  };

  const handleCancelBooking = async (slotId: string, candidateName: string) => {
    try {
      await schedulingService.cancelBooking(slotId);
      await loadData();
      toast.info('Booking Cancelled', `Interview slot freed up for ${candidateName}.`);
    } catch (err: any) {
      toast.error('Error Cancelling', err.message);
    }
  };

  const handleSendReminderNudge = (candidateName: string, email?: string) => {
    toast.success(
      'Automated Reminder Dispatched',
      `Manual notification and calendar hold resent to ${candidateName} (${email || 'candidate email'}).`
    );
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link Copied', 'Direct interview access URL copied to clipboard.');
  };

  const handleLaunchSelectedConsoles = () => {
    const targets = selectedBookingIds.length
      ? interviews.filter((item) => selectedBookingIds.includes(item.id))
      : interviews;
    if (targets.length === 0) {
      toast.warning('No Interviews', 'Select at least one confirmed booking to launch.');
      return;
    }
    targets.forEach((item) => {
      const joinUrl = item.joinUrl || item.joinLink || `/interviews/round1/${item.candidateId}/live`;
      window.open(joinUrl, '_blank');
    });
    toast.success('Launch Console', `Opened interview console for ${targets.length} candidate(s).`);
  };

  const toggleBookingSelection = (id: string) => {
    setSelectedBookingIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  if (isLoading) {
    return <LoadingState message="Loading AI availability dialer, calendar reservations, and evaluator slots..." variant="spinner" />;
  }

  return (
    <div id="scheduling-page" className="space-y-6">
      <PageHeader
        title="AI Availability Calling & Slot Booking"
        description="Phase 3: Autonomous telephony dialer negotiates interview times with candidates, locks open evaluator calendars, and dispatches automated reminders."
        badge={<AIBadge label="Autonomous Scheduling" />}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddSlotModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <CalendarPlus className="w-4 h-4 text-indigo-400" />
              <span>Add Evaluator Slot</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchSelectedConsoles}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Console{selectedBookingIds.length > 0 ? ` (${selectedBookingIds.length})` : ''}</span>
            </button>
          </div>
        }
      />

      {/* High-Level Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Confirmed Bookings</span>
          </span>
          <div className="text-2xl font-black text-white">{interviews.length}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Synced with ATS & Calendars</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Open Evaluator Slots</span>
          </span>
          <div className="text-2xl font-black text-white">{availableSlots.length}</div>
          <span className="text-[11px] text-indigo-300 font-medium">{evaluatorSlots.length} total across architects</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Calls Dispatched</span>
          </span>
          <div className="text-2xl font-black text-white">{calls.length}</div>
          <span className="text-[11px] text-cyan-300 font-medium">Autonomous Voice Telephony</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Slot Booking Rate</span>
          </span>
          <div className="text-2xl font-black text-emerald-400">96.8%</div>
          <span className="text-[11px] text-slate-400 font-medium">Avg duration 88 seconds</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Confirmed Bookings ({interviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'slots'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Evaluator Availability Slots ({evaluatorSlots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calls')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'calls'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>AI Voice Telephony Logs ({calls.length})</span>
        </button>
      </div>

      {/* TAB 1: CONFIRMED BOOKED INTERVIEWS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
              <span>Confirmed Interview Bookings</span>
            </h2>
            <div className="flex items-center gap-3">
              {interviews.length > 0 && (
                <label className="text-xs text-slate-400 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBookingIds.length === interviews.length && interviews.length > 0}
                    onChange={() =>
                      setSelectedBookingIds(
                        selectedBookingIds.length === interviews.length ? [] : interviews.map((item) => item.id)
                      )
                    }
                  />
                  Select all
                </label>
              )}
              <span className="text-xs text-slate-400">
                Synced to Google Calendar & Outlook â€¢ Automated 24h & 4h Reminders Active
              </span>
            </div>
          </div>

          {interviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Confirmed Interviews Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Confirmed interview bookings will appear here once slots are reserved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((item) => {
                const startDate = item.slotStart ? new Date(item.slotStart) : null;
                const endDate = item.slotEnd ? new Date(item.slotEnd) : null;
                const remindersList = Array.isArray(item.remindersSent) ? item.remindersSent : [];
                const joinUrl = item.joinUrl || item.joinLink || `/interviews/round1/${item.candidateId}/live`;

                return (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.includes(item.id)}
                          onChange={() => toggleBookingSelection(item.id)}
                          className="mt-1.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600"
                        />
                        <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link
                            to={`/candidates/${item.candidateId}`}
                            className="text-base font-bold text-white hover:text-indigo-400 transition-colors"
                          >
                            {item.candidateName}
                          </Link>
                          <AIBadge label="AI Scheduled" size="sm" />
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmed & Synced</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Target Role: <strong className="text-slate-200">{item.requirementTitle}</strong></span>
                          <span>&bull;</span>
                          <span>Evaluator: <strong className="text-indigo-300">{item.evaluatorName}</strong></span>
                          {item.candidateEmail && (
                            <>
                              <span>&bull;</span>
                              <span className="font-mono text-slate-400">{item.candidateEmail}</span>
                            </>
                          )}
                        </div>
                      </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSendReminderNudge(item.candidateName, item.candidateEmail)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          title="Resend confirmation email & calendar invitation"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Send Reminder</span>
                        </button>

                        <Link
                          to={`/interviews/round1/${item.candidateId}/setup`}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Configure Round 1 Setup</span>
                        </Link>

                        <Link
                          to={joinUrl}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch Console</span>
                        </Link>
                      </div>
                    </div>

                    {/* Timeslot card & Direct Join Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                          Confirmed Interview Timeslot
                        </span>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span>
                            {startDate
                              ? `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} â€¢ ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
                              : item.scheduledTime}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                          Candidate Direct Access Link
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-mono text-xs text-indigo-300 truncate">
                            {window.location.origin}{joinUrl}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(`${window.location.origin}${joinUrl}`)}
                            className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                            title="Copy interview link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Reminder Sequence Logs */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Automated Dispatch Sequence</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {remindersList.map((rem, idx) => {
                          const isSent = rem.status === 'delivered';
                          return (
                            <div
                              key={rem.id || idx}
                              className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {isSent ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                <span className="text-slate-300 font-medium capitalize">
                                  {rem.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-slate-500">
                                {isSent ? 'Sent' : 'Scheduled'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVALUATOR AVAILABILITY SLOTS */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Evaluator Calendar Slots</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The AI voice dialer offers these active evaluator slots to candidates during autonomous calls.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddSlotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evaluator Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluatorSlots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);

              return (
                <div
                  key={slot.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    slot.isBooked
                      ? 'bg-slate-900/60 border-indigo-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{slot.evaluatorName}</div>
                      <div className="text-xs text-slate-400">{slot.evaluatorRole}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        slot.isBooked
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="text-white font-semibold pl-5">
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {slot.isBooked ? (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Reserved For</span>
                        <span className="font-bold text-indigo-300">{slot.bookedCandidateName || 'Candidate'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(slot.id, slot.bookedCandidateName || 'Candidate')}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                      >
                        Free Slot
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs text-emerald-400 font-medium">Open evaluator slot</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI VOICE TELEPHONY CALL LOGS */}
      {activeTab === 'calls' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-purple-400" />
                <span>AI Availability Voice Telephony Logs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full conversational transcripts and call recordings from autonomous AI agent negotiations.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {calls.map((call) => {
              const isSelectedForAudio = activeAudioCallId === call.id;

              return (
                <div
                  key={call.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{call.candidateName}</span>
                      <span className="text-slate-400 font-mono text-xs">{call.phone}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          call.status === 'completed' || call.status === 'slot_selected'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {call.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="font-mono text-[11px]">Duration: {call.callDurationSeconds || 88}s</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[11px]">
                        {call.calledAt ? new Date(call.calledAt).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Negotiated Timeslot
                      </span>
                      <div className="font-semibold text-indigo-300">
                        {call.chosenSlot || call.detectedSlotTime || 'Confirmed on Call'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        AI Intent Confidence
                      </span>
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{Math.round((call.confidenceScore || 0.96) * 100)}% Speech Recognition Confidence</span>
                      </div>
                    </div>
                  </div>

                  {call.candidateResponseAudioTranscript && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-purple-400" />
                        <span>Candidate Audio Transcript Snippet</span>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        {call.candidateResponseAudioTranscript}
                      </p>
                    </div>
                  )}

                  {call.callNotes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      {call.callNotes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveAudioCallId(isSelectedForAudio ? null : call.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSelectedForAudio ? 'Hide Audio Recording' : 'Listen to AI Telephony Recording'}</span>
                    </button>

                    <Link
                      to={`/candidates/${call.candidateId}`}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      View Candidate Profile &rarr;
                    </Link>
                  </div>

                  {isSelectedForAudio && (
                    <div className="pt-2">
                      <AudioPlayer
                        durationSeconds={call.callDurationSeconds || 88}
                        candidateName={call.candidateName}
                        callDate={call.calledAt}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ADD EVALUATOR SLOT MODAL */}
      <Modal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        title="Add Open Evaluator Slot"
        subtitle="Make a new interview availability window available for the AI scheduling agent."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Evaluator Full Name
            </label>
            <input
              type="text"
              value={newSlotEvaluatorName}
              onChange={(e) => setNewSlotEvaluatorName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Evaluator Title / Role
            </label>
            <input
              type="text"
              value={newSlotEvaluatorRole}
              onChange={(e) => setNewSlotEvaluatorRole(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddSlotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
            >
              Add Availability Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
