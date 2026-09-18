import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { round1Service } from '../api/round1.service';
import { Candidate, Round1InterviewReport } from '../types';

export const Round1ReportPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [report, setReport] = useState<Round1InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (isLoading) return <LoadingState message="Loading interview report..." variant="spinner" />;
  if (!candidate || !report) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-3">
        <div>Interview report not found for this candidate.</div>
        <Link
          to="/interview"
          className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Back to Interview
        </Link>
      </div>
    );
  }

  const questions = report.questionAssessments?.length
    ? report.questionAssessments
    : report.questionEvaluations || [];
  const integrity = report.proctoringSummary?.overallIntegrity || 'Clean';

  return (
    <div id="round1-report-page" className="space-y-6">
      <PageHeader
        title={`Round 1 Report: ${candidate.fullName}`}
        description={`${candidate.requirementTitle} • ${new Date(report.generatedAt || Date.now()).toLocaleString()}`}
        breadcrumbs={[
          { label: 'Interview', href: '/interview' },
          { label: candidate.fullName, href: `/candidates/${candidate.id}` },
          { label: 'Round 1 Report' }
        ]}
        badge={<AIBadge label="AI Evaluated" />}
        actions={
          <Link
            to={`/decisions/round2/${candidate.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            <span>Round 2 Decision</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-3 space-y-3">
          <div className="text-sm font-bold text-white">{report.recommendation}</div>
          <p className="text-sm text-slate-300 leading-relaxed">{report.reasoning}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="text-[11px] font-bold uppercase text-emerald-400 mb-1">Strengths</div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {(report.strengths || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <div className="text-[11px] font-bold uppercase text-amber-400 mb-1">Gaps</div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {(report.gaps || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <ScoreGauge score={report.overallScore} maxScore={100} label="Overall Score" size="lg" />
          <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Integrity: {integrity}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          Question evaluations
        </h3>
        {questions.map((item: any, idx: number) => (
          <div key={item.questionId || item.id || idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-white">
                Q{idx + 1}. {item.questionText}
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono shrink-0">
                {item.score}/{item.maxScore || 10}
              </div>
            </div>
            {item.candidateAnswerSnippet && (
              <p className="text-xs text-slate-300 italic">{item.candidateAnswerSnippet}</p>
            )}
            {item.reasoning && <p className="text-xs text-slate-400">{item.reasoning}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
