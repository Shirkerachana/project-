import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Bot,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { CandidateInterviewShell } from '../layouts/CandidateInterviewShell';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { round1Service } from '../api/round1.service';
import { useToast } from '../context/ToastContext';
import { Candidate, QuestionBankItem } from '../types';

export const CandidateInterviewPage: React.FC = () => {
  const { candidateId, sessionId } = useParams<{ candidateId?: string; sessionId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [questions, setQuestions] = useState<string[]>([
    'Can you walk me through the architecture of a high-concurrency microservice or distributed application you designed and deployed to production?',
    'How do you manage eventual consistency, database locking, and transaction boundaries across microservices?',
    'Tell me about a complex production outage or performance degradation you triaged. What was the root cause and remediation?',
    'Describe how you implement resilient CI/CD pipelines with canary deployments and zero-downtime rollbacks.'
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Proctoring & Media States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(true); // Avatar speaking
  const [avatarSpeakingText, setAvatarSpeakingText] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);

  // Candidate Response Simulation
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [candidateLiveAnswer, setCandidateLiveAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 mins per question
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const allCandidates = await candidatesService.getAll();
        let targetCandidate: Candidate | null = null;
        if (candidateId) {
          targetCandidate = allCandidates.find((c) => c.id === candidateId) || null;
        }
        if (!targetCandidate && sessionId) {
          targetCandidate = allCandidates.find((c) => c.interviewSessionToken === sessionId) || null;
        }
        if (!targetCandidate) {
          targetCandidate = allCandidates.find((c) => c.id === 'cand-001') || allCandidates[0] || null;
        }
        setCandidate(targetCandidate);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [candidateId, sessionId]);

  // Tab-switch proctor detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setProctorWarning(`Warning: Window switch detected (${next} time(s)). This activity is logged for proctoring.`);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Avatar initial speech
  useEffect(() => {
    if (!isLoading && questions.length > 0) {
      triggerAvatarQuestion(currentQuestionIndex);
    }
  }, [isLoading, currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const triggerAvatarQuestion = (index: number) => {
    setIsAudioSpeaking(true);
    setIsRecordingAnswer(false);
    setCandidateLiveAnswer('');
    setTimeRemaining(180);

    const q = questions[index];
    setAvatarSpeakingText(q);

    // After 4s avatar finishes speaking and candidate mic is live
    setTimeout(() => {
      setIsAudioSpeaking(false);
      setIsRecordingAnswer(true);
      simulateCandidateVoiceTranscription(index);
    }, 3500);
  };

  // Simulates live speech-to-text typing in candidate box
  const simulateCandidateVoiceTranscription = (index: number) => {
    const sampleAnswers = [
      "In my previous role at scale, I designed our payment orchestration service using Go and Apache Kafka. We decoupled sync HTTP calls into asynchronous events, allowing 25,000 TPS under peak load with Redis cluster for idempotency.",
      "For eventual consistency across our services, we utilized the Saga pattern with compensating transactions. We avoided distributed 2PC locks and instead leveraged Kafka topics with outbox pattern for transactional reliability.",
      "We experienced a critical degradation where database connection pools were exhausted due to unindexed query scans in our analytics endpoint. I identified the lock contention using APM traces, added a composite index, and introduced Circuit Breaker limits.",
      "Our CI/CD runs on GitHub Actions deploying to Kubernetes with ArgoCD. We utilize Istio for traffic splitting to route 5% of production traffic to canary pods while continuously evaluating error rates before 100% rollout."
    ];

    const targetText = sampleAnswers[index] || "I approach this by structuring the problem into clear modular layers...";
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < targetText.length) {
        setCandidateLiveAnswer(targetText.slice(0, currentIdx + 4));
        currentIdx += 4;
      } else {
        clearInterval(interval);
      }
    }, 80);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Final submission & report generation
      setIsSubmitting(true);
      try {
        const targetId = candidate?.id || 'cand-001';
        const report = await round1Service.generateReport(targetId, {
          tabSwitches: tabSwitchCount,
          difficulty: 'senior'
        });
        toast.success(
          'Interview Completed Successfully',
          `AI evaluated responses and generated comprehensive technical dossier. Score: ${report.overallScore}/100.`
        );
        navigate(`/interviews/round1/${targetId}/report`);
      } catch (err: any) {
        toast.error('Submission Error', err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) return <LoadingState message="Connecting to AI Interview Room..." variant="spinner" />;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <CandidateInterviewShell
      candidateName={candidate?.fullName || 'Candidate'}
      roleTitle={candidate?.requirementTitle || 'Software Engineer'}
    >
      <div id="candidate-interview-page" className="space-y-6">
        {/* Proctoring Warning if triggered */}
        {proctorWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{proctorWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setProctorWarning(null)}
              className="text-amber-400 hover:text-white font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Progress & Timer Strip */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="text-xs text-slate-400">Phase 4: AI Technical Avatar Evaluation</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Time Left: <strong className="text-white font-bold">{formatTimer(timeRemaining)}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-emerald-400 font-bold uppercase font-mono tracking-wider">
                Proctoring Active
              </span>
            </div>
          </div>
        </div>

        {/* Main Video Arena: Split AI Avatar vs Candidate Video Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Avatar Pane */}
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col justify-between p-6 shadow-2xl">
            {/* Avatar Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-semibold">AI Technical Interviewer (Eva)</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-800 text-[11px] text-slate-300 font-mono">
                {isAudioSpeaking ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <span>Listening</span>
                  </>
                )}
              </div>
            </div>

            {/* Simulated Animated Avatar Center */}
            <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
              <div className="relative">
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isAudioSpeaking
                      ? 'bg-gradient-to-tr from-indigo-600/40 to-purple-600/40 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-105'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <Bot className={`w-14 h-14 ${isAudioSpeaking ? 'text-indigo-300' : 'text-slate-400'}`} />
                </div>

                {/* Animated Speech Ring */}
                {isAudioSpeaking && (
                  <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-30" />
                )}
              </div>

              {/* Sound Waves Animation */}
              {isAudioSpeaking && (
                <div className="flex items-center gap-1.5 h-6">
                  <span className="w-1 bg-indigo-400 h-3 animate-pulse rounded" />
                  <span className="w-1 bg-indigo-300 h-6 animate-pulse rounded delay-75" />
                  <span className="w-1 bg-indigo-400 h-4 animate-pulse rounded delay-150" />
                  <span className="w-1 bg-indigo-300 h-5 animate-pulse rounded delay-100" />
                  <span className="w-1 bg-indigo-400 h-2 animate-pulse rounded" />
                </div>
              )}
            </div>

            {/* Subtitles on Avatar */}
            <div className="z-10 bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-200 leading-relaxed">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                Current Question
              </span>
              "{questions[currentQuestionIndex]}"
            </div>
          </div>

          {/* Candidate Webcam Feed Pane */}
          <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col justify-between p-6 shadow-2xl">
            {/* Candidate Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">{candidate?.fullName || 'You'} (Candidate Feed)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Face 1/1 Verified</span>
                </div>
              </div>
            </div>

            {/* Simulated Candidate Stream Silhouette */}
            <div className="flex flex-col items-center justify-center my-auto text-center space-y-2">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 text-2xl font-bold">
                {candidate?.fullName.charAt(0) || 'C'}
              </div>
              <div className="text-xs text-slate-400">Webcam Feed Active &bull; 1080p WebRTC</div>
            </div>

            {/* Live Audio Transcription Overlay */}
            <div className="z-10 bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-200 leading-relaxed">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Your Live Speech Transcription</span>
                </span>
                <span className="font-mono text-slate-400">Whisper AI STT</span>
              </div>
              <p className="italic text-slate-300">
                {candidateLiveAnswer || 'Listening for your response... Speak clearly into your microphone.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-2xl border transition-colors ${
                isMicOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-2xl border transition-colors ${
                isVideoOn
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
              title={isVideoOn ? 'Disable Camera' : 'Enable Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <span className="text-xs text-slate-400 border-l border-slate-800 pl-3">
              Proctoring tabs switched: <strong className="text-amber-400 font-mono">{tabSwitchCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <span>
                {currentQuestionIndex < questions.length - 1
                  ? 'Submit Answer & Next Question'
                  : 'Finish Interview & Generate Scored Report'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </CandidateInterviewShell>
  );
};
