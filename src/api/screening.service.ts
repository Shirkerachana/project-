import { ScreeningCall, RTREmail, RubricScore, Candidate } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_SCREENING_CALLS, INITIAL_RTR_EMAILS, INITIAL_CANDIDATES } from './mockData';

const SCREENING_CALLS_KEY = 'screening_calls_list';
const RTR_EMAILS_KEY = 'rtr_emails_list';
const CANDIDATES_KEY = 'candidates_list';

export const screeningService = {
  /**
   * CONTRACT:
   * GET /api/screening/calls
   * Response: ScreeningCall[]
   * Auth Required: true
   */
  async getScreeningCalls(): Promise<ScreeningCall[]> {
    return simulateDelay(() => {
      return getPersistentState<ScreeningCall[]>(SCREENING_CALLS_KEY, INITIAL_SCREENING_CALLS);
    });
  },

  /**
   * CONTRACT:
   * GET /api/screening/calls/:id
   * Response: ScreeningCall
   * Auth Required: true
   */
  async getScreeningCallById(id: string): Promise<ScreeningCall | null> {
    return simulateDelay(() => {
      const calls = getPersistentState<ScreeningCall[]>(SCREENING_CALLS_KEY, INITIAL_SCREENING_CALLS);
      return calls.find((c) => c.id === id) || null;
    });
  },

  /**
   * CONTRACT:
   * POST /api/screening/calls/:id/scoring
   * Body: { scoring: RubricScore[], recruiterNotes: string, scoredBy: string }
   * Response: ScreeningCall
   * Auth Required: true
   */
  async submitCallScoring(
    callId: string,
    scoring: RubricScore[],
    recruiterNotes: string,
    scoredBy: string
  ): Promise<ScreeningCall> {
    return simulateDelay(() => {
      const calls = getPersistentState<ScreeningCall[]>(SCREENING_CALLS_KEY, INITIAL_SCREENING_CALLS);
      const callIndex = calls.findIndex((c) => c.id === callId);
      if (callIndex === -1) throw new Error('Screening call not found');

      const updatedCall: ScreeningCall = {
        ...calls[callIndex],
        scoring,
        recruiterNotes,
        scoredBy,
        scoredAt: new Date().toISOString()
      };
      calls[callIndex] = updatedCall;
      savePersistentState(SCREENING_CALLS_KEY, calls);

      // Also update candidate workflow status to RTR_Pending if not already
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cIndex = candidates.findIndex((c) => c.id === updatedCall.candidateId);
      if (cIndex !== -1 && candidates[cIndex].status === 'Screening_Completed') {
        candidates[cIndex] = {
          ...candidates[cIndex],
          status: 'RTR_Pending',
          updatedAt: new Date().toISOString()
        };
        savePersistentState(CANDIDATES_KEY, candidates);
      }

      return updatedCall;
    });
  },

  /**
   * CONTRACT:
   * GET /api/rtr-emails/:candidateId
   * Response: RTREmail | null
   * Auth Required: true
   */
  async getRTREmailByCandidateId(identifier: string): Promise<RTREmail | null> {
    return simulateDelay(() => {
      const emails = getPersistentState<RTREmail[]>(RTR_EMAILS_KEY, INITIAL_RTR_EMAILS);
      const found = emails.find((e) => e.candidateId === identifier || e.id === identifier);
      if (found) return found;

      // Check if identifier is a screening call ID
      const calls = getPersistentState<ScreeningCall[]>(SCREENING_CALLS_KEY, INITIAL_SCREENING_CALLS);
      const relatedCall = calls.find((c) => c.id === identifier || c.candidateId === identifier);
      if (relatedCall) {
        const foundByCall = emails.find((e) => e.candidateId === relatedCall.candidateId);
        if (foundByCall) return foundByCall;
      }

      // Auto-generate AI draft if none exists yet
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const candidate =
        candidates.find((c) => c.id === identifier || (relatedCall && c.id === relatedCall.candidateId)) ||
        candidates[0];
      if (!candidate) return null;

      const newDraft: RTREmail = {
        id: `rtr-${Date.now()}`,
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        candidateEmail: candidate.email,
        requirementTitle: candidate.requirementTitle,
        clientName: 'CloudApex Technologies',
        hourlyRateOrSalary: candidate.expectedSalary || '$225,000 / yr',
        location: candidate.location || 'San Francisco, CA',
        subject: `Right to Represent (RTR) Authorization — ${candidate.requirementTitle}`,
        bodyText: `Dear ${candidate.fullName},

Following your screening evaluation, we are eager to present your profile to our client for the ${candidate.requirementTitle} role.

Terms of Representation:
- Position: ${candidate.requirementTitle} (${candidate.requirementCode})
- Targeted Compensation: ${candidate.expectedSalary}
- Location: ${candidate.location}
- Representation: Exclusive Right to Represent via TalentPulse

Please review and confirm your authorization so our Team Manager can complete the profile submission.`,
        status: 'draft',
        isAiDrafted: true
      };

      const updatedList = [newDraft, ...emails];
      savePersistentState(RTR_EMAILS_KEY, updatedList);
      return newDraft;
    });
  },

  /**
   * CONTRACT:
   * POST /api/rtr-emails/:id/send
   * Body: { bodyText: string, subject: string }
   * Response: RTREmail
   * Auth Required: true
   */
  async sendRTREmail(id: string, bodyText: string, subject: string): Promise<RTREmail> {
    return simulateDelay(() => {
      const emails = getPersistentState<RTREmail[]>(RTR_EMAILS_KEY, INITIAL_RTR_EMAILS);
      const index = emails.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('RTR email not found');

      const updated: RTREmail = {
        ...emails[index],
        bodyText,
        subject,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      emails[index] = updated;
      savePersistentState(RTR_EMAILS_KEY, emails);
      return updated;
    });
  },

  /**
   * CONTRACT:
   * POST /api/candidates/:candidateId/rtr-acknowledge
   * Candidate action via email link
   * Response: { success: boolean, candidate: Candidate }
   * Auth Required: false (candidate token simulation)
   */
  async acknowledgeRTR(candidateId: string): Promise<Candidate> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updatedCandidate: Candidate = {
        ...candidates[index],
        rtrAcknowledged: true,
        rtrAcknowledgedAt: new Date().toISOString(),
        status: 'Profile_Pending_Approval',
        updatedAt: new Date().toISOString()
      };
      candidates[index] = updatedCandidate;
      savePersistentState(CANDIDATES_KEY, candidates);

      // Also update RTR email record status
      const emails = getPersistentState<RTREmail[]>(RTR_EMAILS_KEY, INITIAL_RTR_EMAILS);
      const emailIndex = emails.findIndex((e) => e.candidateId === candidateId);
      if (emailIndex !== -1) {
        emails[emailIndex] = {
          ...emails[emailIndex],
          status: 'acknowledged',
          acknowledgedAt: new Date().toISOString()
        };
        savePersistentState(RTR_EMAILS_KEY, emails);
      }

      return updatedCandidate;
    });
  },

  /**
   * CONTRACT:
   * POST /api/approvals/:candidateId
   * Body: { approved: boolean, comments: string, decidedBy: string }
   * Response: Candidate
   * Auth Required: true (Team Manager)
   */
  async managerApproval(
    candidateId: string,
    approved: boolean,
    comments: string,
    decidedBy: string
  ): Promise<Candidate> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updated: Candidate = {
        ...candidates[index],
        managerApproval: {
          approved,
          decidedBy,
          decidedAt: new Date().toISOString(),
          comments
        },
        status: approved ? 'Profile_Approved' : 'Profile_Rejected',
        updatedAt: new Date().toISOString()
      };
      candidates[index] = updated;
      savePersistentState(CANDIDATES_KEY, candidates);
      return updated;
    });
  },

  /**
   * CONTRACT:
   * POST /api/candidates/:candidateId/ceipal-submission
   * Body: { referenceCode: string, submittedBy: string }
   * Response: Candidate
   * Auth Required: true (Recruiter)
   */
  async markCeipalSubmitted(
    candidateId: string,
    referenceCode: string,
    submittedBy: string
  ): Promise<Candidate> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updated: Candidate = {
        ...candidates[index],
        ceipalSubmitted: {
          submitted: true,
          submittedBy,
          submittedAt: new Date().toISOString(),
          referenceCode
        },
        phase: 3,
        status: 'Ceipal_Submitted',
        updatedAt: new Date().toISOString()
      };
      candidates[index] = updated;
      savePersistentState(CANDIDATES_KEY, candidates);
      return updated;
    });
  },

  getCalls() {
    return this.getScreeningCalls();
  },

  getCallById(id: string) {
    return this.getScreeningCallById(id);
  },

  async scoreCall(callId: string, payload: { score: number; notes: string; scoredBy?: string }) {
    return this.submitCallScoring(
      callId,
      [
        { criterionId: 'crit-1', criterionName: 'Technical & Domain Knowledge', score: payload.score, maxScore: 100, weight: 60 },
        { criterionId: 'crit-2', criterionName: 'Communication & Clarity', score: payload.score, maxScore: 100, weight: 40 }
      ],
      payload.notes,
      payload.scoredBy || 'System Evaluator'
    );
  },

  async bookCall(candidateId: string, scheduledAt: string): Promise<ScreeningCall> {
    return simulateDelay(() => {
      const calls = getPersistentState<ScreeningCall[]>(SCREENING_CALLS_KEY, INITIAL_SCREENING_CALLS);
      const newCall: ScreeningCall = {
        id: `call-${Date.now()}`,
        candidateId,
        candidateName: 'Candidate',
        candidateEmail: 'candidate@example.com',
        candidatePhone: '+1 555-0199',
        requirementTitle: 'Engineering Position',
        scheduledAt,
        status: 'scheduled',
        durationSeconds: 0,
        recordingUrl: '',
        transcript: [],
        overallConfidence: 'high'
      };
      const updated = [newCall, ...calls];
      savePersistentState(SCREENING_CALLS_KEY, updated);
      return newCall;
    });
  },

  async getRTRDraft(candidateId: string) {
    return this.getRTREmailByCandidateId(candidateId);
  },

  async sendRTR(id: string, payload: { subject?: string; body?: string; bodyText?: string; [key: string]: any }) {
    return this.sendRTREmail(id, payload.body || payload.bodyText || '', payload.subject || 'Right to Represent Authorization');
  },

  async recordRTRAcknowledgement(candidateId: string, _draftId?: string) {
    return this.acknowledgeRTR(candidateId);
  },

  async bookBatchCalls(candidateIds: string[]) {
    return simulateDelay(() => {
      return candidateIds.map((id) => ({
        id: `call-${id}-${Date.now()}`,
        candidateId: id,
        status: 'scheduled'
      }));
    });
  }
};


