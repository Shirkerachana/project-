import { Round2Assessment, Candidate } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_ROUND2_ASSESSMENTS, INITIAL_CANDIDATES } from './mockData';

const ASSESSMENTS_KEY = 'round2_assessments_list';
const CANDIDATES_KEY = 'candidates_list';

export const round2Service = {
  /**
   * CONTRACT:
   * GET /api/interviews/round2/:candidateId
   * Response: Round2Assessment | null
   * Auth Required: true
   */
  async getAssessment(candidateId: string): Promise<Round2Assessment | null> {
    return simulateDelay(() => {
      const list = getPersistentState<Round2Assessment[]>(ASSESSMENTS_KEY, INITIAL_ROUND2_ASSESSMENTS);
      return list.find((a) => a.candidateId === candidateId) || null;
    });
  },

  /**
   * CONTRACT:
   * POST /api/interviews/round2/:candidateId/decision
   * Recruiter Go/No-Go Decision (HUMAN CONTROL POINT #2)
   * Body: { proceed: boolean, reason: string, decidedBy: string }
   * Response: Candidate
   * Auth Required: true (Recruiter)
   */
  async recordRound2Decision(
    candidateId: string,
    proceed: boolean,
    reason: string,
    decidedBy: string
  ): Promise<Candidate> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updated: Candidate = {
        ...candidates[index],
        round2Decision: {
          proceed,
          decidedBy,
          decidedAt: new Date().toISOString(),
          reason
        },
        status: proceed ? 'Round2_Scheduled' : 'Rejected',
        updatedAt: new Date().toISOString()
      };

      candidates[index] = updated;
      savePersistentState(CANDIDATES_KEY, candidates);
      return updated;
    });
  },

  /**
   * CONTRACT:
   * POST /api/interviews/round2/:candidateId/assessment
   * Evaluator records human interview scoring & feedback
   * Body: Round2Assessment
   * Response: Round2Assessment
   * Auth Required: true (Evaluator)
   */
  async submitAssessment(assessment: Omit<Round2Assessment, 'id'>): Promise<Round2Assessment> {
    return simulateDelay(() => {
      const list = getPersistentState<Round2Assessment[]>(ASSESSMENTS_KEY, INITIAL_ROUND2_ASSESSMENTS);
      const newAssessment: Round2Assessment = {
        ...assessment,
        id: `r2-${Date.now()}`,
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      const filtered = list.filter((a) => a.candidateId !== assessment.candidateId);
      savePersistentState(ASSESSMENTS_KEY, [newAssessment, ...filtered]);

      // Move candidate to Final_Decision_Pending
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === assessment.candidateId);
      if (index !== -1) {
        candidates[index] = {
          ...candidates[index],
          status: 'Final_Decision_Pending',
          round2AssessmentId: newAssessment.id,
          updatedAt: new Date().toISOString()
        };
        savePersistentState(CANDIDATES_KEY, candidates);
      }

      return newAssessment;
    });
  },

  async getDecisionByCandidateId(candidateId: string): Promise<any | null> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const c = candidates.find((cand) => cand.id === candidateId);
      return c?.round2Decision ? { ...c.round2Decision, candidateId, id: `r2dec-${candidateId}` } : null;
    });
  },

  async recordDecision(
    candidateId: string,
    payload: {
      proceed: boolean;
      reason: string;
      decidedBy: string;
      panelInterviewers?: string[];
      scheduledDate?: string;
      meetingLink?: string;
      rejectionEmailSent?: boolean;
    }
  ): Promise<any> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = candidates.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updatedDecision = {
        proceed: payload.proceed,
        reason: payload.reason,
        decidedBy: payload.decidedBy,
        decidedAt: new Date().toISOString(),
        panelInterviewers: payload.panelInterviewers || [],
        scheduledDate: payload.scheduledDate,
        meetingLink: payload.meetingLink,
        rejectionEmailSent: payload.rejectionEmailSent
      };

      candidates[index] = {
        ...candidates[index],
        round2Decision: updatedDecision,
        status: payload.proceed ? 'Round2_Scheduled' : 'Rejected',
        updatedAt: new Date().toISOString()
      };

      savePersistentState(CANDIDATES_KEY, candidates);
      return { id: `r2dec-${candidateId}`, candidateId, ...updatedDecision };
    });
  }
};

