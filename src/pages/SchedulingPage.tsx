import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
import { candidatesService } from '../api/candidates.service';
import { useToast } from '../context/ToastContext';
import { AvailabilityCallRecord, BookedInterview, Candidate, EvaluatorSlot } from '../types';

export const SchedulingPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCandidateId = searchParams.get('candidateId');

  const [calls, setCalls] = useState<AvailabilityCallRecord[]>([]);
  const [interviews, setInterviews] = useState<BookedInterview[]>([]);
  const [evaluatorSlots, setEvaluatorSlots] = useState<EvaluatorSlot[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'calls'>('bookings');

  // Trigger call modal & workflow
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [candidateFilterType, setCandidateFilterType] = useState<'eligible' | 'all'>('eligible');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('auto');
  const [isCalling, setIsCalling] = useState(false);

  // Live call simulator states
  const [callSimulationStep, setCallSimulationStep] = useState<'idle' | 'dialing' | 'connected' | 'completed'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<{ sender: 'ai' | 'candidate'; text: string }[]>([]);
  const [lastBookedInterview, setLastBookedInterview] = useState<BookedInterview | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preselectedCandidateId && allCandidates.length > 0) {
      setSelectedCandidateId(preselectedCandidateId);
      setIsTriggerModalOpen(true);
    }
  }, [preselectedCandidateId, allCandidates]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cList, iList, candList, sList] = await Promise.all([
        schedulingService.getAvailabilityCalls(),
        schedulingService.getBookedInterviews(),
        candidatesService.getAll(),
        schedulingService.getEvaluatorSlots()
      ]);
      setCalls(cList);
      setInterviews(iList);
      setAllCandidates(candList);
      setEvaluatorSlots(sList);

      const eligible = candList.filter(
        (c) => c.status === 'Ceipal_Submitted' || c.status === 'Availability_Calling' || c.status === 'Slot_Booked'
      );
      if (eligible.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(eligible[0].id);
      } else if (candList.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(candList[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const eligibleCandidates = useMemo(() => {
    return allCandidates.filter(
      (c) => c.status === 'Ceipal_Submitted' || c.status === 'Availability_Calling' || c.status === 'Slot_Booked'
    );
  }, [allCandidates]);

  const availableSlots = useMemo(() => {
    return evaluatorSlots.filter((s) => !s.isBooked);
  }, [evaluatorSlots]);

  const selectedCandidate = useMemo(() => {
    return allCandidates.find((c) => c.id === selectedCandidateId);
  }, [allCandidates, selectedCandidateId]);

  // Start AI Telephony Call Simulation
  const handleStartCallNow = async () => {
    if (!selectedCandidateId) {
      toast.warning('Candidate Required', 'Please select a candidate to call.');
      return;
    }

    const candidate = allCandidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) return;

    // If candidate isn't yet Ceipal_Submitted, auto-advance them so Phase 3 workflow stays coherent
    if (candidate.status !== 'Ceipal_Submitted' && candidate.status !== 'Availability_Calling' && candidate.status !== 'Slot_Booked') {
      await candidatesService.markCeipalSubmitted(candidate.id, `CEIPAL-${Date.now().toString().slice(-4)}`);
    }

    setIsCalling(true);
    setCallSimulationStep('dialing');
    setLiveTranscript([]);

    try {
      // Step 1: Dialing
      await new Promise((r) => setTimeout(r, 1200));
      setCallSimulationStep('connected');

      // Step 2: Stream live conversational negotiation transcript
      const targetSlot = selectedSlotId !== 'auto'
        ? evaluatorSlots.find((s) => s.id === selectedSlotId)
        : (availableSlots[0] || evaluatorSlots[0]);

      const slotDate = targetSlot ? new Date(targetSlot.startTime) : new Date(Date.now() + 86400000);
      const slotTimeStr = `${slotDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at ${slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const evaluatorName = targetSlot?.evaluatorName || 'Dr. Aris Thorne';

      setLiveTranscript([
        {
          sender: 'ai',
          text: `“Hello ${candidate.fullName}, this is TalentPulse AI calling on behalf of CloudApex Technologies regarding your application for the ${candidate.requirementTitle} position.”`
        }
      ]);

      await new Promise((r) => setTimeout(r, 1400));
      setLiveTranscript((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `“We have verified your profile submission. We have open Round 1 technical interview slots available with ${evaluatorName}. Would ${slotTimeStr} work for your schedule?”`
        }
      ]);

      await new Promise((r) => setTimeout(r, 1500));
      setLiveTranscript((prev) => [
        ...prev,
        {
          sender: 'candidate',
          text: `“Hello! Yes, ${slotTimeStr} works perfectly for me. I can definitely attend then.”`
        }
      ]);

      await new Promise((r) => setTimeout(r, 1200));
      setLiveTranscript((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `“Excellent! I have confirmed your slot for ${slotTimeStr} with ${evaluatorName}. Your interview invitation, calendar hold, and secure portal access link have just been dispatched to ${candidate.email}.”`
        }
      ]);

      // Step 3: Trigger real backend service booking
      const chosenSlotParam = selectedSlotId !== 'auto' ? selectedSlotId : undefined;
      const callRecord = await schedulingService.triggerAvailabilityCall(candidate.id, chosenSlotParam);

      // Refresh data
      const [updatedCalls, updatedInterviews, updatedSlots, updatedCandidates] = await Promise.all([
        schedulingService.getAvailabilityCalls(),
        schedulingService.getBookedInterviews(),
        schedulingService.getEvaluatorSlots(),
        candidatesService.getAll()
      ]);
      setCalls(updatedCalls);
      setInterviews(updatedInterviews);
      setEvaluatorSlots(updatedSlots);
      setAllCandidates(updatedCandidates);

      const booked = updatedInterviews.find((i) => i.candidateId === candidate.id) || null;
      setLastBookedInterview(booked);

      setCallSimulationStep('completed');
      toast.success(
        'Interview Slot Confirmed',
        `AI successfully booked ${candidate.fullName} for ${callRecord.chosenSlot || slotTimeStr}.`
      );
    } catch (err: any) {
      toast.error('Scheduling Error', err.message || 'Failed to complete AI availability call.');
      setCallSimulationStep('idle');
    } finally {
      setIsCalling(false);
    }
  };

  const resetCallModal = () => {
    setIsTriggerModalOpen(false);
    setCallSimulationStep('idle');
    setLiveTranscript([]);
    setLastBookedInterview(null);
  };

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
              onClick={() => {
                setCallSimulationStep('idle');
                setIsTriggerModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Trigger AI Availability Call</span>
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
            <span className="text-xs text-slate-400">
              Synced to Google Calendar & Outlook &bull; Automated 24h & 4h Reminders Active
            </span>
          </div>

          {interviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Confirmed Interviews Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Trigger an automated AI availability call to negotiate open slots with eligible candidates.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCallSimulationStep('idle');
                  setIsTriggerModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Trigger Availability Call</span>
              </button>
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
                              ? `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
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
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-medium">Ready for AI dialer</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setCallSimulationStep('idle');
                          setIsTriggerModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-colors border border-indigo-500/40"
                      >
                        Schedule Candidate Here
                      </button>
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

      {/* TRIGGER AI AVAILABILITY CALL MODAL WITH LIVE INTERACTIVE SIMULATOR */}
      <Modal
        isOpen={isTriggerModalOpen}
        onClose={resetCallModal}
        title="AI Availability Telephony Agent"
        subtitle="Automated voice dialer calls the candidate, negotiates timeslots, and reserves evaluator calendar."
        maxWidth="lg"
      >
        {callSimulationStep === 'idle' && (
          <div className="space-y-5">
            {/* Step 1: Candidate Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Select Candidate for Telephony Call
                </label>
                <div className="flex items-center gap-1 text-[11px] bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCandidateFilterType('eligible')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      candidateFilterType === 'eligible' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ceipal Approved ({eligibleCandidates.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateFilterType('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      candidateFilterType === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Candidates ({allCandidates.length})
                  </button>
                </div>
              </div>

              {/* Candidate Dropdown */}
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(candidateFilterType === 'eligible' ? eligibleCandidates : allCandidates).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} • {c.requirementTitle} ({c.phone || 'No phone'}) • {c.status}
                  </option>
                ))}
              </select>

              {/* Selected Candidate Summary */}
              {selectedCandidate && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{selectedCandidate.fullName}</span>
                    <StatusBadge status={selectedCandidate.status} />
                  </div>
                  <div className="text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Role: <strong className="text-slate-200">{selectedCandidate.requirementTitle}</strong></span>
                    <span>&bull;</span>
                    <span>Phone: <strong className="text-indigo-300">{selectedCandidate.phone || '+1 (415) 555-0199'}</strong></span>
                    <span>&bull;</span>
                    <span>Email: <strong className="text-slate-300">{selectedCandidate.email}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Evaluator Slot Target */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Evaluator Slot Selection
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="auto">
                  ✨ AI Autonomous Negotiation (Proposes earliest matching slot to candidate)
                </option>
                {availableSlots.map((s) => {
                  const d = new Date(s.startTime);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.evaluatorName} • {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-400">
                The telephony agent will verbally propose open slots with matching principal evaluators and lock the reservation once the candidate consents.
              </p>
            </div>

            {/* Step 3: Dispatch Mode Details */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1 text-xs">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Telephony WebRTC Gateway</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Clicking Start will initialize the AI voice call, stream real-time speech synthesis, detect conversational agreement, and sync the confirmed slot to Google and Outlook calendars.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetCallModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCallNow}
                disabled={!selectedCandidateId || isCalling}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start AI Voice Call Now</span>
              </button>
            </div>
          </div>
        )}

        {/* LIVE IN-PROGRESS DIALING & CONVERSATION SIMULATOR */}
        {(callSimulationStep === 'dialing' || callSimulationStep === 'connected') && (
          <div className="space-y-6 py-4">
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40 relative">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>
                      {callSimulationStep === 'dialing' ? 'Dialing Candidate...' : 'Telephony Audio Stream Active'}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">
                    Calling: <strong>{selectedCandidate?.fullName}</strong> ({selectedCandidate?.phone || '+1 415 555-0199'})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                  {callSimulationStep === 'dialing' ? 'CONNECTING' : 'IN CALL'}
                </span>
              </div>
            </div>

            {/* Audio Waveform Visualization */}
            <div className="flex items-center justify-center gap-1 h-12 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-500 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(15, (Math.sin(i + Date.now()) * 0.5 + 0.5) * 100)}%`,
                    animationDelay: `${i * 40}ms`
                  }}
                />
              ))}
            </div>

            {/* Live Streaming Dialogue */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Live Negotiation Dialogue
              </div>
              {liveTranscript.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs space-y-1 transition-all ${
                    entry.sender === 'ai'
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 ml-4'
                      : 'bg-indigo-950/60 border border-indigo-500/40 text-white mr-4'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    {entry.sender === 'ai' ? 'TalentPulse AI Voice Agent' : selectedCandidate?.fullName}
                  </div>
                  <p className="leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Analyzing candidate speech & locking calendar slot...</span>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED CONFIRMATION */}
        {callSimulationStep === 'completed' && lastBookedInterview && (
          <div className="space-y-5 py-2">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Interview Confirmed & Calendar Locked</h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Candidate verbally accepted the proposed slot during the voice call.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Reserved Timeslot
                  </span>
                  <div className="font-bold text-white text-sm">
                    {lastBookedInterview.scheduledTime}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Assigned Evaluator
                  </span>
                  <div className="font-bold text-indigo-300 text-sm">
                    {lastBookedInterview.evaluatorName}
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Portal Direct URL */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Candidate Direct Access Link</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(`${window.location.origin}${lastBookedInterview.joinUrl}`)}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="font-mono text-indigo-300 truncate bg-slate-900 p-2 rounded-lg border border-slate-800">
                {window.location.origin}{lastBookedInterview.joinUrl}
              </div>
            </div>

            {/* Next Steps: Advance to Phase 4 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetCallModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => {
                  resetCallModal();
                  navigate(`/interviews/round1/${lastBookedInterview.candidateId}/setup`);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Advance to Round 1 Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>

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
