import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ExternalLink,
  Trash2,
  HelpCircle,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronRight
} from 'lucide-react';
import { RecruiterAIChatMessage } from '../types';
import { recruiterAIService } from '../api/recruiterAi.service';
import { candidatesService } from '../api/candidates.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export const RecruiterAIPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState<RecruiterAIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('cand-001');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recruiterAIService.getHistory().then((data) => setMessages(data));
    candidatesService.getAll().then((data) => setCandidates(data));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    setIsTyping(true);

    try {
      const response = await recruiterAIService.sendMessage(text, selectedCandidateId || undefined);
      setMessages((prev) => [...prev]);
      // Refetch history
      const history = await recruiterAIService.getHistory();
      setMessages(history);
    } catch (e: any) {
      toast.error('AI Service Error', e.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    await recruiterAIService.clearHistory();
    const refreshed = await recruiterAIService.getHistory();
    setMessages(refreshed);
    toast.info('Chat Cleared');
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  return (
    <div id="recruiter-ai-page" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-950">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Recruiter AI Copilot</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Decision Support
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Context-aware AI copilot for summarizing candidate profiles, explaining technical scores, and accelerating hiring workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Candidate Context Pill Selector */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Active Context Candidate:</span>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="">No specific candidate (General Pipeline)</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} - {c.requirementTitle}
              </option>
            ))}
          </select>
        </div>

        {selectedCandidate && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Stage: <strong className="text-indigo-300">{selectedCandidate.status}</strong></span>
            <span>&bull;</span>
            <Link
              to={`/candidates/${selectedCandidate.id}`}
              className="text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>Profile</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAI
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-950'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : user?.name.charAt(0) || 'U'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isAI
                      ? 'bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm'
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}
                >
                  {/* AI Badge Header */}
                  {isAI && (
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/80 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 font-mono">
                        <Sparkles className="w-3 h-3" />
                        <span>AI RECRUITER ASSISTANT</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Action Links if returned */}
                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60 mt-2">
                      {msg.actionLinks.map((action, i) => (
                        <Link
                          key={i}
                          to={action.url}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <span>{action.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggested Quick Prompts */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Suggested Questions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(p)}
                            className="text-left px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition-colors"
                          >
                            {p} &rarr;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Recruiter AI is analyzing candidate telemetry & generating recommendations...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              selectedCandidate
                ? `Ask about ${selectedCandidate.fullName}'s resume match, AI score, or draft emails...`
                : 'Ask Recruiter AI about candidate pipelines, question generation, or rubrics...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer Footer */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>AI Governance Disclaimer</strong>: Recruiter AI provides advisory analysis and automated drafting only. Hiring, gating, and compensation decisions remain strictly under authorized human control.
        </span>
      </div>
    </div>
  );
};
