import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CalendarCheck,
  FileText,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Bot,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  UserCheck,
  Clock,
  Play
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { CandidateTimeline } from '../components/common/CandidateTimeline';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { screeningService } from '../api/screening.service';
import { schedulingService } from '../api/scheduling.service';
import { Candidate, AvailabilityCall, EvaluatorSlot } from '../types';

export const CandidateProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [availabilityCall, setAvailabilityCall] = useState<AvailabilityCall | null>(null);
  const [bookedSlot, setBookedSlot] = useState<EvaluatorSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'screening' | 'scheduling' | 'round1' | 'decisions'>('timeline');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const [c, schedData] = await Promise.all([
          candidatesService.getById(id),
          schedulingService.getAvailabilityCall(id)
        ]);
        setCandidate(c || null);
        if (schedData) {
          setAvailabilityCall(schedData.call);
          setBookedSlot(schedData.bookedSlot);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return <LoadingState message="Loading candidate profile..." variant="spinner" />;
  if (!candidate) return <div className="p-8 text-center text-slate-400">Candidate not found.</div>;

  return (
    <div id="candidate-profile-page" className="space-y-6">
      <PageHeader
        title={candidate.fullName}
        description={`Target Role: ${candidate.requirementTitle} • Recruiter: ${candidate.recruiterName}`}
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName }
        ]}
        badge={<StatusBadge status={candidate.status} />}
        actions={
          <div className="flex items-center gap-3">
            {candidate.status === 'Sourced' && (
              <Link
                to="/screening/calls"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Initiate AI Screening</span>
              </Link>
            )}

            {candidate.status === 'RTR_Pending' && (
              <Link
                to={`/screening/calls/${candidate.screeningCallId || 'sc-001'}/rtr`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>Review & Dispatch RTR Draft</span>
              </Link>
            )}

            {candidate.status === 'Profile_Pending_Approval' && (
              <Link
                to="/approvals"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>Manager Approval Queue</span>
              </Link>
            )}

            {candidate.status === 'Ceipal_Submitted' && (
              <Link
                to={`/scheduling?candidateId=${candidate.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>AI Schedule Interview</span>
              </Link>
            )}

            {(candidate.status === 'Slot_Booked' || candidate.status === 'Round1_Setup_Pending') && (
              <div className="flex items-center gap-2">
                <Link
                  to="/scheduling"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>View Booked Slot</span>
                </Link>
                <Link
                  to={`/interviews/round1/${candidate.id}/setup`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Configure Round 1 Setup</span>
                </Link>
              </div>
            )}

            {candidate.round1ReportId && (
              <Link
                to={`/interviews/round1/${candidate.id}/report`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <Bot className="w-4 h-4" />
                <span>View AI Interview Report</span>
              </Link>
            )}
          </div>
        }
      />

      {/* 360° Candidate Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-950 shrink-0">
            {candidate.fullName.charAt(0)}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{candidate.fullName}</h2>
              {(candidate.aiExtractedFields?.length ?? 0) > 0 && <AIBadge label="AI Parsed Profile" />}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{candidate.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span>{candidate.experienceYears} Years Experience</span>
              <span>&bull;</span>
              <span>Employer: {candidate.currentCompany || 'Not specified'}</span>
              <span>&bull;</span>
              <span>Requirement: <strong className="text-indigo-300">{candidate.requirementTitle}</strong></span>
            </div>
          </div>
        </div>

        {/* Dynamic Score Gauges */}
        <div className="flex items-center justify-around lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800">
          <ScoreGauge
            score={candidate.screeningScore || 0}
            maxScore={100}
            label="Screen Score"
            size="sm"
          />
          {candidate.round1Score ? (
            <ScoreGauge
              score={candidate.round1Score}
              maxScore={100}
              label="AI Round 1"
              size="sm"
            />
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs font-mono">
                —
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-1">Round 1</span>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Data-Driven 5-Phase Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>5-Phase Candidate Lifecycle Progress</span>
              <span className="text-xs text-indigo-400 font-mono font-normal">
                Phase {candidate.phase} / 5
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Driven dynamically by candidate state across Sourcing, Screening, Availability, AI Round 1, and Human Gates.
            </p>
          </div>
        </div>

        <CandidateTimeline candidate={candidate} orientation="horizontal" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'timeline', label: 'Detailed Milestones & Audit' },
          { key: 'documents', label: 'Documents & Resume' },
          { key: 'screening', label: 'Phase 2: Screening & RTR' },
          { key: 'scheduling', label: 'Phase 3: AI Availability & Slots' },
          { key: 'round1', label: 'Phase 4: AI Interview Dossier' },
          { key: 'decisions', label: 'Phase 5: Human Decision Gate' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: TIMELINE & AUDIT */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Full Process Milestones</h3>
            <CandidateTimeline candidate={candidate} orientation="vertical" />
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills Profile
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.skills || []).map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ceipal ATS Integration
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Ceipal Status:</span>
                  <span className="font-semibold text-slate-200">
                    {candidate.status === 'Ceipal_Submitted' ? 'Submitted' : 'Pending Profile Approval'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Ceipal Applicant ID:</span>
                  <span className="font-mono text-slate-300">{candidate.ceipalId || 'Auto-generated on approval'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Manager Sign-off:</span>
                  <span className="font-semibold text-slate-200">
                    {candidate.managerApproval?.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Candidate Documents & Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Parsed Resume Document</div>
                  <div className="text-xs text-slate-400">PDF Document &bull; AI Analyzed</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Right-to-Represent (RTR) Document</div>
                  <div className="text-xs text-slate-400">
                    {candidate.rtrAcknowledged ? 'Digitally Authorized' : 'Pending Authorization'}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  candidate.rtrAcknowledged
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {candidate.rtrAcknowledged ? 'Signed' : 'Awaiting'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SCREENING */}
      {activeTab === 'screening' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Phase 2: AI Voice Screening Call & RTR</h3>
            {candidate.screeningCallId && (
              <Link
                to={`/screening/calls/${candidate.screeningCallId}`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Open Screening Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Screening Score</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {candidate.screeningScore ? `${candidate.screeningScore}/100` : 'Pending'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">RTR Status</span>
              <span className="text-sm font-bold text-white">
                {candidate.rtrAcknowledged ? 'Confirmed & Signed' : 'Pending Candidate Gate'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Manager Sign-off</span>
              <span className="text-sm font-bold text-white">
                {candidate.managerApproval?.approved ? 'Approved' : 'Pending Human Gate'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SCHEDULING & AVAILABILITY */}
      {activeTab === 'scheduling' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                <span>Phase 3: AI Availability Telephony & Calendar Reservation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous voice telephony dialer records, candidate consent transcripts, and confirmed evaluator slots.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/scheduling?candidateId=${candidate.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Open AI Dialer Console</span>
              </Link>
            </div>
          </div>

          {bookedSlot || availabilityCall?.status === 'slot_selected' || candidate.status === 'Slot_Booked' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Confirmed Timeslot
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>
                      {bookedSlot
                        ? `${new Date(bookedSlot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(bookedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : availabilityCall?.chosenSlot || 'Thursday 2:00 PM EST'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Assigned Technical Evaluator
                  </span>
                  <div className="text-sm font-bold text-indigo-300">
                    {bookedSlot?.evaluatorName || 'Dr. Aris Thorne'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {bookedSlot?.evaluatorRole || 'Principal Distributed Systems Architect'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Calendar & Reminders
                  </span>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google & Outlook Synced</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automated 24h & 4h alerts scheduled
                  </div>
                </div>
              </div>

              {availabilityCall?.candidateResponseAudioTranscript && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Candidate Telephony Audio Transcript</span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    {availabilityCall.candidateResponseAudioTranscript}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/interviews/round1/${candidate.id}/setup`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to Phase 4: Configure AI Round 1 Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={`/interviews/round1/${candidate.id}/live`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview Candidate Interview Console</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No Interview Slot Confirmed Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Candidate is ready for Phase 3. Use the AI Availability Dialer to call the candidate and negotiate an open evaluator slot.
              </p>
              <Link
                to={`/scheduling?candidateId=${candidate.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch AI Availability Call Now</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ROUND 1 */}
      {activeTab === 'round1' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Phase 4: AI Avatar Technical Interview</h3>
            {candidate.round1ReportId && (
              <Link
                to={`/interviews/round1/${candidate.id}/report`}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Inspect Full Scored Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {candidate.round1Score ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Round 1 Technical Interview Score: {candidate.round1Score}%</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Conducted by AI Avatar with anti-cheating proctoring and comprehensive rubric evaluation.
                </div>
              </div>
              <Link
                to={`/interviews/round1/${candidate.id}/report`}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                View Full Report
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-sm text-slate-400 mb-3">AI Round 1 interview has not been completed yet.</p>
              <Link
                to={`/interviews/round1/${candidate.id}/setup`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                <Bot className="w-4 h-4" />
                <span>Configure & Dispatch AI Round 1 Interview</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Phase 5: Human Decision Governance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                HUMAN CONTROL POINT #2: Round 2 Go/No-Go
              </div>
              <div className="text-sm text-white font-semibold">
                Status:{' '}
                {candidate.round2Decision ? (
                  candidate.round2Decision.proceed ? (
                    <span className="text-emerald-400">Proceed to Round 2</span>
                  ) : (
                    <span className="text-rose-400">Rejected</span>
                  )
                ) : (
                  <span className="text-amber-400">Decision Pending</span>
                )}
              </div>
              {candidate.round2Decision && (
                <div className="text-xs text-slate-400">
                  Decided by {candidate.round2Decision.decidedBy} &bull; Reason: {candidate.round2Decision.reason}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                HUMAN CONTROL POINT #3: Final Hiring Decision
              </div>
              <div className="text-sm text-white font-semibold">
                Status:{' '}
                {candidate.finalDecision ? (
                  <span className="text-emerald-400 uppercase">{candidate.finalDecision.status}</span>
                ) : (
                  <span className="text-amber-400">Awaiting Final Gate</span>
                )}
              </div>
              {candidate.finalDecision && (
                <div className="text-xs text-slate-400">
                  Decided by {candidate.finalDecision.decidedBy} ({candidate.finalDecision.deciderRole}) &bull; Notes: {candidate.finalDecision.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
