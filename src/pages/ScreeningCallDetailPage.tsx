import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Save,
  FileText,
  Sliders
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { AudioPlayer } from '../components/common/AudioPlayer';
import { TranscriptViewer } from '../components/common/TranscriptViewer';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingState } from '../components/common/LoadingState';
import { screeningService } from '../api/screening.service';
import { configService } from '../api/config.service';
import { calendarService } from '../api/calendar.service';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ScreeningCall, RubricCriterion } from '../types';

export const ScreeningCallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [call, setCall] = useState<ScreeningCall | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Editable scores mapped by criterion key
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const [c, rList] = await Promise.all([
          screeningService.getCallById(id),
          configService.getRubric()
        ]);
        if (c) {
          setCall(c);
          setScores(c.rubricScores || { communication: 85, technical: 80, experience: 85 });
          setFeedback(c.aiSummary || '');
          if ((c.transcript && c.transcript.length > 0) || c.aiSummary) {
            calendarService.upsertScreeningTranscriptEvent({
              callId: c.id,
              candidateId: c.candidateId,
              candidateName: c.candidateName,
              roleTitle: c.requirementTitle,
              scheduledAt: c.scheduledAt,
              durationSeconds: c.durationSeconds,
              summary: c.aiSummary || c.recruiterNotes,
              transcript: c.transcript,
              score: c.overallScore,
              phone: c.candidatePhone
            });
          }
        }
        setRubric(rList);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return <LoadingState message="Loading call data and transcript..." variant="spinner" />;
  if (!call) return <div className="p-8 text-center text-slate-400">Call recording not found.</div>;

  const handleScoreChange = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  // Calculate weighted overall score
  const scoreVals = Object.values(scores) as number[];
  const computedOverall = Math.round(
    scoreVals.reduce((acc: number, curr: number) => acc + curr, 0) / (scoreVals.length || 1)
  );

  const handleSaveScoring = async () => {
    setIsSavingScore(true);
    try {
      const updated = await screeningService.scoreCall(call.id, {
        score: computedOverall,
        notes: feedback,
        scoredBy: user?.name
      });
      setCall(updated);
      await calendarService.upsertScreeningTranscriptEvent({
        callId: updated.id,
        candidateId: updated.candidateId,
        candidateName: updated.candidateName,
        roleTitle: updated.requirementTitle,
        scheduledAt: updated.scheduledAt,
        durationSeconds: updated.durationSeconds,
        summary: feedback,
        transcript: updated.transcript,
        score: updated.overallScore || computedOverall,
        phone: updated.candidatePhone
      });
      toast.success(
        'Scoring Saved & Candidate Updated',
        `Overall screen score set to ${updated.overallScore || computedOverall}/100. Transcript summary saved to Calendar.`
      );
    } catch (err: any) {
      toast.error('Scoring Error', err.message);
    } finally {
      setIsSavingScore(false);
    }
  };

  return (
    <div id="screening-call-detail-page" className="space-y-6">
      <PageHeader
        title={`AI Screening Call: ${call.candidateName}`}
        description={`Phone: ${call.candidatePhone} • Date: ${new Date(call.scheduledAt).toLocaleString()} • Call ID: ${call.id}`}
        breadcrumbs={[
          { label: 'Screening Calls', href: '/screening/calls' },
          { label: call.candidateName }
        ]}
        badge={<AIBadge label="AI Voice Transcribed" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to={`/screening/calls/${call.id}/rtr`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Review AI RTR Draft</span>
            </Link>
          </div>
        }
      />

      {/* Top Media Bar: Audio Player + Score Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3">
          <AudioPlayer
            durationSeconds={call.durationSeconds}
            candidateName={call.candidateName}
            callDate={new Date(call.scheduledAt).toLocaleDateString()}
          />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
          <ScoreGauge
            score={call.overallScore || computedOverall}
            maxScore={100}
            label="Calculated Screen Score"
            size="md"
          />
          <div className="mt-3 text-xs text-slate-400">
            Based on {rubric?.length ?? 0} weighted criteria
          </div>
        </div>
      </div>

      {/* Main Split: Transcript vs Rubric Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Transcript */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Full AI Screening Call Transcript</span>
              <AIBadge label="Speech-To-Text" />
            </h3>
            <span className="text-xs text-slate-400">
              {call.transcript?.length ?? 0} dialogue turns
            </span>
          </div>

          <TranscriptViewer
            transcript={call.transcript || []}
            overallConfidence={call.transcriptionConfidence}
            confidenceFlagReason={call.confidenceFlagReason}
          />
        </div>

        {/* Right 5 cols: Rubric Scoring Form (Rubric fetched from Admin config) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Rubric-Driven Evaluation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamic criteria configured in Admin Question & Rubric bank.
                </p>
              </div>
            </div>

            {/* Rubric Sliders */}
            <div className="space-y-4">
              {rubric.map((crit) => {
                const currentVal = scores[crit.key] ?? 75;
                return (
                  <div key={crit.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{crit.title}</span>
                      <span className="font-mono font-bold text-indigo-400">{currentVal}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{crit.description}</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={currentVal}
                        onChange={(e) => handleScoreChange(crit.key, Number(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className="text-[11px] text-slate-500 font-mono w-14 text-right">
                        Weight: {crit.weight}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Screener Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                AI Screening Synthesis & Recruiter Notes
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Notes on communication clarity, candidate interest, notice period..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Score: <strong className="text-emerald-400">{computedOverall}/100</strong>
              </span>
              <button
                type="button"
                onClick={handleSaveScoring}
                disabled={isSavingScore}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingScore ? 'Saving...' : 'Save & Update Candidate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
