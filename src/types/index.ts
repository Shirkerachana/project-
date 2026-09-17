export type UserRole = 'Admin' | 'CRM' | 'TeamManager' | 'Recruiter' | 'Evaluator' | 'HR' | 'Candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title: string;
  department: string;
}

export type RequirementStatus = 'received' | 'circulated' | 'assigned' | 'sourcing' | 'filled';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Requirement {
  id: string;
  code: string;
  title: string;
  clientName: string;
  department: string;
  location: string;
  budget: string;
  positions: number;
  openPositions: number;
  experienceYears: number;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  status: RequirementStatus;
  priority: PriorityLevel;
  assignedRecruiterIds: string[];
  assignedRecruiterNames: string[];
  assignedRecruiters?: string[];
  assignedTeamManager?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type CandidateWorkflowStage = 
  | 'Sourced'
  | 'Screening_Scheduled'
  | 'Screening_Completed'
  | 'RTR_Pending'
  | 'RTR_Acknowledged'
  | 'Profile_Pending_Approval'
  | 'Profile_Approved'
  | 'Profile_Rejected'
  | 'Ceipal_Submitted'
  | 'Availability_Calling'
  | 'Slot_Booked'
  | 'Round1_Setup_Pending'
  | 'Round1_Scheduled'
  | 'Round1_Completed'
  | 'Round2_Pending_Decision'
  | 'Round2_Scheduled'
  | 'Round2_Completed'
  | 'Final_Decision_Pending'
  | 'Offer_Extended'
  | 'Rejected';

export interface CandidateResumeData {
  summary: string;
  education: string;
  recentExperience: string;
  detectedSkills: string[];
  rawTextPreview: string;
}

export interface Candidate {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementTitle: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  currentCompany: string;
  yearsOfExperience: number;
  experienceYears?: number;
  recruiterName?: string;
  screeningScore?: number;
  round1Score?: number;
  round2Score?: number;
  expectedSalary: string;
  noticePeriod: string;
  skills: string[];
  resumeUrl?: string;
  resumeParsedData?: CandidateResumeData;
  aiExtractedFields: string[]; // List of fields filled via AI parsing
  phase: 1 | 2 | 3 | 4 | 5;
  status: CandidateWorkflowStage;
  // Phase 2 gates
  screeningCallId?: string;
  rtrAcknowledged: boolean;
  rtrAcknowledgedAt?: string;
  rtrEmailId?: string;
  managerApproval?: {
    approved: boolean;
    decidedBy: string;
    decidedAt: string;
    comments?: string;
  };
  ceipalSubmitted?: {
    submitted: boolean;
    submittedBy?: string;
    submittedAt?: string;
    referenceCode?: string;
  };
  // Phase 3 & 4
  availabilityCallId?: string;
  bookedSlotId?: string;
  interviewSessionToken?: string;
  round1SetupId?: string;
  round1ReportId?: string;
  // Phase 5 human control points
  round2Decision?: {
    proceed: boolean;
    decidedBy: string;
    decidedAt: string;
    reason?: string;
    panelInterviewers?: string[];
    scheduledDate?: string;
    meetingLink?: string;
    rejectionEmailSent?: boolean;
  };
  round2AssessmentId?: string;
  finalDecision?: {
    status: 'hire' | 'no_hire' | 'hold';
    decidedBy: string;
    deciderRole: 'HR' | 'Recruiter';
    decidedAt: string;
    notes: string;
    salaryOffered?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'AI' | 'Candidate';
  text: string;
  timestamp: string;
  confidence: number; // 0.0 to 1.0
  hasFlag?: boolean;
  flagNote?: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  category: 'Communication' | 'Technical' | 'Cultural' | 'Domain';
  description: string;
  weight: number; // percentage e.g. 25
  maxScore: number; // usually 5 or 10
}

export interface RubricScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  weight: number;
  comment?: string;
}

export interface ScreeningCall {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  requirementTitle: string;
  scheduledAt: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  durationSeconds: number;
  recordingUrl: string;
  transcript: TranscriptEntry[];
  overallConfidence: 'high' | 'medium' | 'low';
  overallScore?: number;
  transcriptionConfidence?: number;
  confidenceFlagReason?: string;
  scoring?: RubricScore[];
  recruiterNotes?: string;
  scoredBy?: string;
  scoredAt?: string;
}

export interface RTREmail {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  requirementTitle: string;
  clientName: string;
  hourlyRateOrSalary: string;
  location: string;
  subject: string;
  bodyText: string;
  status: 'draft' | 'sent' | 'acknowledged';
  isAiDrafted: boolean;
  sentAt?: string;
  acknowledgedAt?: string;
}

export interface EvaluatorSlot {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedCandidateId?: string;
  bookedCandidateName?: string;
}

export interface ReminderLog {
  id: string;
  type: 'immediate_confirmation' | '1_day_before' | '4_hours_before';
  scheduledTime: string;
  sentAt?: string;
  status: 'delivered' | 'pending' | 'failed';
  joinUrl: string;
}

export interface AvailabilityCall {
  id: string;
  candidateId: string;
  candidateName: string;
  phone: string;
  status: 'idle' | 'calling' | 'analyzing' | 'slot_selected' | 'no_slot' | 'failed' | 'completed';
  triggeredAt?: string;
  calledAt?: string;
  candidateResponseAudioTranscript?: string;
  callNotes?: string;
  detectedSlotId?: string;
  detectedSlotTime?: string;
  chosenSlot?: string;
  chosenTime?: string;
  offeredSlots?: EvaluatorSlot[];
  scheduledDate?: string;
  callDurationSeconds?: number;
  callRecordingUrl?: string;
  confidenceScore: number;
  reminders: ReminderLog[];
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  expectedKeywords: string[];
  targetSkill: string;
  customEdited?: boolean;
}

export interface Round1Setup {
  id: string;
  candidateId: string;
  requirementId: string;
  matchScore: number; // 0-100
  matchAnalysis: {
    skillsMatchPct: number;
    experienceMatchPct: number;
    strengths: string[];
    missingSkills: string[];
  };
  questions: GeneratedQuestion[];
  settings: {
    durationMinutes: number;
    language: string;
    enableCameraProctoring: boolean;
    enableTabTracking: boolean;
    scheduledDateTime: string;
  };
  joinToken: string;
  joinUrl: string;
  status: 'draft' | 'dispatched' | 'in_progress' | 'completed';
}

export interface ProctoringFlag {
  id: string;
  timestamp: string;
  eventType: 'Multiple Faces' | 'Face Away / Looking Down' | 'Tab Switched / Focus Lost' | 'Background Voice Detected';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface QuestionAssessment {
  questionId: string;
  questionText: string;
  candidateAnswerSnippet: string;
  score: number; // 0 to 10
  maxScore: number;
  reasoning: string;
  relevanceScore: number;
}

export interface AIInterviewReport {
  id: string;
  candidateId: string;
  candidateName: string;
  requirementTitle: string;
  overallScore: number; // 0 - 100
  recommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Round 2' | 'Do Not Hire';
  strengths: string[];
  gaps: string[];
  reasoning: string;
  questionAssessments: QuestionAssessment[];
  questionEvaluations?: any[];
  antiCheatingLog?: {
    proctorScore: number;
    tabSwitches: number;
    facesDetected: number;
    audioAnomalies: number;
  };
  proctoringSummary: {
    totalEvents: number;
    flags: ProctoringFlag[];
    overallIntegrity: 'Clean' | 'Minor Flags' | 'Critical Flags';
  };
  generatedAt: string;
}

export interface Round2Assessment {
  id: string;
  candidateId: string;
  evaluatorId: string;
  evaluatorName: string;
  scheduledAt: string;
  completedAt?: string;
  technicalCompetencyScore: number; // 1-5
  systemDesignScore: number; // 1-5
  communicationScore: number; // 1-5
  culturalFitScore: number; // 1-5
  overallRecommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'Strong No Hire';
  detailedFeedback: string;
  status: 'scheduled' | 'completed';
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
}

export interface FinalDecisionRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  requirementTitle: string;
  decision: 'hire' | 'no_hire' | 'hold';
  decidedBy: string;
  deciderRole: 'HR' | 'Recruiter';
  decidedAt: string;
  justification: string;
  offerDetails?: {
    roleTitle: string;
    compensation: string;
    startDate: string;
    workLocation: string;
  };
  auditTrail: AuditEntry[];
}

export interface ScreeningQuestion {
  id: string;
  text: string;
  category: string;
  targetRole: string;
  durationSeconds: number;
  active: boolean;
}

export interface MasterData {
  candidateStatuses: { code: CandidateWorkflowStage; label: string; phase: number; color: string }[];
  requirementStatuses: { code: RequirementStatus; label: string; color: string }[];
  roles: UserRole[];
  departments: string[];
  locations: string[];
  skills: string[];
  clients?: string[];
}

export type Round1InterviewReport = AIInterviewReport;

export interface QuestionBankItem {
  id: string;
  text: string;
  category: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'lead';
  expectedDurationSeconds: number;
  targetRole?: string;
}

export interface Round2DecisionRecord {
  id: string;
  candidateId: string;
  proceed: boolean;
  reason: string;
  decidedBy: string;
  decidedAt: string;
  panelInterviewers?: string[];
  scheduledDate?: string;
  meetingLink?: string;
  rejectionEmailSent?: boolean;
}

export type AvailabilityCallRecord = AvailabilityCall;

export interface BookedInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  requirementTitle: string;
  evaluatorName: string;
  evaluatorRole?: string;
  slotStart: string;
  slotEnd: string;
  scheduledTime: string;
  joinUrl: string;
  joinLink?: string;
  remindersSent: ReminderLog[];
  status: 'confirmed' | 'rescheduled' | 'cancelled';
}

