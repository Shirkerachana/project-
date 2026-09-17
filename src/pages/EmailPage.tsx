import React, { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Star,
  Clock,
  Search,
  Plus,
  Trash2,
  Reply,
  Forward,
  Sparkles,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { EmailFolderType, EmailMessage } from '../types';
import { emailService } from '../api/email.service';
import { candidatesService } from '../api/candidates.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const EmailPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [activeFolder, setActiveFolder] = useState<EmailFolderType>('inbox');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Compose Modal State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isAiGeneratedDraft, setIsAiGeneratedDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Candidate Quick Picker
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const data = await emailService.getAll(activeFolder);
      setEmails(data);
      if (selectedEmail) {
        const refreshed = data.find((e) => e.id === selectedEmail.id);
        setSelectedEmail(refreshed || null);
      }
    } catch (e: any) {
      toast.error('Failed to load emails', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [activeFolder]);

  useEffect(() => {
    candidatesService.getAll().then((data) => setCandidates(data));
  }, []);

  // Filter emails by search query
  const filteredEmails = emails.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.sender.name.toLowerCase().includes(q) ||
      e.sender.email.toLowerCase().includes(q) ||
      e.recipients.some((r) => r.toLowerCase().includes(q))
    );
  });

  const handleSelectEmail = async (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      await emailService.markAsRead(email.id, true);
      setEmails((prev) =>
        prev.map((item) => (item.id === email.id ? { ...item, isRead: true } : item))
      );
    }
  };

  const handleToggleImportant = async (e: React.MouseEvent, email: EmailMessage) => {
    e.stopPropagation();
    const newStatus = await emailService.toggleImportant(email.id);
    setEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, isImportant: newStatus } : item))
    );
    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail({ ...selectedEmail, isImportant: newStatus });
    }
    toast.info(newStatus ? 'Marked as Important' : 'Removed from Important');
  };

  const handleDeleteEmail = async (id: string) => {
    await emailService.deleteEmail(id);
    toast.success('Email Deleted');
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    loadEmails();
  };

  // Quick Draft AI Invitation
  const handleQuickCandidateInvite = (cand: any) => {
    setSelectedCandidateId(cand.id);
    setComposeRecipient(cand.email);
    setComposeSubject(`Official Invitation: AI Technical Interview - ${cand.requirementTitle}`);
    setComposeBody(
      `Dear ${cand.fullName},\n\nYou have been shortlisted for the ${cand.requirementTitle} position.\n\nYour Round 1 Technical Interview has been scheduled with our AI Technical Interviewer (Eva).\n\nInterview Schedule:\n- Date: Tomorrow\n- Time: 10:00 AM EST\n- Duration: 45 Minutes\n\nSecure Candidate Access Link:\n${window.location.origin}/interview/${cand.interviewSessionToken || 'session-temp-102'}\n\nNotice:\nThis session will be recorded and proctored. Please ensure a stable internet connection and quiet environment.\n\nBest regards,\nTalent Acquisition Team\nTalentPulse`
    );
    setIsAiGeneratedDraft(true);
    setComposeOpen(true);
  };

  const handleSendEmail = async () => {
    if (!composeRecipient || !composeSubject) {
      setSendError('Recipient and Subject are required.');
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await emailService.sendEmail(
        {
          recipient: composeRecipient,
          cc: composeCc ? composeCc.split(',').map((s) => s.trim()) : undefined,
          bcc: composeBcc ? composeBcc.split(',').map((s) => s.trim()) : undefined,
          subject: composeSubject,
          body: composeBody,
          isAiGenerated: isAiGeneratedDraft,
          relatedCandidateId: selectedCandidateId,
          relatedCandidateName: candidates.find((c) => c.id === selectedCandidateId)?.fullName
        },
        user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: role
            }
          : undefined
      );

      toast.success('Email Dispatched', `Message delivered to ${composeRecipient}`);
      setComposeOpen(false);
      // Reset form
      setComposeRecipient('');
      setComposeCc('');
      setComposeBcc('');
      setComposeSubject('');
      setComposeBody('');
      setIsAiGeneratedDraft(false);
      setSelectedCandidateId('');
      if (activeFolder === 'sent') {
        loadEmails();
      }
    } catch (e: any) {
      setSendError(e.message || 'Failed to dispatch email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const folders: { id: EmailFolderType; label: string; icon: any; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'important', label: 'Important', icon: Star },
    { id: 'sent', label: 'Sent Mail', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'followups', label: 'Follow-ups', icon: Clock }
  ];

  return (
    <div id="email-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Recruitment Email</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Interview Synced
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch candidate invitations, evaluator panel notifications, and automated interview confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-950 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      {/* Main Email Interface: Sidebar Folders + Email List + Email Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[640px] shadow-xl">
        {/* Left Navigation Folders */}
        <div className="md:col-span-3 border-r border-slate-800 p-4 space-y-4 bg-slate-950/40">
          <div className="space-y-1">
            {folders.map((f) => {
              const Icon = f.icon;
              const isActive = activeFolder === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(f.id);
                    setSelectedEmail(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{f.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick AI Invite Generator Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Invite Template</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Auto-generate an interview invitation with secure candidate access link and consent notice.
            </p>
            <select
              value={selectedCandidateId}
              onChange={(e) => {
                const cand = candidates.find((c) => c.id === e.target.value);
                if (cand) handleQuickCandidateInvite(cand);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
            >
              <option value="">Select Candidate to Invite...</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.requirementTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Column: Email List */}
        <div
          className={`${
            selectedEmail ? 'hidden md:block md:col-span-4' : 'md:col-span-9'
          } border-r border-slate-800 flex flex-col bg-slate-900/60`}
        >
          {/* Search bar inside list */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject, candidate, sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={loadEmails}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading messages...</div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No emails found in {activeFolder}.
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-3.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-500'
                        : email.isRead
                        ? 'hover:bg-slate-800/50'
                        : 'bg-slate-800/30 hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white truncate max-w-[160px]">
                        {activeFolder === 'sent'
                          ? `To: ${email.recipients[0] || 'Unknown'}`
                          : email.sender.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleImportant(e, email)}
                          className={`p-0.5 rounded ${
                            email.isImportant
                              ? 'text-amber-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(email.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 truncate font-medium mb-1">
                      {email.subject}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {email.body}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {email.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                          <Bot className="w-3 h-3" />
                          <span>AI Generated</span>
                        </span>
                      )}
                      {email.interviewJoinLink && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Join Link Attached</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Email Details */}
        {selectedEmail ? (
          <div className="md:col-span-5 p-6 flex flex-col bg-slate-950/60 overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="md:hidden flex items-center gap-1 text-xs text-indigo-400 font-semibold"
              >
                &larr; Back to List
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Heading */}
            <div className="py-4 border-b border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-bold text-white leading-snug">
                  {selectedEmail.subject}
                </h2>
                {selectedEmail.isAiGenerated && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-500/40">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Generated</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                    {selectedEmail.sender.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{selectedEmail.sender.name}</div>
                    <div className="text-[11px] text-slate-400">&lt;{selectedEmail.sender.email}&gt;</div>
                  </div>
                </div>

                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(selectedEmail.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>To: </span>
                <strong className="text-slate-200">{selectedEmail.recipients.join(', ')}</strong>
                {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                  <span className="ml-2">
                    CC: <span className="text-slate-300">{selectedEmail.cc.join(', ')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Email Body */}
            <div className="py-6 flex-1 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {selectedEmail.body}
            </div>

            {/* Candidate Secure Join Link Card if present */}
            {selectedEmail.interviewJoinLink && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Secure Candidate Join Link</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400">Token-Guarded</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono break-all bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  {selectedEmail.interviewJoinLink}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    No login required for candidate. Independent session shell.
                  </span>
                  <a
                    href={selectedEmail.interviewJoinLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <span>Test Join Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex md:col-span-5 items-center justify-center p-8 text-center text-slate-500 text-xs bg-slate-950/40">
            <div>
              <Mail className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="font-semibold text-slate-400">No Email Selected</p>
              <p className="text-slate-500 mt-1">Select an email from the left pane to view details.</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">New Recruitment Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose Form */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {sendError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Recipient */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Recipient Email *</label>
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    {showCc ? 'Hide CC/BCC' : 'Add CC/BCC'}
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="candidate@example.com"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* CC & BCC */}
              {showCc && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">CC</label>
                    <input
                      type="text"
                      placeholder="manager@talentpulse.internal"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">BCC</label>
                    <input
                      type="text"
                      placeholder="compliance@talentpulse.internal"
                      value={composeBcc}
                      onChange={(e) => setComposeBcc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Subject *</label>
                <input
                  type="text"
                  placeholder="Official Invitation: AI Technical Interview - Lead Cloud Architect"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* AI Generated Indicator Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">AI Generated Content</span>
                    <span className="text-[11px] text-slate-400">
                      Include compliance badge marking this message as AI-drafted.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAiGeneratedDraft}
                  onChange={(e) => setIsAiGeneratedDraft(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Message Body *</label>
                <textarea
                  rows={8}
                  placeholder="Write your email body here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-950 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Dispatching...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
