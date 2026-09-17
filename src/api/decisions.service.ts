import { FinalDecisionRecord, Candidate } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_FINAL_DECISIONS, INITIAL_CANDIDATES } from './mockData';

const DECISIONS_KEY = 'final_decisions_list';
const CANDIDATES_KEY = 'candidates_list';

export const decisionsService = {
  /**
   * CONTRACT:
   * GET /api/decisions/:candidateId
   * Response: FinalDecisionRecord | null
   * Auth Required: true
   */
  async getDecision(candidateId: string): Promise<FinalDecisionRecord | null> {
    return simulateDelay(() => {
      const records = getPersistentState<FinalDecisionRecord[]>(DECISIONS_KEY, INITIAL_FINAL_DECISIONS);
      return records.find((d) => d.candidateId === candidateId) || null;
    });
  },

  /**
   * CONTRACT:
   * POST /api/decisions/:candidateId
   * Final hiring decision (HUMAN CONTROL POINT #3)
   * Body: {
   *   decision: 'hire' | 'no_hire' | 'hold',
   *   justification: string,
   *   decidedBy: string,
   *   deciderRole: 'Recruiter',
   *   offerDetails?: { roleTitle: string, compensation: string, startDate: string, workLocation: string }
   * }
   * Response: FinalDecisionRecord
   * Auth Required: true (Recruiter)
   */
  async submitDecision(
    candidateId: string,
    payload: {
      decision: 'hire' | 'no_hire' | 'hold';
      justification: string;
      decidedBy: string;
      deciderRole: 'Recruiter';
      offerDetails?: {
        roleTitle: string;
        compensation: string;
        startDate: string;
        workLocation: string;
      };
    }
  ): Promise<FinalDecisionRecord> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cIndex = candidates.findIndex((c) => c.id === candidateId);
      if (cIndex === -1) throw new Error('Candidate not found');
      const candidate = candidates[cIndex];

      const recordId = `dec-${Date.now()}`;
      const now = new Date().toISOString();

      const newRecord: FinalDecisionRecord = {
        id: recordId,
        candidateId,
        candidateName: candidate.fullName,
        requirementTitle: candidate.requirementTitle,
        decision: payload.decision,
        decidedBy: payload.decidedBy,
        deciderRole: payload.deciderRole,
        decidedAt: now,
        justification: payload.justification,
        offerDetails: payload.offerDetails,
        auditTrail: [
          {
            id: `audit-1`,
            timestamp: candidate.createdAt,
            actor: 'System / Sourcing',
            role: 'Recruiter',
            action: 'Candidate Sourced',
            details: 'Profile created with AI resume extraction'
          },
          {
            id: `audit-2`,
            timestamp: candidate.rtrAcknowledgedAt || now,
            actor: candidate.fullName,
            role: 'Candidate',
            action: 'RTR Authorization Confirmed',
            details: 'Digital acknowledgement recorded'
          },
          {
            id: `audit-3`,
            timestamp: candidate.managerApproval?.decidedAt || now,
            actor: candidate.managerApproval?.decidedBy || 'Team Manager',
            role: 'TeamManager',
            action: 'Profile Approved',
            details: candidate.managerApproval?.comments || 'Approved for Ceipal client submission'
          },
          {
            id: `audit-4`,
            timestamp: now,
            actor: payload.decidedBy,
            role: payload.deciderRole,
            action: `Final Decision: ${payload.decision.toUpperCase()}`,
            details: payload.justification
          }
        ]
      };

      const records = getPersistentState<FinalDecisionRecord[]>(DECISIONS_KEY, INITIAL_FINAL_DECISIONS);
      const filtered = records.filter((r) => r.candidateId !== candidateId);
      savePersistentState(DECISIONS_KEY, [newRecord, ...filtered]);

      // Update candidate
      candidates[cIndex] = {
        ...candidate,
        status: payload.decision === 'hire' ? 'Offer_Extended' : payload.decision === 'no_hire' ? 'Rejected' : candidate.status,
        finalDecision: {
          status: payload.decision,
          decidedBy: payload.decidedBy,
          deciderRole: payload.deciderRole,
          decidedAt: now,
          notes: payload.justification,
          salaryOffered: payload.offerDetails?.compensation
        },
        updatedAt: now
      };
      savePersistentState(CANDIDATES_KEY, candidates);

      return newRecord;
    });
  },

  async getByCandidateId(candidateId: string): Promise<any | null> {
    const res = await this.getDecision(candidateId);
    if (!res) return null;
    return {
      ...res,
      status: res.decision,
      notes: res.justification,
      offeredCompensation: res.offerDetails?.compensation,
      startDate: res.offerDetails?.startDate
    };
  },

  async recordFinalDecision(
    candidateId: string,
    payload: {
      status: 'hire' | 'reject' | 'hold';
      notes: string;
      decidedBy: string;
      deciderRole: 'Recruiter';
      offeredCompensation?: string;
      startDate?: string;
    }
  ): Promise<any> {
    const decisionMapped = payload.status === 'reject' ? 'no_hire' : payload.status;
    const rec = await this.submitDecision(candidateId, {
      decision: decisionMapped as any,
      justification: payload.notes,
      decidedBy: payload.decidedBy,
      deciderRole: 'Recruiter',
      offerDetails: payload.status === 'hire' ? {
        roleTitle: 'Engineering Position',
        compensation: payload.offeredCompensation || '$175,000 / yr',
        startDate: payload.startDate || '2026-10-15',
        workLocation: 'Hybrid / Remote'
      } : undefined
    });
    return {
      ...rec,
      status: payload.status,
      notes: payload.notes
    };
  }
};

