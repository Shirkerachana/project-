import { AvailabilityCall, EvaluatorSlot, Candidate, BookedInterview, ReminderLog } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_AVAILABILITY_CALLS, INITIAL_EVALUATOR_SLOTS, INITIAL_CANDIDATES } from './mockData';

const AVAIL_CALLS_KEY = 'avail_calls_list';
const SLOTS_KEY = 'evaluator_slots_list';
const CANDIDATES_KEY = 'candidates_list';

export const schedulingService = {
  /**
   * CONTRACT:
   * GET /api/scheduling/:candidateId
   * Response: { call: AvailabilityCall | null, bookedSlot: EvaluatorSlot | null }
   * Auth Required: true
   */
  async getAvailabilityCall(candidateId: string): Promise<{
    call: AvailabilityCall | null;
    bookedSlot: EvaluatorSlot | null;
  }> {
    return simulateDelay(() => {
      const calls = getPersistentState<AvailabilityCall[]>(AVAIL_CALLS_KEY, INITIAL_AVAILABILITY_CALLS);
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const call = calls.find((c) => c.candidateId === candidateId) || null;
      const bookedSlot = call?.detectedSlotId
        ? slots.find((s) => s.id === call.detectedSlotId) || null
        : null;

      return { call, bookedSlot };
    });
  },

  /**
   * CONTRACT:
   * POST /api/scheduling/:candidateId/trigger-call
   * Triggers AI agent phone call to candidate to negotiate slot
   * Response: AvailabilityCall
   * Auth Required: true (Recruiter)
   */
  async triggerAvailabilityCall(candidateId: string, preferredSlotId?: string): Promise<AvailabilityCall> {
    return simulateDelay(() => {
      const calls = getPersistentState<AvailabilityCall[]>(AVAIL_CALLS_KEY, INITIAL_AVAILABILITY_CALLS);
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const candidate = candidates.find((c) => c.id === candidateId);

      let targetSlot: EvaluatorSlot | undefined;
      if (preferredSlotId) {
        targetSlot = slots.find((s) => s.id === preferredSlotId);
      }
      if (!targetSlot) {
        targetSlot = slots.find((s) => !s.isBooked);
      }

      // If all existing slots are booked, generate a fresh upcoming slot
      if (!targetSlot) {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 2);
        nextDay.setHours(14, 0, 0, 0);
        const endHour = new Date(nextDay);
        endHour.setHours(15, 0, 0, 0);

        targetSlot = {
          id: `slot-${Date.now()}`,
          evaluatorId: 'user-evaluator-1',
          evaluatorName: 'Dr. Aris Thorne',
          evaluatorRole: 'Principal Distributed Systems Architect',
          startTime: nextDay.toISOString(),
          endTime: endHour.toISOString(),
          isBooked: false
        };
        slots.push(targetSlot);
      }

      // Mark slot booked
      targetSlot.isBooked = true;
      targetSlot.bookedCandidateId = candidateId;
      targetSlot.bookedCandidateName = candidate?.fullName || 'Candidate';
      savePersistentState(SLOTS_KEY, slots);

      const sessionToken = `session-${candidateId}-${Date.now()}`;
      const slotDate = new Date(targetSlot.startTime);
      const formattedSlotTime = `${slotDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at ${slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const reminders: ReminderLog[] = [
        {
          id: `rem-conf-${Date.now()}`,
          type: 'immediate_confirmation',
          scheduledTime: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          status: 'delivered',
          joinUrl: `/interview/${sessionToken}`
        },
        {
          id: `rem-day-${Date.now()}`,
          type: '1_day_before',
          scheduledTime: new Date(slotDate.getTime() - 86400000).toISOString(),
          status: 'pending',
          joinUrl: `/interview/${sessionToken}`
        },
        {
          id: `rem-4hr-${Date.now()}`,
          type: '4_hours_before',
          scheduledTime: new Date(slotDate.getTime() - 14400000).toISOString(),
          status: 'pending',
          joinUrl: `/interview/${sessionToken}`
        }
      ];

      const newCall: AvailabilityCall = {
        id: `avail-${Date.now()}`,
        candidateId,
        candidateName: candidate ? candidate.fullName : 'Candidate',
        phone: candidate?.phone || '+1 (415) 555-0199',
        status: 'slot_selected',
        triggeredAt: new Date().toISOString(),
        calledAt: new Date().toISOString(),
        candidateResponseAudioTranscript: `“Yes, the proposed slot on ${formattedSlotTime} with ${targetSlot.evaluatorName} works perfectly for me. I have added it to my calendar.”`,
        callNotes: `AI Voice Agent connected with ${candidate?.fullName || 'candidate'}. Offered available slots with ${targetSlot.evaluatorName}. Candidate selected ${formattedSlotTime}. Google Calendar invite & reminder sequence dispatched.`,
        detectedSlotId: targetSlot.id,
        detectedSlotTime: formattedSlotTime,
        chosenSlot: formattedSlotTime,
        chosenTime: formattedSlotTime,
        scheduledDate: slotDate.toISOString().split('T')[0],
        offeredSlots: slots.slice(0, 3),
        confidenceScore: 0.98,
        callDurationSeconds: 88,
        callRecordingUrl: 'https://audio.mockrecruitment.internal/calls/avail-latest.mp3',
        reminders
      };

      const filteredCalls = calls.filter((c) => c.candidateId !== candidateId);
      const updatedCalls = [newCall, ...filteredCalls];
      savePersistentState(AVAIL_CALLS_KEY, updatedCalls);

      // Update candidate status
      const cIndex = candidates.findIndex((c) => c.id === candidateId);
      if (cIndex !== -1) {
        candidates[cIndex] = {
          ...candidates[cIndex],
          phase: 3,
          status: 'Slot_Booked',
          availabilityCallId: newCall.id,
          bookedSlotId: targetSlot.id,
          interviewSessionToken: sessionToken,
          updatedAt: new Date().toISOString()
        };
        savePersistentState(CANDIDATES_KEY, candidates);
      }

      return newCall;
    }, 800, 1400);
  },

  /**
   * CONTRACT:
   * POST /api/scheduling/:candidateId/retry
   * Response: AvailabilityCall
   * Auth Required: true
   */
  async retryCall(candidateId: string): Promise<AvailabilityCall> {
    return this.triggerAvailabilityCall(candidateId);
  },

  async getAvailabilityCalls(): Promise<AvailabilityCall[]> {
    return simulateDelay(() => {
      const calls = getPersistentState<AvailabilityCall[]>(AVAIL_CALLS_KEY, INITIAL_AVAILABILITY_CALLS);
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      return calls.map((c) => {
        const slot = slots.find((s) => s.id === c.detectedSlotId);
        const defaultTime = slot ? new Date(slot.startTime).toLocaleString() : 'Fri, Sep 20, 10:00 AM';
        return {
          ...c,
          calledAt: c.calledAt || c.triggeredAt || new Date().toISOString(),
          callNotes: c.callNotes || c.candidateResponseAudioTranscript || 'AI negotiated slot confirmation with candidate.',
          chosenSlot: c.chosenSlot || c.detectedSlotTime || defaultTime,
          chosenTime: c.chosenTime || c.detectedSlotTime || defaultTime,
          scheduledDate: c.scheduledDate || '2026-09-20',
          callDurationSeconds: c.callDurationSeconds || 94,
          callRecordingUrl: c.callRecordingUrl || 'https://audio.mockrecruitment.internal/calls/avail-01.mp3',
          offeredSlots: c.offeredSlots || slots.slice(0, 3)
        };
      });
    });
  },

  async getEvaluatorSlots(): Promise<EvaluatorSlot[]> {
    return simulateDelay(() => {
      return getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
    });
  },

  async addEvaluatorSlot(slot: Omit<EvaluatorSlot, 'id' | 'isBooked'>): Promise<EvaluatorSlot> {
    return simulateDelay(() => {
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const newSlot: EvaluatorSlot = {
        ...slot,
        id: `slot-${Date.now()}`,
        isBooked: false
      };
      const updated = [...slots, newSlot];
      savePersistentState(SLOTS_KEY, updated);
      return newSlot;
    });
  },

  async getBookedInterviews(): Promise<BookedInterview[]> {
    return simulateDelay(() => {
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const calls = getPersistentState<AvailabilityCall[]>(AVAIL_CALLS_KEY, INITIAL_AVAILABILITY_CALLS);

      return slots
        .filter((s) => s.isBooked)
        .map((s) => {
          const cand = candidates.find((c) => c.id === s.bookedCandidateId);
          const call = calls.find((c) => c.candidateId === s.bookedCandidateId);
          const joinUrl = `/interviews/round1/${s.bookedCandidateId || 'cand-001'}/live`;

          const defaultReminders: ReminderLog[] = (call?.reminders && call.reminders.length > 0)
            ? call.reminders
            : [
                {
                  id: `rem-1-${s.id}`,
                  type: 'immediate_confirmation',
                  scheduledTime: new Date().toISOString(),
                  sentAt: new Date().toISOString(),
                  status: 'delivered',
                  joinUrl
                },
                {
                  id: `rem-2-${s.id}`,
                  type: '1_day_before',
                  scheduledTime: new Date(new Date(s.startTime).getTime() - 86400000).toISOString(),
                  status: 'pending',
                  joinUrl
                },
                {
                  id: `rem-3-${s.id}`,
                  type: '4_hours_before',
                  scheduledTime: new Date(new Date(s.startTime).getTime() - 14400000).toISOString(),
                  status: 'pending',
                  joinUrl
                }
              ];

          const startDate = new Date(s.startTime);
          const endDate = new Date(s.endTime);

          return {
            id: `book-${s.id}`,
            candidateId: s.bookedCandidateId || 'cand-001',
            candidateName: s.bookedCandidateName || cand?.fullName || 'Candidate',
            candidateEmail: cand?.email,
            candidatePhone: cand?.phone,
            requirementTitle: cand?.requirementTitle || 'Staff Distributed Systems Engineer',
            evaluatorName: s.evaluatorName,
            evaluatorRole: s.evaluatorRole,
            slotStart: s.startTime,
            slotEnd: s.endTime,
            scheduledTime: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            joinUrl,
            joinLink: joinUrl,
            remindersSent: defaultReminders,
            status: 'confirmed'
          };
        });
    });
  },

  async cancelBooking(slotId: string): Promise<boolean> {
    return simulateDelay(() => {
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const slot = slots.find((s) => s.id === slotId);
      if (slot) {
        const candidateId = slot.bookedCandidateId;
        slot.isBooked = false;
        slot.bookedCandidateId = undefined;
        slot.bookedCandidateName = undefined;
        savePersistentState(SLOTS_KEY, slots);

        if (candidateId) {
          const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
          const cIndex = candidates.findIndex((c) => c.id === candidateId);
          if (cIndex !== -1) {
            candidates[cIndex] = {
              ...candidates[cIndex],
              status: 'Ceipal_Submitted',
              bookedSlotId: undefined
            };
            savePersistentState(CANDIDATES_KEY, candidates);
          }
        }
        return true;
      }
      return false;
    });
  }
};


