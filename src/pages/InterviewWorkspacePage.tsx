import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Calendar, CheckCircle2, Plus, Send, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { candidatesService } from '../api/candidates.service';
import { meetingsService } from '../api/meetings.service';
import { emailService } from '../api/email.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AIInterviewWorkflowPage } from './AIInterviewWorkflowPage';

type HumanRound = {
  id: string;
  name: string;
  type: string;
  interviewer: string;
  date: string;
  time: string;
  duration: number;
  description: string;
  status: 'Draft' | 'Scheduled';
};
const roundsKey = (candidateId: string) => `interview_rounds_${candidateId}`;

export const InterviewWorkspacePage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [rounds, setRounds] = useState<HumanRound[]>([]);
  const [active, setActive] = useState('ai');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({
    name: '',
    type: 'Human Technical Interview',
    interviewer: '',
    date: '',
    time: '',
    duration: '60',
    description: ''
  });

  useEffect(() => {
    candidatesService
      .getAll()
      .then((items) => {
        setCandidates(items);
        setCandidateId(items[0]?.id || '');
      })
      .catch(() => setError('Unable to load candidates.'));
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    const saved = JSON.parse(localStorage.getItem(roundsKey(candidateId)) || '[]') as HumanRound[];
    setRounds(saved);
    setActive('ai');
  }, [candidateId]);

  const candidate = useMemo(() => candidates.find((item) => item.id === candidateId), [candidates, candidateId]);

  const addRound = async () => {
    if (!candidate || !draft.name || !draft.type || !draft.interviewer || !draft.date || !draft.time || !draft.duration) {
      setError('Round name, type, interviewer, date, time, and duration are required.');
      return;
    }
    setError('');
    try {
      const duration = Number(draft.duration);
      const [hours, minutes] = draft.time.split(':').map(Number);
      const end = new Date(2000, 0, 1, hours, minutes + duration).toTimeString().slice(0, 5);
      const meeting = await meetingsService.createMeeting(
        {
          title: `${draft.name}: ${candidate.fullName}`,
          type: 'round2_evaluator_panel',
          date: draft.date,
          startTime: draft.time,
          endTime: end,
          durationMinutes: duration,
          description: draft.description || `${draft.type} interview`,
          joinLink: `${window.location.origin}/interviews/round2/${candidate.id}`,
          status: 'upcoming',
          invitationStatus: 'pending',
          relatedCandidateId: candidate.id,
          relatedCandidateName: candidate.fullName,
          relatedRequirementTitle: candidate.requirementTitle,
          participants: [
            { id: candidate.id, name: candidate.fullName, email: candidate.email, role: 'Candidate', isCandidate: true, status: 'pending' },
            { id: `interviewer-${Date.now()}`, name: draft.interviewer, email: '', role: 'Interviewer', status: 'accepted' }
          ]
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );
      await emailService.sendEmail(
        {
          recipient: candidate.email,
          subject: `${draft.name}: ${candidate.requirementTitle}`,
          body: `Hello ${candidate.fullName},\n\nYour ${draft.type} is scheduled for ${draft.date} at ${draft.time}.\n\nMeeting link: ${meeting.joinLink}`,
          relatedCandidateId: candidate.id,
          relatedCandidateName: candidate.fullName,
          relatedInterviewId: meeting.id,
          interviewJoinLink: meeting.joinLink
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );
      const added: HumanRound = {
        id: meeting.id,
        name: draft.name,
        type: draft.type,
        interviewer: draft.interviewer,
        date: draft.date,
        time: draft.time,
        duration,
        description: draft.description,
        status: 'Scheduled'
      };
      const updated = [...rounds, added];
      setRounds(updated);
      localStorage.setItem(roundsKey(candidate.id), JSON.stringify(updated));
      setActive(added.id);
      setIsAdding(false);
      setDraft({ name: '', type: 'Human Technical Interview', interviewer: '', date: '', time: '', duration: '60', description: '' });
      toast.success('Interview round added', 'Meeting, calendar event, and invitation were created.');
    } catch (cause: any) {
      setError(cause?.message || 'Unable to create interview round.');
    }
  };

  const activeRound = rounds.find((round) => round.id === active);

  return (
    <div id="interview-workspace-page" className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white grid place-items-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Interview</h1>
            <p className="text-sm text-slate-400">Manage AI and human interview rounds</p>
          </div>
        </div>
      </header>
      {error && <div className="rounded-xl bg-rose-950/30 border border-rose-500/30 p-3 text-xs text-rose-200">{error}</div>}
      <nav className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800 p-2">
        <button onClick={() => setActive('ai')} className={`round-tab ${active === 'ai' ? 'active' : ''}`}>
          <Bot className="w-3.5 h-3.5" />
          AI Interview
        </button>
        {rounds.map((round) => (
          <button key={round.id} onClick={() => setActive(round.id)} className={`round-tab ${active === round.id ? 'active' : ''}`}>
            <span>{round.name}</span>
            <small>{round.status}</small>
          </button>
        ))}
        <button className="round-add" onClick={() => setIsAdding(true)} aria-label="Add interview round">
          <Plus className="w-4 h-4" />
        </button>
      </nav>
      {active === 'ai' ? <AIInterviewWorkflowPage /> : activeRound ? <HumanRound round={activeRound} candidate={candidate} /> : null}
      {isAdding && (
        <div className="tp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-label="Add Interview Round" className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Add Interview Round</h2>
                <p className="text-xs text-slate-400 mt-1">A meeting, calendar event, and candidate invitation will be created.</p>
              </div>
              <button onClick={() => setIsAdding(false)} aria-label="Close">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Round name">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={`Round ${rounds.length + 2}`} />
              </Field>
              <Field label="Round type">
                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  {['AI Interview', 'Human Technical Interview', 'Human Manager Interview', 'Technical Round', 'Behavioral Round', 'Final Interview'].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Interviewer">
                <input value={draft.interviewer} onChange={(e) => setDraft({ ...draft, interviewer: e.target.value })} placeholder="Select or enter interviewer" />
              </Field>
              <Field label="Duration">
                <select value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })}>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
              </Field>
            </div>
            <Field label="Description (optional)">
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} />
            </Field>
            <div className="flex justify-end gap-2">
              <button className="workspace-secondary" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button className="workspace-primary" onClick={addRound}>
                <Plus className="w-4 h-4" />
                Add Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="text-xs text-slate-300 block">
    {label}
    <span className="field-wrap">{children}</span>
  </label>
);

const HumanRound = ({ round, candidate }: { round: HumanRound; candidate: any }) => (
  <section className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-5 sm:p-6 space-y-5">
    <div>
      <h2 className="text-base font-bold text-white">
        {round.name} — {round.type}
      </h2>
      <p className="text-xs text-slate-400 mt-1">Human-led interview. AI-generated information is only background context where authorized.</p>
    </div>
    <div className="grid sm:grid-cols-3 gap-3 text-xs">
      {[['Candidate', candidate?.fullName], ['Interviewer', round.interviewer], ['Schedule', `${round.date} · ${round.time} · ${round.duration} min`]].map(([label, value]) => (
        <div key={label} className="rounded-xl bg-slate-950 border border-slate-800 p-3">
          <small className="text-slate-500">{label}</small>
          <p className="mt-1 font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
    <div className="grid sm:grid-cols-3 gap-3">
      <Link className="round-card" to="/meetings">
        <Video className="w-4 h-4 text-indigo-400" />
        Meeting ready
      </Link>
      <Link className="round-card" to="/calendar">
        <Calendar className="w-4 h-4 text-indigo-400" />
        Calendar created
      </Link>
      <Link className="round-card" to="/email">
        <Send className="w-4 h-4 text-indigo-400" />
        Invitation sent
      </Link>
    </div>
    <Link to={`/decisions/round2/${candidate?.id}`} className="workspace-primary inline-flex">
      <CheckCircle2 className="w-4 h-4" />
      Open human evaluation
    </Link>
  </section>
);