export interface SystemIntegrationStatus {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'error' | 'syncing';
  lastSync: string;
  details?: string;
}

// ==========================================
// FEATURE 1: EMAIL TYPES
// ==========================================
export type EmailFolderType = 'inbox' | 'important' | 'sent' | 'drafts' | 'followups';

export interface EmailAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
}

export interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  folder: EmailFolderType;
  isRead: boolean;
  isImportant: boolean;
  isAiGenerated?: boolean;
  relatedCandidateId?: string;
  relatedCandidateName?: string;
  relatedInterviewId?: string;
  interviewJoinLink?: string;
  attachments?: EmailAttachment[];
  status?: 'draft' | 'sent' | 'failed' | 'delivered';
}

// ==========================================
// FEATURE 2: MEETINGS TYPES
// ==========================================
export type MeetingType = 'round1_ai_interview' | 'round2_evaluator_panel' | 'recruiting_sync' | 'candidate_debrief';

export interface MeetingParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isCandidate?: boolean;
  isAiAgent?: boolean;
  isObserver?: boolean;
  status: 'accepted' | 'tentative' | 'declined' | 'pending';
}

export interface MeetingItem {
  id: string;
  title: string;
  type: MeetingType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  description: string;
  joinLink: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  invitationStatus: 'sent' | 'accepted' | 'declined' | 'pending';
  participants: MeetingParticipant[];
  relatedCandidateId?: string;
  relatedCandidateName?: string;
  relatedRequirementTitle?: string;
  relatedInterviewId?: string;
  recordingUrl?: string;
  notes?: string;
}

