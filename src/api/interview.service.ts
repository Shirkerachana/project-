import { Round1Setup, AIInterviewReport, GeneratedQuestion, Candidate } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_ROUND1_SETUPS, INITIAL_AI_REPORTS, INITIAL_CANDIDATES } from './mockData';

const SETUPS_KEY = 'round1_setups_list';
const REPORTS_KEY = 'ai_reports_list';
const CANDIDATES_KEY = 'candidates_list';

export const interviewService = {
  /**
   * CONTRACT:
   * GET /api/interviews/round1/:candidateId/setup
   * Response: Round1Setup | null
   * Auth Required: true
   */
  async getRound1Setup(candidateId: string): Promise<Round1Setup | null> {
    return simulateDelay(() => {
      const setups = getPersistentState<Round1Setup[]>(SETUPS_KEY, INITIAL_ROUND1_SETUPS);
      const found = setups.find((s) => s.candidateId === candidateId);
      if (found) return found;

      // Create initial setup draft if not found
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cand = candidates.find((c) => c.id === candidateId);
      if (!cand) return null;

      const token = cand.interviewSessionToken || `session-${candidateId}-${Date.now()}`;
      const defaultSetup: Round1Setup = {
        id: `setup-${Date.now()}`,
        candidateId,
        requirementId: cand.requirementId,
        matchScore: 91,
        matchAnalysis: {
          skillsMatchPct: 94,
          experienceMatchPct: 88,
          strengths: [
            'Deep engineering background matching key JD architectural requirements',
            'Strong familiarity with distributed streaming systems and high-throughput databases'
          ],
          missingSkills: ['Secondary cloud orchestration certifications']
        },
        questions: [
          {
            id: 'q-gen-1',
            text: `Based on your experience at ${cand.currentCompany || 'your current company'}, how did you approach decoupling service dependencies in high-traffic APIs?`,
            category: 'System Architecture',
            difficulty: 'Intermediate',
            expectedKeywords: ['async queues', 'circuit breakers', 'idempotency', 'service mesh'],
            targetSkill: 'Architecture'
          },
          {
            id: 'q-gen-2',
            text: `How do you measure and prevent silent data corruption or race conditions in concurrent data structures?`,
            category: 'Concurrency & Correctness',
            difficulty: 'Advanced',
            expectedKeywords: ['mutex', 'atomic primitives', 'optimistic locking', 'invariant checks'],
            targetSkill: 'Concurrency'
          }
        ],
        settings: {
          durationMinutes: 30,
          language: 'English (US)',
          enableCameraProctoring: true,
          enableTabTracking: true,
          scheduledDateTime: new Date(Date.now() + 86400000).toISOString()
        },
        joinToken: token,
        joinUrl: `/interview/${token}`,
        status: 'draft'
      };

      const updatedSetups = [defaultSetup, ...setups];
      savePersistentState(SETUPS_KEY, updatedSetups);
      return defaultSetup;
    });
  },

  /**
   * CONTRACT:
   * POST /api/interviews/round1/:candidateId/generate-questions
   * Body: { candidateId: string, requirementId: string }
   * Response: GeneratedQuestion[]
   * Auth Required: true (Recruiter)
   */
  async generateQuestionsWithAI(
    candidateId: string,
    targetRoleOrSkills?: string
  ): Promise<GeneratedQuestion[]> {
    return simulateDelay(() => {
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cand = candidates.find((c) => c.id === candidateId);
      const skill = cand?.skills[0] || 'Distributed Systems';
      const secondary = cand?.skills[1] || 'Concurrency';

      return [
        {
          id: `q-ai-${Date.now()}-1`,
          text: `Given your work with ${skill}, how would you architect a failover strategy when a primary replica abruptly partitions?`,
          category: 'Resiliency & Failover',
          difficulty: 'Advanced',
          expectedKeywords: ['leader election', 'quorum', 'heartbeats', 'fencing tokens'],
          targetSkill: skill
        },
        {
          id: `q-ai-${Date.now()}-2`,
          text: `Can you walk through a real-world debugging session in ${secondary} where memory allocations caused latency spikes?`,
          category: 'Performance Profiling',
          difficulty: 'Intermediate',
          expectedKeywords: ['profiler', 'heap dump', 'gc pause', 'flamegraph'],
          targetSkill: secondary
        },
        {
          id: `q-ai-${Date.now()}-3`,
          text: `Explain how you design APIs to handle backward and forward schema compatibility across multiple deploying client versions.`,
          category: 'API & Protocol Design',
          difficulty: 'Intermediate',
          expectedKeywords: ['protobuf', 'schema registry', 'additive changes', 'deprecation strategy'],
          targetSkill: 'Protocols'
        }
      ];
    }, 700, 1300);
  },

  /**
   * CONTRACT:
   * POST /api/interviews/round1/:candidateId/dispatch
   * Body: Round1Setup
   * Response: Round1Setup
   * Auth Required: true (Recruiter)
   */
  async dispatchInterview(setup: Round1Setup): Promise<Round1Setup> {
    return simulateDelay(() => {
      const setups = getPersistentState<Round1Setup[]>(SETUPS_KEY, INITIAL_ROUND1_SETUPS);
      const index = setups.findIndex((s) => s.id === setup.id);

      const dispatched: Round1Setup = {
        ...setup,
        status: 'dispatched'
      };

      if (index !== -1) {
        setups[index] = dispatched;
      } else {
        setups.push(dispatched);
      }
      savePersistentState(SETUPS_KEY, setups);

      // Update candidate workflow
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cIndex = candidates.findIndex((c) => c.id === setup.candidateId);
      if (cIndex !== -1) {
        candidates[cIndex] = {
          ...candidates[cIndex],
          status: 'Round1_Scheduled',
          round1SetupId: setup.id,
          interviewSessionToken: setup.joinToken,
          updatedAt: new Date().toISOString()
        };
        savePersistentState(CANDIDATES_KEY, candidates);
      }

      return dispatched;
    });
  },

  /**
   * CONTRACT:
   * GET /api/interviews/session/:sessionToken
   * Response: { setup: Round1Setup, candidate: Candidate }
   * Auth Required: false (Token auth)
   */
  async getCandidateSession(sessionToken: string): Promise<{
    setup: Round1Setup;
    candidate: Candidate;
  } | null> {
    return simulateDelay(() => {
      const setups = getPersistentState<Round1Setup[]>(SETUPS_KEY, INITIAL_ROUND1_SETUPS);
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);

      let setup = setups.find((s) => s.joinToken === sessionToken);
      let candidate = candidates.find((c) => c.interviewSessionToken === sessionToken);

      if (!candidate && setups.length > 0) {
        // Fallback for demo session token
        setup = setups[0];
        candidate = candidates.find((c) => c.id === setup?.candidateId) || candidates[0];
      }

      if (!setup || !candidate) return null;
      return { setup, candidate };
    });
  },

  /**
   * CONTRACT:
   * POST /api/interviews/session/:sessionToken/complete
   * Generates AI Interview Report
   * Response: AIInterviewReport
   * Auth Required: false (Token auth)
   */
  async completeCandidateInterview(
    sessionToken: string,
    proctoringFlags: Array<{ eventType: string; description: string; severity: 'low' | 'medium' | 'high' }>
  ): Promise<AIInterviewReport> {
    return simulateDelay(() => {
      const session = this.getCandidateSessionSync(sessionToken);
      const candidateId = session?.candidate.id || 'cand-001';
      const candidateName = session?.candidate.fullName || 'Candidate';
      const requirementTitle = session?.candidate.requirementTitle || 'Distributed Systems Engineer';

      const reportId = `rep-${Date.now()}`;
      const newReport: AIInterviewReport = {
        id: reportId,
        candidateId,
        candidateName,
        requirementTitle,
        overallScore: 89,
        recommendation: 'Hire',
        strengths: [
          'Articulate, precise explanation of distributed consensus principles',
          'Immediate identification of race condition risks in buffered channels',
          'Demonstrated deep empathy for system observability and runbook clarity'
        ],
        gaps: [
          'Brief hesitation on cold-start latency mitigation for multi-tenant worker pools'
        ],
        reasoning: 'Candidate consistently provided structured, high-signal answers with realistic production heuristics. High confidence score from the AI Avatar evaluator.',
        questionAssessments: [
          {
            questionId: 'q-live-1',
            questionText: 'Architect a partitioned queue with exactly-once semantic processing.',
            candidateAnswerSnippet: 'Candidate detailed idempotency keys, write-ahead deduplication tables, and distributed lock leases.',
            score: 9,
            maxScore: 10,
            reasoning: 'Exemplary real-world clarity, zero buzzwords.',
            relevanceScore: 0.98
          },
          {
            questionId: 'q-live-2',
            questionText: 'Diagnosing goroutine leaks and race conditions in production.',
            candidateAnswerSnippet: 'Highlighted pprof heap profiles, go race detector in CI, and context lifecycle propagation.',
            score: 9,
            maxScore: 10,
            reasoning: 'Covered root cause analysis and remediation strategies cleanly.',
            relevanceScore: 0.95
          }
        ],
        proctoringSummary: {
          totalEvents: proctoringFlags.length,
          flags: proctoringFlags.map((f, i) => ({
            id: `flag-${i}`,
            timestamp: `00:${String(Math.floor(i * 4 + 2)).padStart(2, '0')}:15`,
            eventType: f.eventType as any,
            severity: f.severity,
            description: f.description
          })),
          overallIntegrity: proctoringFlags.length > 2 ? 'Critical Flags' : proctoringFlags.length > 0 ? 'Minor Flags' : 'Clean'
        },
        generatedAt: new Date().toISOString()
      };

      const reports = getPersistentState<AIInterviewReport[]>(REPORTS_KEY, INITIAL_AI_REPORTS);
      savePersistentState(REPORTS_KEY, [newReport, ...reports]);

      // Update candidate workflow
      const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
      const cIndex = candidates.findIndex((c) => c.id === candidateId);
      if (cIndex !== -1) {
        candidates[cIndex] = {
          ...candidates[cIndex],
          phase: 5,
          status: 'Round2_Pending_Decision',
          round1ReportId: reportId,
          updatedAt: new Date().toISOString()
        };
        savePersistentState(CANDIDATES_KEY, candidates);
      }

      return newReport;
    }, 1200, 2000);
  },

  getCandidateSessionSync(sessionToken: string) {
    const setups = getPersistentState<Round1Setup[]>(SETUPS_KEY, INITIAL_ROUND1_SETUPS);
    const candidates = getPersistentState<Candidate[]>(CANDIDATES_KEY, INITIAL_CANDIDATES);
    const setup = setups.find((s) => s.joinToken === sessionToken) || setups[0];
    const candidate = candidates.find((c) => c.interviewSessionToken === sessionToken) || candidates[0];
    return { setup, candidate };
  },

  /**
   * CONTRACT:
   * GET /api/interviews/round1/:candidateId/report
   * Response: AIInterviewReport | null
   * Auth Required: true
   */
  async getAIReport(candidateId: string): Promise<AIInterviewReport | null> {
    return simulateDelay(() => {
      const reports = getPersistentState<AIInterviewReport[]>(REPORTS_KEY, INITIAL_AI_REPORTS);
      return reports.find((r) => r.candidateId === candidateId) || reports[0] || null;
    });
  }
};
