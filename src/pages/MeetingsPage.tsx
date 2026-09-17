import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Sparkles,
  Radio,
  Eye,
  CheckCircle2,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff
} from 'lucide-react';
import { MeetingItem, MeetingType } from '../types';
import { meetingsService } from '../api/meetings.service';
import { candidatesService } from '../api/candidates.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingState } from '../components/common/LoadingState';

export const MeetingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Live Meeting Room Simulation Modal
  const [liveMeeting, setLiveMeeting] = useState<MeetingItem | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  // Create Meeting Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MeetingType>('round1_ai_interview');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newDesc, setNewDesc] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      const data = await meetingsService.getAll();
      setMeetings(data);
    } catch (e: any) {
      toast.error('Failed to load meetings', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
    candidatesService.getAll().then((data) => setCandidates(data));
  }, []);

  const handleCreateMeeting = async () => {
    if (!newTitle || !newDate) {
      toast.warning('Title and Date are required');
      return;
    }

    const [hours, mins] = newStartTime.split(':').map(Number);
    const endHour = hours + Math.floor((mins + newDuration) / 60);
    const endMin = (mins + newDuration) % 60;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const cand = candidates.find((c) => c.id === selectedCandidateId);

    const participants = [
      {
        id: 'p-cand',
        name: cand?.fullName || 'Candidate',
        email: cand?.email || 'candidate@example.com',
        role: 'Candidate',
        isCandidate: true,
        status: 'accepted' as const
      },
      {
        id: 'p-agent',
        name: newType === 'round1_ai_interview' ? 'Eva (AI Interviewer)' : 'Dr. Aris Thorne (Evaluator)',
        email: 'interviewer@talentpulse.internal',
        role: newType === 'round1_ai_interview' ? 'AI Agent' : 'Principal Evaluator',
        isAiAgent: newType === 'round1_ai_interview',
        status: 'accepted' as const
      },
      {
        id: 'p-rec',
        name: user?.name || 'David Miller',
        email: user?.email || 'recruiter@talentpulse.internal',
        role: 'Recruiter (Observer)',
        isObserver: true,
        status: 'accepted' as const
      }
    ];

    try {
      await meetingsService.createMeeting(
        {
          title: newTitle,
          type: newType,
          date: newDate,
          startTime: newStartTime,
          endTime: endTimeStr,
          durationMinutes: newDuration,
          description: newDesc,
          joinLink: `${window.location.origin}/meetings/meet-room-${Date.now()}`,
          status: 'upcoming',
          invitationStatus: 'sent',
          participants,
          relatedCandidateId: selectedCandidateId,
          relatedCandidateName: cand?.fullName,
          relatedRequirementTitle: cand?.requirementTitle
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );

      toast.success('Meeting Created & Synced', 'Meeting added to Calendar and invitations sent.');
      setCreateModalOpen(false);
      // reset
      setNewTitle('');
      setNewDesc('');
      setSelectedCandidateId('');
      loadMeetings();
    } catch (e: any) {
      toast.error('Error creating meeting', e.message);
    }
  };

  const handleCancelMeeting = async (id: string) => {
    await meetingsService.cancelMeeting(
      id,
      'Cancelled by user',
      user ? { id: user.id, name: user.name, email: user.email, role } : undefined
    );
    toast.warning('Meeting Cancelled', 'Removed from upcoming calendar.');
    loadMeetings();
  };

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'upcoming') {
      return m.status === 'upcoming' || m.status === 'in_progress';
    }
    return m.status === 'completed' || m.status === 'cancelled';
  });

  return (
    <div id="meetings-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Interview Meetings</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              WebRTC & Calendar Integrated
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage live AI Interview sessions, Round 2 human evaluator panels, and candidate debriefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setNewDate(tomorrow.toISOString().split('T')[0]);
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-950 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Upcoming Meetings ({meetings.filter((m) => m.status === 'upcoming').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Past & Cancelled ({meetings.filter((m) => m.status !== 'upcoming').length})
        </button>
      </div>

      {/* Meeting Cards Grid */}
      {isLoading ? (
        <LoadingState message="Loading meetings..." />
      ) : filteredMeetings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Video className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No {activeTab} meetings found.</p>
          <p className="text-slate-500 text-xs mt-1">
            Schedule a new interview or check the other tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => {
            const isRound1 = meeting.type === 'round1_ai_interview';
            const isRound2 = meeting.type === 'round2_evaluator_panel';

            return (
              <div
                key={meeting.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isRound1
                          ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/40'
                          : isRound2
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isRound1 && <Bot className="w-3.5 h-3.5" />}
                      {isRound2 && <Users className="w-3.5 h-3.5" />}
                      <span>
                        {isRound1
                          ? 'AI Technical Round 1'
                          : isRound2
                          ? 'Human Evaluator Panel'
                          : 'Team Sync'}
                      </span>
                    </span>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        meeting.status === 'upcoming'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : meeting.status === 'cancelled'
                          ? 'bg-rose-950/60 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{meeting.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {meeting.description}
                  </p>
                </div>

                {/* Date / Time / Participants */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-indigo-400" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>
                        {meeting.startTime} - {meeting.endTime} ({meeting.durationMinutes}m)
                      </span>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 mr-1">Participants:</span>
                    {meeting.participants.map((p) => (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                          p.isCandidate
                            ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30 font-semibold'
                            : p.isAiAgent
                            ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-semibold'
                            : p.isObserver
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {p.isAiAgent && <Bot className="w-3 h-3" />}
                        {p.isCandidate && <User className="w-3 h-3" />}
                        <span>{p.name}</span>
                        {p.isObserver && <span className="text-[9px] text-slate-500">(Observer)</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  {meeting.status === 'upcoming' ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setLiveMeeting(meeting)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Meeting Room</span>
                      </button>

                      {isRound1 && (
                        <a
                          href={meeting.joinLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                          title="Open Candidate View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Candidate View</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCancelMeeting(meeting.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Cancel Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">Meeting concluded.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive WebRTC Video Room Modal */}
      {liveMeeting && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
          {/* Room Top Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <div>
                <span className="font-bold text-white text-xs">{liveMeeting.title}</span>
                <span className="text-[10px] text-slate-400 block">
                  WebRTC Live Room &bull; Encrypted &bull; 1080p
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] font-mono">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>REC 00:14:32</span>
              </div>

              <button
                type="button"
                onClick={() => setLiveMeeting(null)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Video Grid inside meeting */}
          <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center max-w-5xl mx-auto w-full">
            {/* Primary Participant Box */}
            <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col justify-between p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-xs font-semibold text-white">
                  {liveMeeting.type === 'round1_ai_interview' ? 'Eva (AI Interviewer)' : 'Dr. Aris Thorne'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Connected</span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto">
                <div className="w-24 h-24 rounded-full bg-indigo-950/80 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 text-2xl font-bold shadow-lg shadow-indigo-950">
                  {liveMeeting.type === 'round1_ai_interview' ? <Bot className="w-12 h-12" /> : 'AT'}
                </div>
                <span className="text-xs text-slate-400 mt-2">Speaking...</span>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                "{liveMeeting.relatedRequirementTitle || 'Technical Architecture'} Interview in progress."
              </div>
            </div>

            {/* Candidate Box */}
            <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col justify-between p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-xs font-semibold text-white">
                  {liveMeeting.relatedCandidateName || 'Alex Rivera'} (Candidate)
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Proctored</span>
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white text-2xl font-bold">
                  {liveMeeting.relatedCandidateName?.charAt(0) || 'C'}
                </div>
                <span className="text-xs text-slate-400 mt-2">Candidate Feed Live</span>
              </div>

              <div className="text-[11px] text-emerald-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono">
                Whisper STT: Audio Stream Synced
              </div>
            </div>
          </div>

          {/* Bottom Call Controls */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-4 max-w-md mx-auto w-full">
            <button
              type="button"
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`p-3 rounded-2xl border transition-all ${
                isMicMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoDisabled(!isVideoDisabled)}
              className={`p-3 rounded-2xl border transition-all ${
                isVideoDisabled
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title={isVideoDisabled ? 'Start Video' : 'Stop Video'}
            >
              {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setLiveMeeting(null)}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Schedule Interview Meeting</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Type */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Meeting Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MeetingType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="round1_ai_interview">Round 1: AI Technical Avatar Interview</option>
                  <option value="round2_evaluator_panel">Round 2: Human Technical Evaluator Panel</option>
                  <option value="candidate_debrief">Candidate Debrief & Calibration</option>
                  <option value="recruiting_sync">Recruiting Team Sync</option>
                </select>
              </div>

              {/* Candidate Selection */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Related Candidate</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => {
                    setSelectedCandidateId(e.target.value);
                    const c = candidates.find((cand) => cand.id === e.target.value);
                    if (c && !newTitle) {
                      setNewTitle(
                        `${newType === 'round1_ai_interview' ? 'AI Technical Interview' : 'Round 2 Panel'}: ${c.fullName} (${c.requirementTitle})`
                      );
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} - {c.requirementTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Meeting Title</label>
                <input
                  type="text"
                  placeholder="e.g. AI Technical Assessment: Alex Rivera"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Details regarding the interview focus areas..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateMeeting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
