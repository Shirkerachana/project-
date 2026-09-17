import { MeetingItem, MeetingType, UserRole } from '../types';
import { calendarService } from './calendar.service';
import { auditService } from './audit.service';

const STORAGE_KEY = 'tp_meetings';

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: 'meet-001',
    title: 'AI Technical Interview: Alex Rivera (Lead Cloud Architect)',
    type: 'round1_ai_interview',
    date: tomorrowStr,
    startTime: '10:00',
    endTime: '10:45',
    durationMinutes: 45,
    description: 'Round 1 technical assessment conducted by AI Interviewer (Eva). Testing microservices, Kafka event sourcing, and cloud fault tolerance.',
    joinLink: `${window.location.origin}/interview/session-alex-rivera-9821`,
    status: 'upcoming',
    invitationStatus: 'accepted',
    relatedCandidateId: 'cand-001',
    relatedCandidateName: 'Alex Rivera',
    relatedRequirementTitle: 'Lead Cloud Architect',
    relatedInterviewId: 'ai-inv-001',
    participants: [
      {
        id: 'p-1',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        role: 'Candidate',
        isCandidate: true,
        status: 'accepted'
      },
      {
        id: 'p-2',
        name: 'Eva (AI Interviewer)',
        email: 'ai-eva@talentpulse.internal',
        role: 'AI Agent',
        isAiAgent: true,
        status: 'accepted'
      },
      {
        id: 'p-3',
        name: 'David Miller',
        email: 'david.miller@talentpulse.internal',
        role: 'Recruiter (Observer)',
        isObserver: true,
        status: 'accepted'
      }
    ]
  },
  {
    id: 'meet-002',
    title: 'Round 2 Technical Architecture Panel: Jordan Lee',
    type: 'round2_evaluator_panel',
    date: tomorrowStr,
    startTime: '14:30',
    endTime: '15:30',
    durationMinutes: 60,
    description: 'Round 2 human technical panel deep-dive into distributed stream processing, Spark partition tuning, and Lakehouse architectures.',
    joinLink: `${window.location.origin}/meetings/meet-002`,
    status: 'upcoming',
    invitationStatus: 'accepted',
    relatedCandidateId: 'cand-002',
    relatedCandidateName: 'Jordan Lee',
    relatedRequirementTitle: 'Staff Data Platform Engineer',
    participants: [
      {
        id: 'p-4',
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        role: 'Candidate',
        isCandidate: true,
        status: 'accepted'
      },
      {
        id: 'p-5',
        name: 'Dr. Aris Thorne',
        email: 'aris.thorne@techpartners.internal',
        role: 'Principal Evaluator',
        status: 'accepted'
      },
      {
        id: 'p-6',
        name: 'David Miller',
        email: 'david.miller@talentpulse.internal',
        role: 'Recruiter',
        isObserver: true,
        status: 'accepted'
      }
    ]
  },
  {
    id: 'meet-003',
    title: 'Candidate Debrief & Offer Calibration',
    type: 'candidate_debrief',
    date: todayStr,
    startTime: '16:00',
    endTime: '16:30',
    durationMinutes: 30,
    description: 'Calibrate final offer package and team placement for Priya Sharma based on Round 1 and Round 2 feedback.',
    joinLink: `${window.location.origin}/meetings/meet-003`,
    status: 'completed',
    invitationStatus: 'accepted',
    relatedCandidateId: 'cand-003',
    relatedCandidateName: 'Priya Sharma',
    relatedRequirementTitle: 'Principal Frontend Architect',
    participants: [
      {
        id: 'p-7',
        name: 'David Miller',
        email: 'david.miller@talentpulse.internal',
        role: 'Recruiter',
        status: 'accepted'
      },
      {
        id: 'p-8',
        name: 'Patricia Gomez',
        email: 'patricia.gomez@talentpulse.internal',
        role: 'HR Director',
        status: 'accepted'
      }
    ]
  }
];

