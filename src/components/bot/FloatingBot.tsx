import React, { useEffect, useRef, useState } from 'react';
import { Bot, Briefcase, ChevronDown, ExternalLink, RotateCcw, Send, Sparkles, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecruiterAIChatMessage } from '../../types';
import { recruiterAIService } from '../../api/recruiterAi.service';
import { candidatesService } from '../../api/candidates.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { canAccessBot } from '../../config/botPermissions';

/** A lightweight shell for the existing Recruiter AI conversation. */
export const FloatingBot: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<RecruiterAIChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedText, setFailedText] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand-001');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const canUseBot = canAccessBot(user);

  useEffect(() => {
    if (!canUseBot || !isOpen) return;
    recruiterAIService.getHistory().then(setMessages).catch(() => setError('Unable to load conversation.'));
    candidatesService.getAll().then(setCandidates).catch(() => setCandidates([]));
  }, [canUseBot, isOpen]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, error]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!canUseBot) return null;
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId);

  const send = async (suggestion?: string) => {
    const text = suggestion || inputText;
    if (!text.trim() || isTyping) return;
    setInputText(''); setIsTyping(true); setError(null); setFailedText(null);
    try {
      await recruiterAIService.sendMessage(text, selectedCandidateId || undefined);
      setMessages(await recruiterAIService.getHistory());
    } catch (cause: any) {
      const message = cause?.message || 'Something went wrong.';
      setError(message); setFailedText(text); toast.error('AI Service Error', message);
    } finally { setIsTyping(false); }
  };

  const clearHistory = async () => {
    try { await recruiterAIService.clearHistory(); setMessages(await recruiterAIService.getHistory()); toast.info('Chat Cleared'); }
    catch { setError('Unable to clear conversation.'); }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3" aria-live="polite">
      {isOpen && (
        <section role="dialog" aria-modal="false" aria-label="Bot AI Assistant" className="w-[calc(100vw-2rem)] sm:w-[390px] h-[min(580px,calc(75vh-5rem))] min-h-[420px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl shadow-slate-950/50 flex flex-col origin-bottom-right animate-[bot-in_160ms_ease-out]">
          <header className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-950"><Bot className="w-4 h-4" /></div>
              <div><h2 className="text-sm font-bold text-white">Bot</h2><p className="text-[10px] text-slate-400">AI Recruitment Assistant</p></div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearHistory} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Clear chat history" title="Clear history"><Trash2 className="w-3.5 h-3.5" /></button>
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Close Bot"><X className="w-4 h-4" /></button>
            </div>
          </header>

          <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/40 shrink-0">
            <label className="flex items-center gap-2 text-[10px] text-slate-400"><Briefcase className="w-3.5 h-3.5 text-indigo-400" /><span className="sr-only">Candidate context</span><select value={selectedCandidateId} onChange={(e) => setSelectedCandidateId(e.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-200 outline-none"><option value="">General recruitment pipeline</option>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>)}</select><ChevronDown className="w-3.5 h-3.5" /></label>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => {
              const isAI = message.sender === 'assistant';
              return <div key={message.id} className={`flex gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
                <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${isAI ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-200'}`}>{isAI ? <Bot className="w-3.5 h-3.5" /> : user?.name.charAt(0) || 'U'}</div>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${isAI ? 'bg-slate-950 border border-slate-800 text-slate-200' : 'bg-indigo-600 text-white'}`}>
                  {isAI && <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 mb-1"><Sparkles className="w-3 h-3" /> BOT</div>}
                  {message.text}
                  {message.actionLinks?.length ? <div className="pt-2 mt-2 border-t border-slate-800 space-y-1">{message.actionLinks.map((action) => <Link key={action.url} to={action.url} onClick={() => setIsOpen(false)} className="flex items-center gap-1 text-[10px] text-indigo-300 hover:text-indigo-200"><span>{action.label}</span><ExternalLink className="w-3 h-3" /></Link>)}</div> : null}
                  {message.suggestedPrompts?.length ? <div className="pt-2 mt-2 border-t border-slate-800 flex flex-wrap gap-1">{message.suggestedPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} disabled={isTyping} className="text-left rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 text-[10px] text-slate-300 disabled:opacity-50">{prompt}</button>)}</div> : null}
                </div>
              </div>;
            })}
            {isTyping && <div className="flex gap-2"><div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><Bot className="w-3.5 h-3.5" /></div><div className="rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-400"><span className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-indigo-400 animate-pulse" />Bot is thinking…</div></div>}
            {error && <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-2.5 text-xs text-rose-200 flex items-center justify-between gap-2"><span>{error}</span><button type="button" onClick={() => failedText && send(failedText)} disabled={!failedText || isTyping} className="inline-flex items-center gap-1 font-semibold hover:text-white disabled:opacity-50"><RotateCcw className="w-3 h-3" />Retry</button></div>}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={(event) => { event.preventDefault(); send(); }} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
            <input value={inputText} onChange={(event) => setInputText(event.target.value)} disabled={isTyping} placeholder={selectedCandidate ? `Ask about ${selectedCandidate.fullName}…` : 'Ask something…'} aria-label="Message Bot" className="min-w-0 flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60" />
            <button type="submit" disabled={isTyping || !inputText.trim()} aria-label="Send message" className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"><Send className="w-4 h-4" /></button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-label={isOpen ? 'Close Bot' : 'Open Bot'} aria-expanded={isOpen} className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 text-sm font-bold shadow-xl shadow-indigo-950/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-95 transition-transform"><Bot className="w-4 h-4" /><span>Bot</span></button>
    </div>
  );
};
