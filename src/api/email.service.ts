import { EmailFolderType, EmailMessage, UserRole } from '../types';
import { auditService } from './audit.service';

const STORAGE_KEY = 'tp_emails_gmail_v1';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'email-001',
    sender: { name: 'TalentPulse AI Scheduler', email: 'scheduling@talentpulse.internal' },
    recipients: ['alex.rivera@example.com'],
    cc: ['david.miller@talentpulse.internal'],
    subject: 'Official Invitation: AI Technical Interview - Lead Cloud Architect',
    body: `Dear Alex Rivera,\n\nCongratulations on being shortlisted for the Lead Cloud Architect position at TalentPulse Systems.\n\nYour Round 1 Technical Interview has been scheduled with our AI Technical Interviewer (Eva).\n\nInterview Details:\n- Date: Tomorrow\n- Time: 10:00 AM EST\n- Duration: 45 Minutes\n\nSecure Candidate Join Link:\n${typeof window !== 'undefined' ? window.location.origin : ''}/interview/session-alex-rivera-9821\n\nWarm regards,\nTalent Acquisition Team`,
    timestamp: hoursAgo(18),
    folder: 'sent',
    isRead: true,
    isImportant: true,
    isAiGenerated: true,
    relatedCandidateId: 'cand-001',
    relatedCandidateName: 'Alex Rivera',
    relatedInterviewId: 'ai-inv-001',
    interviewJoinLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/interview/session-alex-rivera-9821`,
    status: 'delivered',
    category: 'primary'
  },
  {
    id: 'email-002',
    sender: { name: 'Dr. Aris Thorne', email: 'aris.thorne@techpartners.internal' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'Evaluator Feedback Ready: Round 2 Panel for Alex Rivera',
    body: `Hi David,\n\nI have completed the Round 2 Technical Architecture evaluation for Alex Rivera. Alex demonstrated deep knowledge of distributed transaction boundaries and zero-downtime canary deployments.\n\nI have submitted my official evaluation with a rating of 4.8 / 5.0 (Strong Hire recommendation).\n\nBest,\nDr. Aris Thorne`,
    timestamp: hoursAgo(4),
    folder: 'inbox',
    isRead: false,
    isImportant: true,
    isAiGenerated: false,
    relatedCandidateId: 'cand-001',
    relatedCandidateName: 'Alex Rivera',
    category: 'primary'
  },
  {
    id: 'email-003',
    sender: { name: 'Elena Vance (Admin)', email: 'elena.vance@talentpulse.internal' },
    recipients: ['all-talent-team@talentpulse.internal'],
    subject: 'System Update: WebRTC & AI Avatar Voice Transcription Engine Upgraded',
    body: `Team,\n\nPlease note that the WebRTC streaming media cluster and real-time Whisper transcription pipelines have been updated to v3.4. Video latency is reduced to sub-80ms for candidate avatar interviews.\n\nBest regards,\nElena Vance`,
    timestamp: hoursAgo(36),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    isAiGenerated: false,
    category: 'updates'
  },
  {
    id: 'email-004',
    sender: { name: 'David Miller', email: 'david.miller@talentpulse.internal' },
    recipients: ['jordan.lee@example.com'],
    subject: 'Draft: Preparation Guidelines for Staff Data Engineer AI Interview',
    body: `Hi Jordan,\n\nHere are some helpful pointers before your upcoming technical interview session.`,
    timestamp: hoursAgo(8),
    folder: 'drafts',
    isRead: true,
    isImportant: false,
    isAiGenerated: true,
    status: 'draft',
    relatedCandidateId: 'cand-002',
    relatedCandidateName: 'Jordan Lee',
    category: 'primary'
  },
  {
    id: 'email-005',
    sender: { name: 'Sarah Jenkins (Manager)', email: 'sarah.jenkins@talentpulse.internal' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'Follow-up: Client Review on Senior React Specialist Shortlist',
    body: `David,\n\nClient has reviewed candidate profiles for REQ-2024-003 and is very keen to expedite the AI Interview stage. Please ensure candidates receive their scheduling invitations by end of day today.\n\nThanks,\nSarah`,
    timestamp: hoursAgo(12),
    folder: 'followups',
    isRead: false,
    isImportant: true,
    isAiGenerated: false,
    category: 'primary'
  },
  {
    id: 'email-006',
    sender: { name: 'ChatGPT', email: 'noreply@openai.com' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'Look what you can do now',
    body: 'Fresh ways to create, think out loud, and explore what\'s possible. We\'ve been busy. Here\'s what\'s new.',
    timestamp: daysAgo(1),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    category: 'updates'
  },
  {
    id: 'email-007',
    sender: { name: 'Dribbble', email: 'hello@dribbble.com' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'The real design brief is not on paper',
    body: 'Golf brand case study, rebranding lessons, and enterprise AI UX strategies.',
    timestamp: daysAgo(1),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    category: 'promotions'
  },
  {
    id: 'email-008',
    sender: { name: 'Google', email: 'noreply@google.com' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'You shared some Google Account data with Claude',
    body: 'Keep track of your Google Account data. You\'re receiving this email because you used Sign in with Google.',
    timestamp: daysAgo(2),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    category: 'updates'
  },
  {
    id: 'email-009',
    sender: { name: 'Claude Team', email: 'team@anthropic.com' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'Add credits to start building on the Claude Platform',
    body: 'You\'re just a few steps away from your first integration.',
    timestamp: daysAgo(6),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    category: 'updates'
  },
  {
    id: 'email-010',
    sender: { name: 'The Postman Team', email: 'hello@postman.com' },
    recipients: ['david.miller@talentpulse.internal'],
    subject: 'Your API work can live alongside your code',
    body: 'Branch, commit, and version your collections the same way you handle everything else.',
    timestamp: daysAgo(14),
    folder: 'inbox',
    isRead: true,
    isImportant: false,
    category: 'social'
  }
];

class EmailService {
  private getEmails(): EmailMessage[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMAILS));
      return INITIAL_EMAILS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EMAILS;
    }
  }

  private saveEmails(emails: EmailMessage[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  }

  async getAll(folder?: EmailFolderType): Promise<EmailMessage[]> {
    const emails = this.getEmails();
    if (!folder) return emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return emails
      .filter((e) => e.folder === folder)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getById(id: string): Promise<EmailMessage | null> {
    const emails = this.getEmails();
    return emails.find((e) => e.id === id) || null;
  }

  async sendEmail(
    data: {
      recipient: string;
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      isAiGenerated?: boolean;
      relatedCandidateId?: string;
      relatedCandidateName?: string;
      relatedInterviewId?: string;
      interviewJoinLink?: string;
    },
    senderUser?: { id: string; name: string; email: string; role: UserRole }
  ): Promise<EmailMessage> {
    const emails = this.getEmails();
    const newEmail: EmailMessage = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: {
        name: senderUser?.name || 'Talent Acquisition Team',
        email: senderUser?.email || 'recruiter@talentpulse.internal'
      },
      recipients: [data.recipient],
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body: data.body,
      timestamp: new Date().toISOString(),
      folder: 'sent',
      isRead: true,
      isImportant: false,
      isAiGenerated: data.isAiGenerated ?? false,
      relatedCandidateId: data.relatedCandidateId,
      relatedCandidateName: data.relatedCandidateName,
      relatedInterviewId: data.relatedInterviewId,
      interviewJoinLink: data.interviewJoinLink,
      status: 'delivered'
    };

    emails.unshift(newEmail);
    this.saveEmails(emails);

    // Record in Audit Log
    await auditService.log({
      actor: senderUser || {
        id: 'user-recruiter-1',
        name: 'David Miller',
        email: 'david.miller@talentpulse.internal',
        role: 'Recruiter'
      },
      action: 'Invitation sent',
      entityType: 'Email',
      entityId: newEmail.id,
      entityName: newEmail.subject,
      status: 'SUCCESS',
      severity: 'info',
      details: `Email sent to ${data.recipient}. Subject: "${data.subject}"`,
      relatedEmailId: newEmail.id,
      relatedCandidateId: data.relatedCandidateId,
      relatedInterviewId: data.relatedInterviewId
    });

    return newEmail;
  }

  async saveDraft(data: Partial<EmailMessage>): Promise<EmailMessage> {
    const emails = this.getEmails();
    const existingIndex = emails.findIndex((e) => e.id === data.id);
    if (existingIndex >= 0) {
      emails[existingIndex] = {
        ...emails[existingIndex],
        ...data,
        timestamp: new Date().toISOString()
      };
      this.saveEmails(emails);
      return emails[existingIndex];
    }

    const newDraft: EmailMessage = {
      id: `draft-${Date.now()}`,
      sender: {
        name: 'You',
        email: 'recruiter@talentpulse.internal'
      },
      recipients: data.recipients || [],
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject || '(No Subject)',
      body: data.body || '',
      timestamp: new Date().toISOString(),
      folder: 'drafts',
      isRead: true,
      isImportant: false,
      isAiGenerated: data.isAiGenerated ?? false,
      status: 'draft'
    };

    emails.unshift(newDraft);
    this.saveEmails(emails);
    return newDraft;
  }

  async markAsRead(id: string, isRead: boolean = true): Promise<void> {
    const emails = this.getEmails();
    const item = emails.find((e) => e.id === id);
    if (item) {
      item.isRead = isRead;
      this.saveEmails(emails);
    }
  }

  async toggleImportant(id: string): Promise<boolean> {
    const emails = this.getEmails();
    const item = emails.find((e) => e.id === id);
    if (item) {
      item.isImportant = !item.isImportant;
      if (item.isImportant && item.folder === 'inbox') {
        // Can be viewed in important folder
      }
      this.saveEmails(emails);
      return item.isImportant;
    }
    return false;
  }

  async moveToFolder(id: string, folder: EmailFolderType): Promise<void> {
    const emails = this.getEmails();
    const item = emails.find((e) => e.id === id);
    if (item) {
      item.folder = folder;
      this.saveEmails(emails);
    }
  }

  async deleteEmail(id: string): Promise<void> {
    const emails = this.getEmails().filter((e) => e.id !== id);
    this.saveEmails(emails);
  }

  async sendInterviewInvitation(
    candidate: { id: string; name: string; email: string; roleTitle: string },
    details: { date: string; time: string; duration: number; joinLink: string; round: 1 | 2 },
    senderUser?: { id: string; name: string; email: string; role: UserRole }
  ): Promise<EmailMessage> {
    const roundTitle = details.round === 1 ? 'Round 1: AI Technical Avatar Interview' : 'Round 2: Technical Evaluator Panel';
    const interviewerText = details.round === 1 ? 'our AI Technical Interviewer (Eva)' : 'our Senior Technical Architecture Panel';

    const subject = `Official Invitation: ${roundTitle} - ${candidate.roleTitle}`;
    const body = `Dear ${candidate.name},\n\nYou have been confirmed for ${roundTitle} for the position of ${candidate.roleTitle}.\n\nInterview Schedule:\n- Date: ${details.date}\n- Time: ${details.time}\n- Duration: ${details.duration} Minutes\n- Format: Interactive WebRTC Video Session with ${interviewerText}\n\nSecure Candidate Access Link:\n${details.joinLink}\n\nPlease join the session 5 minutes prior to verify your camera, microphone, and connection settings.\n\nBest regards,\nTalent Acquisition Operations\nTalentPulse Enterprise`;

    return this.sendEmail(
      {
        recipient: candidate.email,
        subject,
        body,
        isAiGenerated: true,
        relatedCandidateId: candidate.id,
        relatedCandidateName: candidate.name,
        interviewJoinLink: details.joinLink
      },
      senderUser
    );
  }
}

export const emailService = new EmailService();
