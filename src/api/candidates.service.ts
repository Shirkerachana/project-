import { Candidate, CandidateWorkflowStage } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_CANDIDATES } from './mockData';

const CANDIDATES_KEY = 'candidates_list';

function normalizeCandidate(c: Candidate): Candidate {
  return {
    ...c,
    skills: Array.isArray(c.skills) ? c.skills : [],
    aiExtractedFields: Array.isArray(c.aiExtractedFields) ? c.aiExtractedFields : []
  };
}

export interface ParsedResumeResult {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  currentCompany: string;
  yearsOfExperience: number;
  expectedSalary: string;
  noticePeriod: string;
  skills: string[];
  summary: string;
  aiExtractedFields: string[];
}

export const candidateService = {
  /**
   * CONTRACT:
   * GET /api/candidates
   * Query params: ?phase=number&status=string&requirementId=string&search=string
   * Response: Candidate[]
   * Auth Required: true
   */
  async getCandidates(filters?: {
    phase?: number;
    status?: string;
    requirementId?: string;
    search?: string;
  }): Promise<Candidate[]> {
    return simulateDelay(() => {
      let items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES).map(normalizeCandidate);

      if (filters?.phase) {
        items = items.filter((c) => c.phase === filters.phase);
      }

      if (filters?.status && filters.status !== 'all') {
        items = items.filter((c) => c.status === filters.status);
      }

      if (filters?.requirementId && filters.requirementId !== 'all') {
        items = items.filter((c) => c.requirementId === filters.requirementId);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        items = items.filter(
          (c) =>
            (c.fullName || '').toLowerCase().includes(query) ||
            (c.email || '').toLowerCase().includes(query) ||
            (c.currentRole || '').toLowerCase().includes(query) ||
            (c.skills || []).some((s) => s.toLowerCase().includes(query))
        );
      }

      return items;
    });
  },

  /**
   * CONTRACT:
   * GET /api/candidates/:id
   * Response: Candidate
   * Auth Required: true
   */
  async getCandidateById(id: string): Promise<Candidate | null> {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES).map(normalizeCandidate);
      const found = items.find((c) => c.id === id);
      return found ? normalizeCandidate(found) : null;
    });
  },

  /**
   * CONTRACT:
   * POST /api/candidates/ai-parse-resume
   * Request: FormData with resume file
   * Response: ParsedResumeResult
   * Auth Required: true
   */
  async parseResumeWithAI(file: File): Promise<ParsedResumeResult> {
    return simulateDelay(() => {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const sampleNames = ['Jordan Matthews', 'Cassidy Reed', 'Nathaniel Drake', 'Taylor Chen'];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const inferredName = fileName.includes('_') ? fileName.split('_').slice(0, 2).join(' ') : randomName;

      return {
        fullName: inferredName,
        email: `${inferredName.toLowerCase().replace(/\s+/g, '.')}@cloudtech.dev`,
        phone: '+1 (415) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
        location: 'San Francisco, CA (Hybrid)',
        currentRole: 'Senior Distributed Systems Engineer',
        currentCompany: 'Apex Networks',
        yearsOfExperience: 7,
        expectedSalary: '$220,000 / yr',
        noticePeriod: '2 weeks',
        skills: ['Go', 'Distributed Systems', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Docker'],
        summary: 'Experienced distributed systems builder focused on high-throughput event buses and low-latency storage primitives.',
        aiExtractedFields: [
          'fullName',
          'email',
          'phone',
          'location',
          'currentRole',
          'currentCompany',
          'yearsOfExperience',
          'skills'
        ]
      };
    }, 600, 1100);
  },

  /**
   * CONTRACT:
   * POST /api/candidates
   * Body: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
   * Response: Candidate
   * Auth Required: true
   */
  async createCandidate(
    payload: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Candidate> {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const newCand: Candidate = {
        ...payload,
        id: `cand-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [newCand, ...items];
      savePersistentState(CANDIDATES_KEY, updated);
      return newCand;
    });
  },

  /**
   * CONTRACT:
   * PATCH /api/candidates/:id
   * Body: Partial<Candidate>
   * Response: Candidate
   * Auth Required: true
   */
  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = items.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Candidate not found');

      const updated = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      items[index] = updated;
      savePersistentState(CANDIDATES_KEY, items);
      return updated;
    });
  },

  /**
   * CONTRACT:
   * POST /api/candidates/batch-schedule-screening
   * Body: { candidateIds: string[], scheduledAt: string }
   * Response: { scheduledCount: number, callIds: string[] }
   * Auth Required: true
   */
  async batchScheduleScreening(
    candidateIds: string[],
    scheduledAt: string
  ): Promise<{ scheduledCount: number; callIds: string[] }> {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const callIds: string[] = [];

      candidateIds.forEach((id) => {
        const index = items.findIndex((c) => c.id === id);
        if (index !== -1) {
          const callId = `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          callIds.push(callId);
          items[index] = {
            ...items[index],
            phase: 2,
            status: 'Screening_Scheduled',
            screeningCallId: callId,
            updatedAt: new Date().toISOString()
          };
        }
      });

      savePersistentState(CANDIDATES_KEY, items);
      return { scheduledCount: callIds.length, callIds };
    });
  },

  async updateStatus(id: string, status: any) {
    return this.updateCandidate(id, { status });
  },

  getAll(filters?: any) {
    return this.getCandidates(filters);
  },

  getById(id: string) {
    return this.getCandidateById(id);
  },

  create(payload: any) {
    return this.createCandidate(payload);
  },

  update(id: string, updates: any) {
    return this.updateCandidate(id, updates);
  },

  async parseResume(file: File | string) {
    if (typeof file === 'string') {
      return this.parseResumeWithAI(new File(['mock content'], file, { type: 'application/pdf' }));
    }
    return this.parseResumeWithAI(file);
  },

  async recordManagerApproval(candidateId: string, approved: boolean, comments: string, decidedBy: string) {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = items.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updated: Candidate = {
        ...items[index],
        managerApproval: {
          approved,
          decidedBy,
          decidedAt: new Date().toISOString(),
          comments
        },
        status: approved ? 'Profile_Approved' : 'Profile_Rejected',
        phase: approved ? 2 : items[index].phase,
        updatedAt: new Date().toISOString()
      };
      items[index] = updated;
      savePersistentState(CANDIDATES_KEY, items);
      return updated;
    });
  },

  async markCeipalSubmitted(candidateId: string, referenceCode: string, submittedBy: string = 'Team Manager') {
    return simulateDelay(() => {
      const items = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const index = items.findIndex((c) => c.id === candidateId);
      if (index === -1) throw new Error('Candidate not found');

      const updated: Candidate = {
        ...items[index],
        ceipalSubmitted: {
          submitted: true,
          submittedBy,
          submittedAt: new Date().toISOString(),
          referenceCode
        },
        status: 'Ceipal_Submitted',
        phase: 3,
        updatedAt: new Date().toISOString()
      };
      items[index] = updated;
      savePersistentState(CANDIDATES_KEY, items);
      return updated;
    });
  }
};

export const candidatesService = candidateService;

