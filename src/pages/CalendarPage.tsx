import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Users,
  Bot,
  ExternalLink,
  Plus,
  X,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CalendarEventItem } from '../types';
import { calendarService } from '../api/calendar.service';
import { meetingsService } from '../api/meetings.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingState } from '../components/common/LoadingState';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await calendarService.getAll();
      setEvents(data);
    } catch (e: any) {
      toast.error('Failed to load calendar events', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper for Month Grid
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const totalDays = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);

  // Month grid slots
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  const getEventsForDay = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return events.filter((e) => e.startDate.startsWith(dayStr));
  };

  return (
    <div id="calendar-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Interview Calendar</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Live Synced
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Centralized schedule for AI technical interviews, evaluator panels, and hiring debriefs.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Today
          </button>
          <span className="text-sm sm:text-base font-bold text-white ml-2">{monthName}</span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-300">AI Interview</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Round 2 Panel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-300">Sync & Debrief</span>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {isLoading ? (
        <LoadingState message="Loading calendar events..." />
      ) : viewMode === 'month' ? (
        /* Month Grid */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 min-h-[500px]">
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="bg-slate-950/30 p-2 min-h-[100px]" />;
              }

              const isToday =
                dayNum === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              const dayEvents = getEventsForDay(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`p-2 min-h-[100px] transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-indigo-950/20' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`px-2 py-1 rounded text-[11px] truncate cursor-pointer transition-all ${
                          ev.type === 'ai_interview'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900'
                            : ev.type === 'round2_interview'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={ev.title}
                      >
                        <span className="font-semibold">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-500 pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / List View (also fallback for week/day) */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            Schedule Agenda ({events.length} Total Events)
          </div>

          <div className="space-y-3">
            {events.map((ev) => {
              const dateObj = new Date(ev.startDate);
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl border mt-0.5 ${
                        ev.type === 'ai_interview'
                          ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400'
                          : ev.type === 'round2_interview'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {ev.type === 'ai_interview' ? (
                        <Bot className="w-5 h-5" />
                      ) : ev.type === 'round2_interview' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <CalendarIcon className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                            ev.type === 'ai_interview'
                              ? 'bg-indigo-950 text-indigo-400'
                              : ev.type === 'round2_interview'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.description}</p>
                      {ev.candidateName && (
                        <span className="text-[11px] text-slate-300 font-semibold block mt-1">
                          Candidate: {ev.candidateName} {ev.roleTitle && `(${ev.roleTitle})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0 text-xs font-mono text-slate-400">
                    <div>{dateObj.toLocaleDateString()}</div>
                    <div className="text-indigo-400 font-bold">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Details Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Event Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Event Title
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedEvent.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">DATE & TIME</span>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {new Date(selectedEvent.startDate).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">EVENT TYPE</span>
                  <div className="font-bold text-indigo-400 uppercase mt-0.5">
                    {selectedEvent.type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Agenda / Description
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.candidateName && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                    Connected Candidate Profile
                  </span>
                  <div className="text-slate-200 font-semibold mt-0.5">
                    {selectedEvent.candidateName}
                  </div>
                  {selectedEvent.roleTitle && (
                    <div className="text-slate-400 text-[11px]">{selectedEvent.roleTitle}</div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>

              {selectedEvent.joinLink && (
                <a
                  href={selectedEvent.joinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  <span>Open Session Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
