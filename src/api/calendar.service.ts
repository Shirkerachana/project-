import { CalendarEventItem } from '../types';

const STORAGE_KEY = 'tp_calendar_events';

// Generate dynamic dates around today for rich calendar views
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

const dayAfter = new Date(now);
dayAfter.setDate(dayAfter.getDate() + 2);
const dayAfterStr = dayAfter.toISOString().split('T')[0];

const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const INITIAL_EVENTS: CalendarEventItem[] = [
  {
    id: 'cal-001',
    title: 'AI Interview: Alex Rivera (Lead Cloud Architect)',
    startDate: `${tomorrowStr}T10:00:00`,
    endDate: `${tomorrowStr}T10:45:00`,
    type: 'ai_interview',
    candidateId: 'cand-001',
    candidateName: 'Alex Rivera',
    roleTitle: 'Lead Cloud Architect',
    joinLink: `${window.location.origin}/interview/session-alex-rivera-9821`,
    meetingId: 'meet-001',
    interviewId: 'ai-inv-001',
    color: 'indigo',
    description: 'Round 1 AI Avatar technical interview testing high-concurrency microservices, Kafka, and Kubernetes.'
  },
  {
    id: 'cal-002',
    title: 'Round 2 Human Panel: Jordan Lee (Staff Data Engineer)',
    startDate: `${tomorrowStr}T14:30:00`,
    endDate: `${tomorrowStr}T15:30:00`,
    type: 'round2_interview',
    candidateId: 'cand-002',
    candidateName: 'Jordan Lee',
    roleTitle: 'Staff Data Platform Engineer',
    joinLink: `${window.location.origin}/meetings/meet-002`,
    meetingId: 'meet-002',
    color: 'emerald',
    description: 'Round 2 live system design review with Principal Architect Dr. Aris Thorne.'
  },
  {
    id: 'cal-003',
    title: 'Engineering Hiring Debrief & Pipeline Review',
    startDate: `${dayAfterStr}T11:00:00`,
    endDate: `${dayAfterStr}T12:00:00`,
    type: 'debrief',
    roleTitle: 'Talent Acquisition Team',
    color: 'slate',
    description: 'Weekly sync with Team Managers and Recruiters to review AI scoring thresholds and final offers.'
  },
  {
    id: 'cal-004',
    title: 'AI Interview: Priya Sharma (Principal Frontend Architect)',
    startDate: `${yesterdayStr}T15:00:00`,
    endDate: `${yesterdayStr}T15:45:00`,
    type: 'ai_interview',
    candidateId: 'cand-003',
    candidateName: 'Priya Sharma',
    roleTitle: 'Principal Frontend Architect',
    joinLink: `${window.location.origin}/interviews/round1/cand-003/report`,
    color: 'indigo',
    description: 'Completed AI technical evaluation. Score: 94/100.'
  }
];

class CalendarService {
  private getEvents(): CalendarEventItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EVENTS;
    }
  }

  private saveEvents(events: CalendarEventItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  async getAll(): Promise<CalendarEventItem[]> {
    return this.getEvents();
  }

  async createEvent(event: Omit<CalendarEventItem, 'id'>): Promise<CalendarEventItem> {
    const events = this.getEvents();
    const newEvent: CalendarEventItem = {
      ...event,
      id: `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CalendarEventItem>): Promise<CalendarEventItem | null> {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index >= 0) {
      events[index] = { ...events[index], ...updates };
      this.saveEvents(events);
      return events[index];
    }
    return null;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = this.getEvents().filter((e) => e.id !== id);
    this.saveEvents(events);
  }

  async deleteByMeetingId(meetingId: string): Promise<void> {
    const events = this.getEvents().filter((e) => e.meetingId !== meetingId);
    this.saveEvents(events);
  }
}

export const calendarService = new CalendarService();
