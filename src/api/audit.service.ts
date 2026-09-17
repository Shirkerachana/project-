import { AuditLogRecord, AuditSeverity, UserRole } from '../types';

const STORAGE_KEY = 'tp_audit_logs';

const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'audit-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    actor: {
      id: 'user-recruiter-1',
      name: 'David Miller',
      email: 'david.miller@talentpulse.internal',
      role: 'Recruiter'
    },
    action: 'Interview created',
    entityType: 'Interview',
    entityId: 'ai-inv-001',
    entityName: 'Alex Rivera - AI Technical Round 1',
    status: 'SUCCESS',
    severity: 'info',
    details: 'AI Interview configuration initialized for Lead Cloud Architect with 4 technical questions.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 5).toISOString(),
    actor: {
      id: 'user-recruiter-1',
      name: 'David Miller',
      email: 'david.miller@talentpulse.internal',
      role: 'Recruiter'
    },
    action: 'Meeting created',
    entityType: 'Meeting',
    entityId: 'meet-001',
    entityName: 'AI Avatar Technical Interview - Alex Rivera',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Scheduled WebRTC video room created with AI Avatar Eva and candidate.',
    relatedMeetingId: 'meet-001',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 8).toISOString(),
    actor: {
      id: 'user-recruiter-1',
      name: 'David Miller',
      email: 'david.miller@talentpulse.internal',
      role: 'Recruiter'
    },
    action: 'Invitation sent',
    entityType: 'Email',
    entityId: 'email-inv-001',
    entityName: 'Interview Invitation to Alex Rivera',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Candidate secure token join link generated and dispatched with recording consent disclaimer.',
    relatedEmailId: 'email-inv-001',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    actor: {
      id: 'candidate-ext',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'Candidate'
    },
    action: 'Candidate joined',
    entityType: 'Interview',
    entityId: 'ai-inv-001',
    entityName: 'Alex Rivera Joined Session',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Candidate completed hardware device check (Mic, Cam, WebRTC 1080p) and provided recording consent.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 2).toISOString(),
    actor: {
      id: 'system-ai',
      name: 'TalentPulse AI Engine',
      email: 'ai-engine@talentpulse.internal',
      role: 'Admin'
    },
    action: 'Recording started',
    entityType: 'Interview',
    entityId: 'ai-inv-001',
    entityName: 'WebRTC Recording Stream Initiated',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Encrypted audio/video capture initialized with real-time Whisper STT transcription and face proctoring.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 35).toISOString(),
    actor: {
      id: 'candidate-ext',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      role: 'Candidate'
    },
    action: 'Interview completed',
    entityType: 'Interview',
    entityId: 'ai-inv-001',
    entityName: 'Alex Rivera Finished All 4 Questions',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Session concluded. Total duration: 32m 45s. Candidate shown completion confirmation.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-007',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 37).toISOString(),
    actor: {
      id: 'system-ai',
      name: 'TalentPulse AI Evaluator',
      email: 'ai-evaluator@talentpulse.internal',
      role: 'Admin'
    },
    action: 'AI evaluation completed',
    entityType: 'Evaluation',
    entityId: 'eval-ai-001',
    entityName: 'Round 1 Automated Multi-Dimensional Assessment',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Technical correctness (92%), relevance (90%), problem solving (88%), and communication evaluated.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-008',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 38).toISOString(),
    actor: {
      id: 'system-ai',
      name: 'TalentPulse AI Evaluator',
      email: 'ai-evaluator@talentpulse.internal',
      role: 'Admin'
    },
    action: 'AI report generated',
    entityType: 'Interview',
    entityId: 'ai-inv-001',
    entityName: 'Round 1 AI Dossier (Score: 89/100)',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Report compiled with verified topics, anti-cheating audit, and decision support disclaimer.',
    relatedInterviewId: 'ai-inv-001',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-009',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    actor: {
      id: 'user-recruiter-1',
      name: 'David Miller',
      email: 'david.miller@talentpulse.internal',
      role: 'Recruiter'
    },
    action: 'Recruiter Round 2 decision',
    entityType: 'Decision',
    entityId: 'r2-dec-001',
    entityName: 'Decision: Proceed to Round 2 Human Panel',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Recruiter reviewed AI Report and explicitly approved advancement to Human Evaluator Panel.',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-010',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    actor: {
      id: 'user-recruiter-1',
      name: 'David Miller',
      email: 'david.miller@talentpulse.internal',
      role: 'Recruiter'
    },
    action: 'Round 2 scheduled',
    entityType: 'Meeting',
    entityId: 'meet-002',
    entityName: 'Round 2 Technical Architecture Panel with Dr. Aris Thorne',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Assigned evaluator Dr. Aris Thorne. Calendar invite & WebRTC meeting link sent to candidate and panel.',
    relatedMeetingId: 'meet-002',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-011',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actor: {
      id: 'user-evaluator-1',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@techpartners.internal',
      role: 'Evaluator'
    },
    action: 'Human evaluation submitted',
    entityType: 'Evaluation',
    entityId: 'eval-human-001',
    entityName: 'Human Round 2 Assessment Completed',
    status: 'SUCCESS',
    severity: 'info',
    details: 'Evaluator submitted independent human rating: 4.8/5. Recommendation: Strong Hire.',
    relatedCandidateId: 'cand-001'
  },
  {
    id: 'audit-012',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor: {
      id: 'user-hr-1',
      name: 'Patricia Gomez',
      email: 'patricia.gomez@talentpulse.internal',
      role: 'HR'
    },
    action: 'Final human decision',
    entityType: 'Decision',
    entityId: 'fin-dec-001',
    entityName: 'Offer Approved & Extended',
    status: 'SUCCESS',
    severity: 'info',
    details: 'HR Director finalized offer compensation ($185,000 base + equity). Human authority enforced.',
    relatedCandidateId: 'cand-001'
  }
];

class AuditService {
  private getLogs(): AuditLogRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  private saveLogs(logs: AuditLogRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  async getAll(): Promise<AuditLogRecord[]> {
    return this.getLogs().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async log(entry: {
    actor: { id: string; name: string; email: string; role: UserRole };
    action: string;
    entityType: 'Interview' | 'Meeting' | 'Email' | 'Candidate' | 'Decision' | 'Evaluation' | 'System';
    entityId: string;
    entityName?: string;
    status?: 'SUCCESS' | 'FAILED' | 'WARNING' | 'PENDING';
    severity?: AuditSeverity;
    details: string;
    relatedInterviewId?: string;
    relatedMeetingId?: string;
    relatedEmailId?: string;
    relatedCandidateId?: string;
  }): Promise<AuditLogRecord> {
    const logs = this.getLogs();
    const newRecord: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: entry.actor,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      entityName: entry.entityName,
      status: entry.status || 'SUCCESS',
      severity: entry.severity || 'info',
      details: entry.details,
      relatedInterviewId: entry.relatedInterviewId,
      relatedMeetingId: entry.relatedMeetingId,
      relatedEmailId: entry.relatedEmailId,
      relatedCandidateId: entry.relatedCandidateId,
      ipAddress: '10.128.0.4'
    };

    logs.unshift(newRecord);
    this.saveLogs(logs);
    return newRecord;
  }
}

export const auditService = new AuditService();