// ==========================================
// FEATURE 3: CALENDAR TYPES
// ==========================================
export interface CalendarEventItem {
  id: string;
  title: string;
  startDate: string; // ISO date string or YYYY-MM-DDTHH:mm
  endDate: string;
  allDay?: boolean;
  type: 'ai_interview' | 'round2_interview' | 'meeting' | 'debrief';
  candidateId?: string;
  candidateName?: string;
  roleTitle?: string;
  joinLink?: string;
  meetingId?: string;
  interviewId?: string;
  color?: string;
  description?: string;
  location?: string;
}

// ==========================================
// FEATURE 6: AUDIT LOG TYPES
// ==========================================
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: string;
  entityType: 'Interview' | 'Meeting' | 'Email' | 'Candidate' | 'Decision' | 'Evaluation' | 'System';
  entityId: string;
  entityName?: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'PENDING';
  severity: AuditSeverity;
  details: string;
  relatedInterviewId?: string;
  relatedMeetingId?: string;
  relatedEmailId?: string;
  relatedCandidateId?: string;
  ipAddress?: string;
}

// ==========================================
// FEATURE 7: RECRUITER AI CHAT TYPES
// ==========================================
export interface RecruiterAIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  contextCandidateId?: string;
  contextCandidateName?: string;
  isAiGenerated: boolean;
  suggestedPrompts?: string[];
  actionLinks?: {
    label: string;
    url: string;
  }[];
}


