import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  UserCheck,
  PhoneCall,
  CalendarCheck,
  Bot,
  Award,
  ArrowRight,
  Sparkles,
  Sliders,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { requirementsService } from '../api/requirements.service';
import { candidatesService } from '../api/candidates.service';
import { screeningService } from '../api/screening.service';
import { configService } from '../api/config.service';
import { Requirement, Candidate, ScreeningCall, RubricCriterion, ScreeningQuestion, EvaluatorSlot } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [screeningCalls, setScreeningCalls] = useState<ScreeningCall[]>([]);
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [rubrics, setRubrics] = useState<RubricCriterion[]>([]);
  const [slots, setSlots] = useState<EvaluatorSlot[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [reqs, cands, calls, qList, rList, sList] = await Promise.all([
          requirementsService.getAll(),
          candidatesService.getAll(),
          screeningService.getCalls(),
          configService.getQuestions(),
          configService.getRubric(),
          configService.getSlots()
        ]);
        setRequirements(reqs);
        setCandidates(cands);
        setScreeningCalls(calls);
        setQuestions(qList);
        setRubrics(rList);
        setSlots(sList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading role workspace..." variant="spinner" />;
  }

  // Common metrics
  const pendingApprovals = candidates.filter((c) => c.status === 'Profile_Pending_Approval');
  const rtrPending = candidates.filter((c) => c.status === 'RTR_Pending');
  const rtrConfirmed = candidates.filter((c) => c.rtrAcknowledged);
  const screeningCallsCompleted = screeningCalls.filter((c) => c.status === 'completed');
  const round1Completed = candidates.filter((c) => c.status === 'Round1_Completed');
  const round2PendingDecision = candidates.filter((c) => c.status === 'Round2_Pending_Decision');

  return (
    <div id="dashboard-page" className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Recruitment Pro'}`}
        description={`Active as ${role}. Here is your real-time pipeline status and pending action items.`}
        badge={
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {role} View
          </span>
        }
        actions={
          role === 'CRM' ? (
            <Link
              to="/requirements/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Intake New Job Requirement</span>
            </Link>
          ) : role === 'Recruiter' ? (
            <Link
              to="/candidates/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate (AI Resume Parse)</span>
            </Link>
          ) : null
        }
      />

      {/* Human-in-the-Loop Governance Notice */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Human-in-the-Loop AI Architecture Active</span>
              <AIBadge label="Strict Human Gates" />
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              AI handles candidate screening calls, voice transcripts, RTR draft generation, availability booking, and Round 1 avatar interviews.
              <strong className="text-slate-900 dark:text-white font-bold"> Human control points</strong> (Team Manager profile approval, Round 2 Go/No-Go gate, and Final hiring decision) can never be bypassed by AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Governance:</span>
          <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold font-mono">
            3 Human Gates Active
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROLE WIDGET 1: CRM LEAD DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'CRM' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Requirements</div>
              <div className="text-3xl font-black text-white mt-1">{requirements.length}</div>
              <div className="text-xs text-slate-400 mt-1">Direct from client intake</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Circulation</div>
              <div className="text-3xl font-black text-amber-400 mt-1">
                {requirements.filter((r) => r.status === 'received').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Awaiting review & circulation</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Sourcing</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {requirements.filter((r) => r.status === 'sourcing' || r.status === 'assigned').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">With Recruiter teams</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Client Requirements Pipeline</h3>
              <Link to="/requirements" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>View all requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-800/60">
              {requirements.map((req) => (
                <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-white text-sm">{req.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {req.clientName} &bull; {req.location} &bull; {req.openPositions} open position(s) &bull; Budget: {req.budget}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <Link
                      to={`/requirements/${req.id}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE WIDGET 2: TEAM MANAGER DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'TeamManager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                <span>Profiles Awaiting Approval</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-amber-300 mt-1">{pendingApprovals.length}</div>
              <div className="text-xs text-slate-400 mt-1">HUMAN CONTROL POINT #1</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unassigned Requirements</div>
              <div className="text-3xl font-black text-white mt-1">
                {
                  requirements.filter(
                    (r) =>
                      !r.assignedTeamManager ||
                      !r.assignedRecruiters ||
                      r.assignedRecruiters.length === 0
                  ).length
                }
              </div>
              <div className="text-xs text-slate-400 mt-1">Needs recruiter distribution</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pipeline Candidates</div>
              <div className="text-3xl font-black text-indigo-400 mt-1">{candidates.length}</div>
              <div className="text-xs text-slate-400 mt-1">Across all team recruiters</div>
            </div>
          </div>

          {/* Pending Profile Approvals Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Candidate Profile Approval Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {pendingApprovals.length} Pending
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review RTR-authorized candidates and screening reports before Ceipal client submission.
                </p>
              </div>
              <Link to="/approvals" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>Open Approvals Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {pendingApprovals.map((cand) => (
                <div key={cand.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      <span>{cand.fullName}</span>
                      <span className="text-xs font-normal text-slate-400">for {cand.requirementTitle}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Recruiter: {cand.recruiterName} &bull; Screen Score: <strong className="text-emerald-400">{cand.screeningScore}/100</strong> &bull; RTR Confirmed: {cand.rtrAcknowledged ? 'Yes' : 'Pending'}
                    </div>
                  </div>
                  <Link
                    to="/approvals"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    Review Profile & Decision
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE WIDGET 3: RECRUITER DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'Recruiter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Screening Calls Done</div>
              <div className="text-2xl font-black text-white mt-1">{screeningCallsCompleted.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">AI transcripts ready</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RTR Pending Review</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{rtrPending.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">AI drafts generated</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Round 1 AI Reports</div>
              <div className="text-2xl font-black text-indigo-400 mt-1">{round1Completed.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scored & proctored</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Round 2 Go/No-Go Gate</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{round2PendingDecision.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">HUMAN CONTROL POINT #2</div>
            </div>
          </div>

          {/* Action Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick RTR Email Draft Review */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>AI RTR Drafts Pending Review</span>
                    <AIBadge label="AI Draft" />
                  </h3>
                  <Link to="/screening/calls" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                    All Calls
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Screening was completed. AI pre-drafted the Right-to-Represent (RTR) email with parsed compensation and position details. Review and dispatch.
                </p>

                <div className="space-y-3">
                  {candidates
                    .filter((c) => c.status === 'RTR_Pending' || c.status === 'Screening_Completed')
                    .slice(0, 3)
                    .map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{c.fullName}</div>
                          <div className="text-xs text-slate-400">{c.requirementTitle} &bull; Score: {c.screeningScore}/100</div>
                        </div>
                        <Link
                          to={`/screening/calls/${c.screeningCallId || 'sc-001'}/rtr`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
                        >
                          Review Draft
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* AI Round 1 Reports to Evaluate */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>AI Interview Reports Ready</span>
                    <AIBadge label="Avatar Scored" />
                  </h3>
                  <span className="text-xs text-slate-400">Requires Recruiter Decision</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  The AI Avatar completed the Round 1 technical interview. Read the comprehensive candidate dossier and record your Round 2 Go/No-Go decision.
                </p>

                <div className="space-y-3">
                  {candidates
                    .filter((c) => c.round1ReportId || c.status === 'Round1_Completed' || c.status === 'Round2_Pending_Decision')
                    .slice(0, 3)
                    .map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>{c.fullName}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {c.round1Score ? `${c.round1Score}%` : 'Scored'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{c.requirementTitle}</div>
                        </div>
                        <Link
                          to={`/interviews/round1/${c.id}/report`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                        >
                          Read Report & Decide
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE WIDGET 4: EVALUATOR DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'Evaluator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">Assigned Round 2 Interviews</div>
              <div className="text-3xl font-black text-white mt-1">2</div>
              <div className="text-xs text-slate-400 mt-1">Human technical deep-dive</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Availability Slots</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">{slots.length}</div>
              <div className="text-xs text-slate-400 mt-1">Configured for booking</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Evaluations</div>
              <div className="text-3xl font-black text-white mt-1">1</div>
              <div className="text-xs text-slate-400 mt-1">Ready for recruiter final review</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-2">My Assigned Candidates for Round 2</h3>
            <p className="text-xs text-slate-400 mb-4">
              Candidates who successfully passed the Round 1 AI Avatar interview and the recruiter's Go/No-Go gate.
            </p>
            <div className="space-y-3">
              {candidates
                .filter((c) => c.status === 'Round2_Scheduled' || c.status === 'Round2_Completed' || c.id === 'cand-007')
                .map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white text-sm">{c.fullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {c.requirementTitle} &bull; AI Round 1 Score: <strong className="text-indigo-300">{c.round1Score}/100</strong>
                      </div>
                    </div>
                    <Link
                      to={`/interviews/round2/${c.id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      Open Evaluation Sheet
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROLE WIDGET 6: ADMIN DASHBOARD */}
      {/* ========================================================================= */}
      {role === 'Admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Question Bank</span>
              </div>
              <div className="text-3xl font-black text-white mt-1">{questions.length}</div>
              <div className="text-xs text-slate-400 mt-1">Screening questions</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rubric Criteria</span>
              </div>
              <div className="text-3xl font-black text-white mt-1">{rubrics.length}</div>
              <div className="text-xs text-slate-400 mt-1">Weighted evaluation points</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Evaluator Slots</span>
              </div>
              <div className="text-3xl font-black text-white mt-1">{slots.length}</div>
              <div className="text-xs text-slate-400 mt-1">Open interview slots</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Health</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">100%</div>
              <div className="text-xs text-slate-400 mt-1">All AI services online</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/questions"
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300">Screening Question Bank</h4>
                <p className="text-xs text-slate-400 mt-1">Manage AI voice screening questions, mandatory flags, and categories.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/rubric"
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300">Evaluation Rubric & Weights</h4>
                <p className="text-xs text-slate-400 mt-1">Adjust scoring weights across Communication, Technical, and Experience.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/slots"
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300">Evaluator Interview Slots</h4>
                <p className="text-xs text-slate-400 mt-1">Configure calendar timeslots for AI automated phone availability booking.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/admin/master-data"
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300">Master Data & Dropdowns</h4>
                <p className="text-xs text-slate-400 mt-1">Configure system roles, departments, locations, and required skills list.</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      )}

      {/* Global Pipeline Summary Strip */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Live Candidate Workflow Stages</h3>
            <p className="text-xs text-slate-400">Total active candidates: {candidates.length}</p>
          </div>
          <Link to="/candidates" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            <span>View candidate directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { phase: '1: Sourcing', count: candidates.filter((c) => c.phase === 1).length, color: 'text-blue-400' },
            { phase: '2: Screening & RTR', count: candidates.filter((c) => c.phase === 2).length, color: 'text-amber-400' },
            { phase: '3: Availability', count: candidates.filter((c) => c.phase === 3).length, color: 'text-purple-400' },
            { phase: '4: AI Avatar R1', count: candidates.filter((c) => c.phase === 4).length, color: 'text-indigo-400' },
            { phase: '5: Decision Gate', count: candidates.filter((c) => c.phase === 5).length, color: 'text-emerald-400' }
          ].map((st, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">{st.phase}</span>
              <span className={`text-2xl font-black ${st.color}`}>{st.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
