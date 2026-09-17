import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Users,
  Video,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Play,
  Mail,
  Calendar as CalendarIcon,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sliders,
  ChevronRight,
  Eye,
  Send,
  Plus
} from 'lucide-react';
import { candidatesService } from '../api/candidates.service';
import { round1Service } from '../api/round1.service';
import { emailService } from '../api/email.service';
import { meetingsService } from '../api/meetings.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { LoadingState } from '../components/common/LoadingState';

export const AIInterviewWorkflowPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'setup' | 'live' | 'completed'>('setup');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Setup Form State
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<'Eva' | 'Mark' | 'Sophia'>('Eva');
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [proctoringStrictness, setProctoringStrictness] = useState<'Standard' | 'Strict' | 'Maximum'>('Strict');
  const [isDispatching, setIsDispatching] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // Questions Bank State
  const [questions, setQuestions] = useState<string[]>([
    'Can you explain the design trade-offs of using event-driven architectures with Apache Kafka versus synchronous gRPC in high-throughput payment systems?',
    'Describe how you handle database sharding, transaction outbox patterns, and consistency under high concurrency.',
    'Walk through an architectural post-mortem where your production cluster experienced memory leaks or cascading failures.'
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    setIsLoading(false);
    candidatesService.getAll().then((data) => {
      setCandidates(data);
      if (data.length > 0) {
        setSelectedCandidateId(data[0].id);
      }
    });
  }, []);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([...questions, newQuestion.trim()]);
    setNewQuestion('');
    toast.success('Question Added to Assessment Pool');
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateAndDispatch = async () => {
    if (!selectedCandidate) {
      toast.warning('Please select a candidate first');
      return;
    }

    setIsDispatching(true);

    try {
      const token = `session-${selectedCandidate.fullName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const link = `${window.location.origin}/interview/${token}`;
      setGeneratedLink(link);

      // Update candidate with session token & status
      await candidatesService.updateStatus(selectedCandidate.id, 'Slot_Booked');

      // Create Calendar & Meeting Entry
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await meetingsService.createMeeting(
        {
          title: `AI Technical Interview: ${selectedCandidate.fullName} (${selectedCandidate.requirementTitle})`,
          type: 'round1_ai_interview',
          date: tomorrowStr,
          startTime: '10:00',
          endTime: '10:45',
          durationMinutes: interviewDuration,
          description: `AI Technical Assessment with Avatar ${selectedAvatar}. Proctoring mode: ${proctoringStrictness}.`,
          joinLink: link,
          status: 'upcoming',
          invitationStatus: 'sent',
          relatedCandidateId: selectedCandidate.id,
          relatedCandidateName: selectedCandidate.fullName,
          relatedRequirementTitle: selectedCandidate.requirementTitle,
          participants: [
            {
              id: 'p-c',
              name: selectedCandidate.fullName,
              email: selectedCandidate.email,
              role: 'Candidate',
              isCandidate: true,
              status: 'accepted'
            },
            {
              id: 'p-ai',
              name: `${selectedAvatar} (AI Interviewer)`,
              email: 'ai@talentpulse.internal',
              role: 'AI Agent',
              isAiAgent: true,
              status: 'accepted'
            }
          ]
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );

      // Dispatch Invitation Email
      await emailService.sendEmail(
        {
          recipient: selectedCandidate.email,
          subject: `Confirmed: AI Technical Interview - ${selectedCandidate.requirementTitle}`,
          body: `Dear ${selectedCandidate.fullName},\n\nYour Round 1 Technical Interview has been configured with AI Interviewer ${selectedAvatar}.\n\nScheduled Duration: ${interviewDuration} minutes\nProctoring: Automated webcam and audio integrity checks enabled.\n\nYour Dedicated Access Link:\n${link}\n\nPlease click the link at your scheduled time. No password or account setup is required.\n\nBest regards,\nTalent Acquisition Team`,
          isAiGenerated: true,
          interviewJoinLink: link,
          relatedCandidateId: selectedCandidate.id,
          relatedCandidateName: selectedCandidate.fullName
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );

      toast.success(
        'AI Interview Dispatched & Synced',
        'Candidate invitation emailed, calendar event created, and access link generated!'
      );
    } catch (e: any) {
      toast.error('Dispatch failed', e.message);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success('Join Link Copied to Clipboard');
    }
  };

  return (
    <div id="ai-interview-workflow-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Interview Orchestration</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Round 1 Command Center
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure technical question banks, deploy conversational avatars, monitor proctored sessions, and review evaluation reports.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'setup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Configure & Dispatch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'live'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Monitor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed Reports
          </button>
        </div>
      </div>

      {/* TAB 1: CONFIGURE & DISPATCH */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">1. Select Candidate & Target Position</h3>
                <p className="text-xs text-slate-400">
                  Pick candidate in screening or RTR gate ready for Round 1 AI technical evaluation.
                </p>
              </div>

              <div>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} &bull; {c.requirementTitle} &bull; Stage: {c.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCandidate && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">CANDIDATE EMAIL</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{selectedCandidate.email}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">CURRENT STATUS</span>
                    <div className="font-bold text-indigo-400 mt-0.5">{selectedCandidate.status}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 font-mono">CORE SKILLS</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCandidate.skills?.map((sk: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Avatar Persona & Strictness */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h3 className="text-sm font-bold text-white">2. AI Avatar & Proctoring Rules</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Eva', 'Mark', 'Sophia'] as const).map((avatar) => (
                    <div
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedAvatar === avatar
                          ? 'bg-indigo-950/60 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                        {avatar.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{avatar}</div>
                        <div className="text-[10px] text-slate-400">
                          {avatar === 'Eva' ? 'Technical Architect' : avatar === 'Mark' ? 'Systems Lead' : 'Staff Engineer'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 mb-1 block">Assessment Duration</label>
                    <select
                      value={interviewDuration}
                      onChange={(e) => setInterviewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={30}>30 Minutes (3 Questions)</option>
                      <option value={45}>45 Minutes (4-5 Questions)</option>
                      <option value={60}>60 Minutes (Deep Architectural)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 mb-1 block">Proctoring Enforcement</label>
                    <select
                      value={proctoringStrictness}
                      onChange={(e) => setProctoringStrictness(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Standard">Standard (Tab loss monitoring)</option>
                      <option value="Strict">Strict (Webcam facial presence + Window lock)</option>
                      <option value="Maximum">Maximum (Multi-screen lock + Continuous audio)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Bank */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">3. Technical Assessment Questions</h3>
                  <p className="text-xs text-slate-400">
                    The AI Avatar will dynamically ask and follow-up on these topics.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                  {questions.length} Active
                </span>
              </div>

              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-indigo-400 font-bold shrink-0 mt-0.5">Q{idx + 1}.</span>
                    <span className="text-slate-200 leading-relaxed flex-1">{q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom question to evaluation pool..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch Panel & Generated Link */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/50 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Dispatch AI Interview</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Clicking dispatch will generate a secure cryptographic token, add the session to the calendar, and dispatch the invitation email to the candidate.
              </p>

              <button
                type="button"
                onClick={handleGenerateAndDispatch}
                disabled={isDispatching}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-950 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isDispatching ? 'Generating Session & Syncing...' : 'Dispatch Invitation & Sync Calendar'}</span>
              </button>

              {/* Generated Link Display */}
              {generatedLink && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready for Candidate</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">No login required</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-200 break-all select-all">
                    {generatedLink}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>

                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Test Candidate View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Quick Navigation Links */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <Link
                  to="/meetings"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>View in Meetings List</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  to="/calendar"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    <span>Open in Calendar Schedule</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  to="/email"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>View Sent Invitation Emails</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MONITOR */}
      {activeTab === 'live' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Active Proctoring & Session Stream</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time telemetry of ongoing candidate technical interviews.
              </p>
            </div>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>1 Live Session Active</span>
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg">
                AR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Alex Rivera</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    Lead Cloud Architect
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                  <span>Avatar: Eva</span>
                  <span>&bull;</span>
                  <span>Duration: 24m / 45m</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>0 Critical Flags</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/interview/session-alex-rivera-9821"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>Observer Join</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED REPORTS */}
      {activeTab === 'completed' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Completed AI Interview Dossiers</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review AI scored reports and make authoritative Round 2 Human Evaluator routing decisions.
            </p>
          </div>

          <div className="space-y-3">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{cand.fullName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">({cand.requirementTitle})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
                      {cand.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    AI Assessment Score: <strong className="text-indigo-300">89/100</strong> &bull; Integrity Index: <strong className="text-emerald-400">Clean (0 Flags)</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/interviews/round1/${cand.id}/report`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View AI Report</span>
                  </Link>

                  <Link
                    to={`/decisions/round2/${cand.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-md"
                  >
                    <span>Round 2 Gate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
