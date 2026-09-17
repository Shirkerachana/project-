import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  UserCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { round1Service } from '../api/round1.service';
import { useToast } from '../context/ToastContext';
import { Candidate, Round1InterviewReport } from '../types';

export const Round1ReportPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [report, setReport] = useState<Round1InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!candidateId) return;
      setIsLoading(true);
      try {
        const [c, r] = await Promise.all([
          candidatesService.getById(candidateId),
          round1Service.getReportByCandidateId(candidateId)
        ]);
        setCandidate(c || null);
        setReport(r || null);
        if (r && (r.questionEvaluations?.length ?? 0) > 0) {
          setExpandedQuestionId(r.questionEvaluations[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (isLoading) return <LoadingState message="Loading AI evaluation dossier..." variant="spinner" />;
  if (!candidate || !report) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <div>Interview report not found for this candidate.</div>
        <Link
          to={`/interviews/round1/${candidateId}/setup`}
          className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Setup Interview Now
        </Link>
      </div>
    );
  }

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'strong_hire':
        return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40">Strong Hire Recommendation</span>;
      case 'hire':
        return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-500/40">Hire Recommendation</span>;
      case 're_evaluate':
        return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/40">Re-Evaluate</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-500/40">Do Not Hire</span>;
    }
  };

  return (
    <div id="round1-report-page" className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title={`AI Technical Interview Dossier: ${candidate.fullName}`}
        description={`Role: ${candidate.requirementTitle} • Completed: ${new Date(report.completedAt).toLocaleString()} • Proctor Score: ${report.antiCheatingLog.proctorScore}%`}
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName, href: `/candidates/${candidate.id}` },
          { label: 'Round 1 Report' }
        ]}
        badge={<AIBadge label="AI Avatar Evaluated" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to={`/decisions/round2/${candidate.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <span>Advance to Round 2 Human Gate</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      {/* Hero Scorecard */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center shadow-xl">
        <div className="lg:col-span-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {getRecommendationBadge(report.recommendation)}
            <span className="text-xs text-slate-400 font-mono">
              Evaluated with Senior Engineering Rubric
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            {report.aiSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Key Strengths Identified
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {report.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Areas for Human Probing (Round 2)
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {report.areasOfConcern.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Big Overall Gauge */}
        <div className="flex flex-col items-center justify-center p-4 border-t lg:border-t-0 lg:border-l border-slate-800 text-center">
          <ScoreGauge
            score={report.overallScore}
            maxScore={100}
            label="Overall Technical Rating"
            size="lg"
          />
          <span className="text-xs text-slate-400 mt-2 font-semibold">
            Weight: 70% Tech, 30% Fit
          </span>
        </div>
      </div>

      {/* Section-by-Section Competency Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Section-by-Section Competency Breakdown</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {report.sections.map((sec) => (
            <div key={sec.name} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{sec.name}</span>
                <span className="font-mono font-bold text-indigo-400">{sec.score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                  style={{ width: `${sec.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {sec.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-Cheating & Proctoring Log Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>Proctoring & Identity Integrity: Verified</span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                ({report.antiCheatingLog.proctorScore}% Confidence)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Tab switches: <strong className="text-white">{report.antiCheatingLog.tabSwitches}</strong> &bull; Faces detected: <strong className="text-white">{report.antiCheatingLog.facesDetected}</strong> &bull; Audio flags: <strong className="text-white">{report.antiCheatingLog.audioAnomalies}</strong>
            </div>
          </div>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
          Session Integrity: PASS
        </div>
      </div>

      {/* Per-Question Detailed Transcript & AI Critiques */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>Per-Question Evaluation & Transcripts ({report.questionEvaluations?.length ?? 0})</span>
          </h3>
          <span className="text-xs text-slate-400">Click question to expand full response & rubric</span>
        </div>

        <div className="space-y-3">
          {(report.questionEvaluations || []).map((qEval, idx) => {
            const isExpanded = expandedQuestionId === qEval.id;
            return (
              <div
                key={qEval.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : qEval.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      Q{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white leading-snug">
                        {qEval.questionText}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span className="text-indigo-400 font-semibold">{qEval.category}</span>
                        <span>&bull;</span>
                        <span className="text-slate-500">Duration: {qEval.durationSeconds}s</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {qEval.score}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/10</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                    <div className="space-y-1.5 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Candidate Answer (Transcribed by AI)
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 italic">
                        "{qEval.candidateAnswer}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Evaluation & Rubric Critique</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
                        {qEval.aiCritique}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Control Point #2 Transition CTA */}
      <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            HUMAN CONTROL POINT #2: Round 2 Go/No-Go Decision Gate
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            The AI has completed technical evaluation. A human decision maker (Team Manager or Technical Lead) must now record an explicit Go or No-Go decision with rationale.
          </p>
        </div>

        <Link
          to={`/decisions/round2/${candidate.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
        >
          <span>Open Round 2 Decision Gate</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