class MeetingsService {
  private getMeetings(): MeetingItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MEETINGS;
    }
  }

  private saveMeetings(meetings: MeetingItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  }

  async getAll(): Promise<MeetingItem[]> {
    return this.getMeetings();
  }

  async getById(id: string): Promise<MeetingItem | null> {
    const meetings = this.getMeetings();
    return meetings.find((m) => m.id === id) || null;
  }

  async createMeeting(
    meeting: Omit<MeetingItem, 'id'>,
    creatorUser?: { id: string; name: string; email: string; role: UserRole }
  ): Promise<MeetingItem> {
    const meetings = this.getMeetings();
    const newId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMeeting: MeetingItem = {
      ...meeting,
      id: newId
    };

    meetings.push(newMeeting);
    this.saveMeetings(meetings);

    // Synchronize to Calendar automatically
    const calType =
      newMeeting.type === 'round1_ai_interview'
        ? 'ai_interview'
        : newMeeting.type === 'round2_evaluator_panel'
        ? 'round2_interview'
        : 'meeting';

    await calendarService.createEvent({
      title: newMeeting.title,
      startDate: `${newMeeting.date}T${newMeeting.startTime}:00`,
      endDate: `${newMeeting.date}T${newMeeting.endTime}:00`,
      type: calType,
      candidateId: newMeeting.relatedCandidateId,
      candidateName: newMeeting.relatedCandidateName,
      roleTitle: newMeeting.relatedRequirementTitle,
      joinLink: newMeeting.joinLink,
      meetingId: newMeeting.id,
      interviewId: newMeeting.relatedInterviewId,
      description: newMeeting.description,
      color: calType === 'ai_interview' ? 'indigo' : calType === 'round2_interview' ? 'emerald' : 'slate'
    });

    // Record in Audit Log
    await auditService.log({
      actor: creatorUser || {
        id: 'user-recruiter-1',
        name: 'David Miller',
        email: 'david.miller@talentpulse.internal',
        role: 'Recruiter'
      },
      action: 'Meeting created',
      entityType: 'Meeting',
      entityId: newMeeting.id,
      entityName: newMeeting.title,
      status: 'SUCCESS',
      severity: 'info',
      details: `Scheduled ${newMeeting.durationMinutes}m meeting on ${newMeeting.date} at ${newMeeting.startTime}`,
      relatedMeetingId: newMeeting.id,
      relatedCandidateId: newMeeting.relatedCandidateId,
      relatedInterviewId: newMeeting.relatedInterviewId
    });

    return newMeeting;
  }

  async updateMeeting(
    id: string,
    updates: Partial<MeetingItem>,
    actor?: { id: string; name: string; email: string; role: UserRole }
  ): Promise<MeetingItem | null> {
    const meetings = this.getMeetings();
    const index = meetings.findIndex((m) => m.id === id);
    if (index >= 0) {
      meetings[index] = { ...meetings[index], ...updates };
      this.saveMeetings(meetings);

      if (actor) {
        await auditService.log({
          actor,
          action: 'Meeting updated',
          entityType: 'Meeting',
          entityId: id,
          entityName: meetings[index].title,
          status: 'SUCCESS',
          details: `Updated meeting details for ${meetings[index].title}`
        });
      }
      return meetings[index];
    }
    return null;
  }

  async cancelMeeting(
    id: string,
    reason?: string,
    actor?: { id: string; name: string; email: string; role: UserRole }
  ): Promise<MeetingItem | null> {
    const meetings = this.getMeetings();
    const item = meetings.find((m) => m.id === id);
    if (item) {
      item.status = 'cancelled';
      this.saveMeetings(meetings);

      // Remove from calendar
      await calendarService.deleteByMeetingId(id);

      // Log in audit trail
      await auditService.log({
        actor: actor || {
          id: 'user-recruiter-1',
          name: 'David Miller',
          email: 'david.miller@talentpulse.internal',
          role: 'Recruiter'
        },
        action: 'Meeting cancelled',
        entityType: 'Meeting',
        entityId: id,
        entityName: item.title,
        status: 'WARNING',
        severity: 'warning',
        details: reason ? `Meeting cancelled. Reason: ${reason}` : 'Meeting cancelled by recruiter.'
      });

      return item;
    }
    return null;
  }
}

export const meetingsService = new MeetingsService();
