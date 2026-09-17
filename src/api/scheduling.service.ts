import { AvailabilityCall, EvaluatorSlot, Candidate } from '../types';
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
  async triggerAvailabilityCall(candidateId: string): Promise<AvailabilityCall> {
    return simulateDelay(() => {
      const calls = getPersistentState<AvailabilityCall[]>(AVAIL_CALLS_KEY, INITIAL_AVAILABILITY_CALLS);
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const candidate = candidates.find((c) => c.id === candidateId);

      const availableSlot = slots.find((s) => !s.isBooked) || slots[0];

      // Mark slot booked
      if (availableSlot) {
        availableSlot.isBooked = true;
        availableSlot.bookedCandidateId = candidateId;
        availableSlot.bookedCandidateName = candidate?.fullName;
        savePersistentState(SLOTS_KEY, slots);
      }

      const sessionToken = `session-${candidateId}-${Date.now()}`;
      const newCall: AvailabilityCall = {
        id: `avail-${Date.now()}`,
        candidateId,
        candidateName: candidate ? candidate.fullName : 'Candidate',
        phone: candidate?.phone || '+1 (415) 555-0199',
        status: 'slot_selected',
        triggeredAt: new Date().toISOString(),
        candidateResponseAudioTranscript: `“Yes, the proposed slot on ${new Date(availableSlot?.startTime || Date.now()).toLocaleDateString()} works well for me. I can make that time.”`,
        detectedSlotId: availableSlot?.id,
        detectedSlotTime: new Date(availableSlot?.startTime || Date.now()).toLocaleString(),
        confidenceScore: 0.96,
        reminders: [
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
            scheduledTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
            joinUrl: `/interview/${sessionToken}`
          },
          {
            id: `rem-4hr-${Date.now()}`,
            type: '4_hours_before',
            scheduledTime: new Date(Date.now() + 14400000).toISOString(),
            status: 'pending',
            joinUrl: `/interview/${sessionToken}`
          }
        ]
      };

      const filteredCalls = calls.filter((c) => c.candidateId !== candidateId);
      const updatedCalls = [newCall, ...filteredCalls];
      savePersistentState(AVAIL_CALLS_KEY, updatedCalls);

      // Update candidate status
      const cIndex = candidates.findIndex((c) => c.id === candidateId);
      if (cIndex !== -1) {
        candidates[cIndex] = {
          ...candidates[cIndex],
          phase: 4,
          status: 'Round1_Setup_Pending',
          availabilityCallId: newCall.id,
          bookedSlotId: availableSlot?.id,
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
      return calls.map((c) => ({
        ...c,
        chosenSlot: c.chosenSlot || c.detectedSlotId || 'slot-1',
        chosenTime: c.chosenTime || c.detectedSlotTime || 'Mon, 14:00 - 15:00 UTC',
        scheduledDate: c.scheduledDate || '2026-09-20',
        callDurationSeconds: c.callDurationSeconds || 94,
        callRecordingUrl: c.callRecordingUrl || 'https://audio.mockrecruitment.internal/calls/avail-01.mp3'
      }));
    });
  },

  async getBookedInterviews(): Promise<any[]> {
    return simulateDelay(() => {
      const slots = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      return slots
        .filter((s) => s.isBooked)
        .map((s) => ({
          id: `book-${s.id}`,
          candidateId: s.bookedCandidateId || 'cand-001',
          candidateName: s.bookedCandidateName || 'Candidate',
          requirementTitle: 'Engineering Role',
          evaluatorName: s.evaluatorName,
          scheduledTime: new Date(s.startTime).toLocaleString(),
          joinUrl: `/interviews/round1/${s.bookedCandidateId || 'cand-001'}/live`,
          status: 'confirmed'
        }));
    });
  }
};

