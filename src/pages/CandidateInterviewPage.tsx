import React, { useState, useEffect } from 'react';
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
  Radio,
  Camera,
  Wifi,
  FileCheck,
  Check
} from 'lucide-react';
import { CandidateInterviewShell } from '../layouts/CandidateInterviewShell';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { round1Service } from '../api/round1.service';
import { auditService } from '../api/audit.service';
import { useToast } from '../context/ToastContext';
import { Candidate } from '../types';

type FlowStage = 'device_check' | 'consent' | 'interview' | 'completed';

export const CandidateInterviewPage: React.FC = () => {
  const { candidateId, sessionId } = useParams<{ candidateId?: string; sessionId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [flowStage, setFlowStage] = useState<FlowStage>('device_check');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [questions, setQuestions] = useState<string[]>([
    'Can you walk me through the architecture of a high-concurrency microservice or distributed application you designed and deployed to production?',
    'How do you manage eventual consistency, database locking, and transaction boundaries across microservices?',
    'Tell me about a complex production outage or performance degradation you triaged. What was the root cause and remediation?',
    'Describe how you implement resilient CI/CD pipelines with canary deployments and zero-downtime rollbacks.'
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Device Check States
  const [cameraReady, setCameraReady] = useState(true);
  const [micReady, setMicReady] = useState(true);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [networkLatency, setNetworkLatency] = useState(28);

  // Consent Form States
  const [consentRecording, setConsentRecording] = useState(false);
  const [consentProctoring, setConsentProctoring] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  // Proctoring & Media States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(true);
  const [avatarSpeakingText, setAvatarSpeakingText] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);

  // Candidate Response Simulation
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [candidateLiveAnswer, setCandidateLiveAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

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

  // Tab switch detection during interview
  useEffect(() => {
    if (flowStage !== 'interview') return;
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
  }, [flowStage]);

  // Avatar speech when starting or advancing
  useEffect(() => {
    if (flowStage === 'interview' && questions.length > 0) {
      triggerAvatarQuestion(currentQuestionIndex);
    }
  }, [flowStage, currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (flowStage !== 'interview' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [flowStage, timeRemaining]);

  const triggerAvatarQuestion = (index: number) => {
    setIsAudioSpeaking(true);
    setIsRecordingAnswer(false);
    setCandidateLiveAnswer('');
    setTimeRemaining(180);

    const q = questions[index];
    setAvatarSpeakingText(q);

    setTimeout(() => {
      setIsAudioSpeaking(false);
      setIsRecordingAnswer(true);
      simulateCandidateVoiceTranscription(index);
    }, 3200);
  };

  const simulateCandidateVoiceTranscription = (index: number) => {
    const sampleAnswers = [
      'In my previous role at scale, I designed our payment orchestration service using Go and Apache Kafka. We decoupled sync HTTP calls into asynchronous events, allowing 25,000 TPS under peak load with Redis cluster for idempotency.',
      'For eventual consistency across our services, we utilized the Saga pattern with compensating transactions. We avoided distributed 2PC locks and instead leveraged Kafka topics with outbox pattern for transactional reliability.',
      'We experienced a critical degradation where database connection pools were exhausted due to unindexed query scans in our analytics endpoint. I identified the lock contention using APM traces, added a composite index, and introduced Circuit Breaker limits.',
      'Our CI/CD runs on GitHub Actions deploying to Kubernetes with ArgoCD. We utilize Istio for traffic splitting to route 5% of production traffic to canary pods while continuously evaluating error rates before 100% rollout.'
    ];

    const targetText = sampleAnswers[index] || 'I approach this by structuring the problem into clear modular layers...';
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
      setIsSubmitting(true);
      try {
        const targetId = candidate?.id || 'cand-001';
        const report = await round1Service.generateReport(targetId, {
          tabSwitches: tabSwitchCount,
          difficulty: 'senior'
        });
        setFinalScore(report.overallScore);

        await auditService.log({
          actor: {
            id: targetId,
            name: candidate?.fullName || 'Candidate',
            email: candidate?.email || 'candidate@example.com',
            role: 'Candidate'
          },
          action: 'Interview completed',
          entityType: 'Interview',
          entityId: `ai-session-${targetId}`,
          entityName: `Round 1 Technical Interview`,
          status: 'SUCCESS',
          severity: 'info',
          details: `Candidate completed all 4 questions. Overall score: ${report.overallScore}/100. Tab switches: ${tabSwitchCount}.`
        });

        setFlowStage('completed');
      } catch (err: any) {
        toast.error('Submission Error', err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) return <LoadingState message="Connecting to AI Interview Room..." variant="spinner" />;

  return (
    <CandidateInterviewShell
      candidateName={candidate?.fullName || 'Candidate'}
      roleTitle={candidate?.requirementTitle || 'Software Engineer'}
    >
      {/* =========================================================================
          STAGE 1: DEVICE CHECK
         ========================================================================= */}
      {flowStage === 'device_check' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System & Hardware Check</h1>
            <p className="text-xs text-slate-400">
              Please verify your camera, microphone, and speakers before entering the secure interview session.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            {/* Camera Check */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Integrated HD Webcam</span>
                  <span className="text-[11px] text-slate-400">Video feed detected (1920x1080 @ 30fps)</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                <Check className="w-4 h-4" />
                <span>Ready</span>
              </span>
            </div>

            {/* Microphone Check */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Microphone Input</span>
                  <span className="text-[11px] text-slate-400">Signal received &bull; Noise reduction active</span>
                </div>
              </div>
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-emerald-400 h-2 rounded animate-pulse" />
                <span className="w-1 bg-emerald-400 h-3 rounded animate-pulse delay-75" />
                <span className="w-1 bg-emerald-400 h-2 rounded animate-pulse delay-150" />
                <span className="w-1 bg-emerald-400 h-4 rounded animate-pulse delay-100" />
              </div>
            </div>

            {/* Speaker Sound Test */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Speaker Output</span>
                  <span className="text-[11px] text-slate-400">Test audio playback from AI Avatar</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSpeakerTested(true);
                  toast.info('Audio Chime Played', 'If you heard the test chime, your speakers are working.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  speakerTested
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {speakerTested ? 'Tested (Working)' : 'Play Test Tone'}
              </button>
            </div>

            {/* Network Latency */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">WebRTC Connection</span>
                  <span className="text-[11px] text-slate-400">Ping: {networkLatency}ms &bull; Bandwidth: 85 Mbps</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                <Check className="w-4 h-4" />
                <span>Optimal</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setFlowStage('consent')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
            >
              <span>Continue to Consent & Rules</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: CONSENT & PROCTORING AGREEMENT
         ========================================================================= */}
      {flowStage === 'consent' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Interview Agreement & Guidelines</h1>
            <p className="text-xs text-slate-400">
              Please review and accept the evaluation and proctoring policies to begin.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300 leading-relaxed">
              <span className="font-bold text-white text-xs block">Important Instructions:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>This technical interview consists of 4 dynamic architectural questions.</li>
                <li>You will have up to 3 minutes per question to articulate your design and answers.</li>
                <li>Your video and audio streams are proctored in real time for identity integrity.</li>
                <li>Leaving the browser window or switching tabs will be logged on your evaluation report.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentRecording}
                  onChange={(e) => setConsentRecording(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700 mt-0.5"
                />
                <span className="text-slate-300 text-xs">
                  I consent to the audio and video recording of this technical interview session for evaluation purposes.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentProctoring}
                  onChange={(e) => setConsentProctoring(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700 mt-0.5"
                />
                <span className="text-slate-300 text-xs">
                  I acknowledge that automated proctoring (facial presence and window focus tracking) is active during the session.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700 mt-0.5"
                />
                <span className="text-slate-300 text-xs">
                  I agree to complete this assessment independently without unauthorized third-party assistance.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFlowStage('device_check')}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              &larr; Back to Device Check
            </button>

            <button
              type="button"
              onClick={() => {
                setFlowStage('interview');
                toast.success('Interview Initialized', 'Session recording started. Good luck!');
              }}
              disabled={!consentRecording || !consentProctoring || !consentTerms}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-40"
            >
              <span>Begin Technical Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: LIVE INTERVIEW ARENA
         ========================================================================= */}
      {flowStage === 'interview' && (
        <div id="candidate-interview-page" className="space-y-6 animate-in fade-in">
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
                <div className="text-xs text-slate-400">Phase 4: AI Technical Avatar Assessment</div>
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

          {/* Main Video Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Avatar Pane */}
            <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden aspect-video flex flex-col justify-between p-6 shadow-2xl">
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

              {/* Animated Avatar Center */}
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
                  {isAudioSpeaking && (
                    <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-30" />
                  )}
                </div>

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

              {/* Candidate Stream Silhouette */}
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
                Window Switches: <strong className="text-amber-400 font-mono">{tabSwitchCount}</strong>
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
                    : isSubmitting
                    ? 'Processing Responses...'
                    : 'Finish Interview & Submit'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: COMPLETED CONFIRMATION SCREEN
         ========================================================================= */}
      {flowStage === 'completed' && (
        <div className="max-w-xl mx-auto text-center space-y-6 animate-in fade-in py-8">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Interview Successfully Submitted!</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Thank you, <strong className="text-slate-200">{candidate?.fullName}</strong>. Your technical responses and audio-video streams have been securely transmitted to the TalentPulse recruitment panel.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-3">
            <span className="font-bold text-white text-xs block">What Happens Next?</span>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Our AI evaluation engine has generated your objective score dossier.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>A Senior Recruiter will review the results within 24-48 business hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>If shortlisted, you will receive an invitation to the Round 2 Human Technical Panel.</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            You may safely close this browser window or tab.
          </p>
        </div>
      )}
    </CandidateInterviewShell>
  );
};
