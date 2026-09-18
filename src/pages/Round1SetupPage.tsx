import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Bot,
  Sliders,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { configService } from '../api/config.service';
import { Candidate, QuestionBankItem } from '../types';

export const Round1SetupPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [allQuestions, setAllQuestions] = useState<QuestionBankItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'junior' | 'mid' | 'senior' | 'lead'>('senior');
  const [technicalWeight, setTechnicalWeight] = useState(70);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customQuestionsList, setCustomQuestionsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!candidateId) return;
      setIsLoading(true);
      try {
        const [cand, qList] = await Promise.all([
          candidatesService.getById(candidateId),
          configService.getQuestions()
        ]);
        setCandidate(cand || null);
        setAllQuestions(qList);

        // Pre-select 4 questions matching candidate skills
        const initial = qList.slice(0, 4).map((q) => q.id);
        setSelectedQuestionIds(initial);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId]);

  if (isLoading) return <LoadingState message="Loading interview configuration..." variant="spinner" />;
  if (!candidate) return <div className="p-8 text-center text-slate-400">Candidate not found.</div>;

  const handleToggleQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      if (selectedQuestionIds.length <= 2) {
        toast.warning('Minimum Questions', 'Round 1 interview requires at least 2 questions.');
        return;
      }
      setSelectedQuestionIds(selectedQuestionIds.filter((qid) => qid !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    setCustomQuestionsList([...customQuestionsList, customQuestion.trim()]);
    setCustomQuestion('');
  };

  const candidateJoinUrl = `${window.location.origin}/interviews/round1/${candidate.id}/live`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(candidateJoinUrl);
    toast.success('Interview Link Copied', 'Candidate unique join URL copied to clipboard.');
  };

  return (
    <div id="round1-setup-page" className="space-y-6">
      <PageHeader
        title={`Configure AI Round 1 Interview: ${candidate.fullName}`}
        description="Phase 4: Select questions, difficulty level, and rubric weighting for the AI Avatar technical evaluator."
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: candidate.fullName, href: `/candidates/${candidate.id}` },
          { label: 'AI Round 1 Setup' }
        ]}
        badge={<AIBadge label="AI Avatar Evaluator" />}
      />

      {/* Candidate Direct Access Box */}
      <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Candidate Direct Interview Access URL
            </span>
            <div className="font-mono text-sm text-white font-semibold mt-1 truncate max-w-xl">
              {candidateJoinUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>

            <Link
              to={`/interviews/round1/${candidate.id}/live`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Interview Console</span>
            </Link>
          </div>
        </div>

        <p className="text-xs text-indigo-200/80 leading-relaxed">
          The candidate will interact with the interactive AI Avatar, respond to selected technical questions via microphone/webcam, and undergo automated proctoring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Bank Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Questions from Question Bank</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedQuestionIds.length} questions currently active for this session
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {allQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-sm font-semibold text-white leading-snug">{q.text}</div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">
                              {q.category}
                            </span>
                            <span className="text-slate-400">Target Time: {q.expectedDurationSeconds}s</span>
                            <span className="text-slate-500">&bull;</span>
                            <span className="text-slate-400 uppercase font-mono text-[10px]">{q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Question Adder */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Add Custom Technical Question
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. Describe how you designed a high-throughput event streaming pipeline..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomQuestion}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {customQuestionsList.length > 0 && (
                <div className="space-y-2 pt-2">
                  {customQuestionsList.map((cq, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                    >
                      <span>{cq}</span>
                      <button
                        type="button"
                        onClick={() => setCustomQuestionsList(customQuestionsList.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Parameters & Weights */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Evaluation Parameters</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Target Difficulty Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['junior', 'mid', 'senior', 'lead'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      difficulty === lvl
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Technical vs Cultural Fit</span>
                <span className="font-mono text-indigo-400 font-bold">{technicalWeight}% Tech</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                value={technicalWeight}
                onChange={(e) => setTechnicalWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>More Behavioral</span>
                <span>More Technical</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Anti-Cheating Proctoring Enabled</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Webcam face detection, multi-face alerts, tab-switch monitoring, and background noise isolation will run actively during the candidate's session.
              </p>
            </div>

            <Link
              to={`/interviews/round1/${candidate.id}/live`}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Candidate Console</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
