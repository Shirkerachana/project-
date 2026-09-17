import { AIInterviewReport, Round1Setup, GeneratedQuestion } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_ROUND1_SETUPS, INITIAL_AI_REPORTS } from './mockData';

const ROUND1_SETUP_KEY = 'round1_setup_map';
const ROUND1_REPORTS_KEY = 'round1_reports_map';

export const round1Service = {
  async getSetup(candidateId: string): Promise<Round1Setup> {
    return simulateDelay(() => {
      const setups = getPersistentState<Record<string, Round1Setup>>(ROUND1_SETUP_KEY, {
        'cand-001': INITIAL_ROUND1_SETUPS[0]
      });
      return setups[candidateId] || { ...INITIAL_ROUND1_SETUPS[0], candidateId };
    });
  },

  async createOrUpdateSetup(
    candidateId: string,
    payload: Partial<Round1Setup>
  ): Promise<Round1Setup> {
    return simulateDelay(() => {
      const setups = getPersistentState<Record<string, Round1Setup>>(ROUND1_SETUP_KEY, {
        'cand-001': INITIAL_ROUND1_SETUPS[0]
      });
      const existing = setups[candidateId] || { ...INITIAL_ROUND1_SETUPS[0], candidateId };
      const updated: Round1Setup = {
        ...existing,
        ...payload,
        candidateId
      };
      setups[candidateId] = updated;
      savePersistentState(ROUND1_SETUP_KEY, setups);
      return updated;
    });
  },

  async getReport(candidateId: string): Promise<AIInterviewReport> {
    return simulateDelay(() => {
      const reports = getPersistentState<Record<string, AIInterviewReport>>(ROUND1_REPORTS_KEY, {
        'cand-001': INITIAL_AI_REPORTS[0],
        'cand-007': {
          ...INITIAL_AI_REPORTS[0],
          id: 'report-007',
          candidateId: 'cand-007',
          candidateName: 'Priya Patel',
          requirementTitle: 'Lead Cloud Architect',
          overallScore: 92,
          recommendation: 'Strong Hire'
        }
      });
      return reports[candidateId] || { ...INITIAL_AI_REPORTS[0], candidateId };
    });
  },

  async getReportByCandidateId(candidateId: string): Promise<AIInterviewReport> {
    return this.getReport(candidateId);
  },

  async generateReport(candidateId: string, metadata?: any): Promise<AIInterviewReport> {
    return this.getReport(candidateId);
  },

  async dispatchInterview(
    candidateId: string
  ): Promise<{ joinToken: string; joinUrl: string }> {
    return simulateDelay(() => {
      const token = `tok-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      return {
        joinToken: token,
        joinUrl: `/interviews/round1/${candidateId}/live`
      };
    });
  }
};

