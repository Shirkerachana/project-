import React, { useEffect, useMemo, useState } from 'react';
import {
  Inbox,
  Star,
  Clock,
  Send,
  FileText,
  ChevronDown,
  Search,
  Pencil,
  Trash2,
  Reply,
  Forward,
  X,
  Tag,
  Users,
  Info,
  Archive
} from 'lucide-react';
import { EmailMessage } from '../types';
import { emailService } from '../api/email.service';
import { candidatesService } from '../api/candidates.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type GmailTab = 'primary' | 'promotions' | 'social' | 'updates';
type GmailFolder = 'inbox' | 'starred' | 'snoozed' | 'sent' | 'drafts';

const formatMailDate = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const EmailPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [activeFolder, setActiveFolder] = useState<GmailFolder>('inbox');
  const [activeTab, setActiveTab] = useState<GmailTab>('primary');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const data = await emailService.getAll();
      setEmails(data);
      if (selectedEmail) {
        setSelectedEmail(data.find((item) => item.id === selectedEmail.id) || null);
      }
    } catch (e: any) {
      toast.error('Failed to load emails', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
    candidatesService.getAll().then((data) => setCandidates(data));
  }, []);

  const inboxEmails = emails.filter((item) => item.folder === 'inbox');
  const unreadInbox = inboxEmails.filter((item) => !item.isRead).length;

  const folderEmails = useMemo(() => {
    if (activeFolder === 'starred') return emails.filter((item) => item.isImportant);
    if (activeFolder === 'snoozed') return emails.filter((item) => item.folder === 'followups');
    if (activeFolder === 'sent') return emails.filter((item) => item.folder === 'sent');
    if (activeFolder === 'drafts') return emails.filter((item) => item.folder === 'drafts');
    return inboxEmails;
  }, [activeFolder, emails, inboxEmails]);

  const visibleEmails = folderEmails.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      item.subject.toLowerCase().includes(query) ||
      item.body.toLowerCase().includes(query) ||
      item.sender.name.toLowerCase().includes(query) ||
      item.sender.email.toLowerCase().includes(query);
    if (!matchesQuery) return false;
    if (activeFolder !== 'inbox') return true;
    const category = item.category || 'primary';
    return category === activeTab;
  });

  const handleSelectEmail = async (email: EmailMessage) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      await emailService.markAsRead(email.id, true);
      setEmails((prev) => prev.map((item) => (item.id === email.id ? { ...item, isRead: true } : item)));
    }
  };

  const handleToggleImportant = async (event: React.MouseEvent, email: EmailMessage) => {
    event.stopPropagation();
    const next = await emailService.toggleImportant(email.id);
    setEmails((prev) => prev.map((item) => (item.id === email.id ? { ...item, isImportant: next } : item)));
    if (selectedEmail?.id === email.id) setSelectedEmail({ ...selectedEmail, isImportant: next });
  };

  const handleDeleteEmail = async (id: string) => {
    await emailService.deleteEmail(id);
    toast.success('Email Deleted');
    if (selectedEmail?.id === id) setSelectedEmail(null);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    loadEmails();
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
          subject: composeSubject,
          body: composeBody,
          relatedCandidateId: selectedCandidateId,
          relatedCandidateName: candidates.find((c) => c.id === selectedCandidateId)?.fullName
        },
        user ? { id: user.id, name: user.name, email: user.email, role } : undefined
      );
      toast.success('Email Dispatched', `Message delivered to ${composeRecipient}`);
      setComposeOpen(false);
      setComposeRecipient('');
      setComposeSubject('');
      setComposeBody('');
      setSelectedCandidateId('');
      loadEmails();
    } catch (e: any) {
      setSendError(e.message || 'Failed to dispatch email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const folders: { id: GmailFolder; label: string; icon: any; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadInbox || inboxEmails.length },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'snoozed', label: 'Snoozed', icon: Clock },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: emails.filter((item) => item.folder === 'drafts').length || undefined }
  ];

  const tabs: { id: GmailTab; label: string; icon: any }[] = [
    { id: 'primary', label: 'Primary', icon: Inbox },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'updates', label: 'Updates', icon: Info }
  ];

  return (
    <div id="email-page" className="gmail-app h-[calc(100vh-6.5rem)] min-h-[640px] rounded-xl overflow-hidden border border-[#dadce0] bg-white text-[#202124] flex shadow-sm">
      <aside className="w-[220px] shrink-0 bg-[#f6f8fc] px-3 py-4 flex flex-col">
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="mb-4 inline-flex items-center gap-3 self-start rounded-2xl bg-[#c2e7ff] text-[#001d35] px-6 py-3.5 text-sm font-medium shadow-md hover:shadow-lg hover:bg-[#b3dfff]"
        >
          <Pencil className="w-4 h-4" />
          Compose
        </button>
        <nav className="space-y-0.5">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const active = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  setActiveFolder(folder.id);
                  setSelectedEmail(null);
                  setSelectedIds([]);
                }}
                className={`w-full flex items-center gap-4 px-4 py-2 rounded-r-full text-[13px] ${
                  active ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#e8eaed] font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count ? <span className={`${active ? 'font-bold' : 'font-medium'}`}>{folder.count}</span> : null}
              </button>
            );
          })}
          <button type="button" className="w-full flex items-center gap-4 px-4 py-2 rounded-r-full text-[13px] text-[#444746] hover:bg-[#e8eaed] font-medium">
            <ChevronDown className="w-4 h-4" />
            More
          </button>
        </nav>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col bg-white">
        <div className="px-4 py-3">
          <div className="max-w-3xl mx-auto relative">
            <Search className="w-5 h-5 text-[#5f6368] absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-full bg-[#eaf1fb] text-sm text-[#202124] placeholder:text-[#5f6368] outline-none focus:bg-white focus:shadow-md"
            />
          </div>
        </div>

        {selectedEmail ? (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 py-2 flex items-center gap-1 border-b border-[#e8eaed]">
              <button type="button" onClick={() => setSelectedEmail(null)} className="px-3 py-1.5 text-sm text-[#1a73e8] font-medium">
                Back
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]" title="Archive">
                <Archive className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => handleDeleteEmail(selectedEmail.id)} className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]" title="Reply">
                <Reply className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]" title="Forward">
                <Forward className="w-4 h-4" />
              </button>
            </div>
            <div className="px-8 py-5 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-normal text-[#1f1f1f] mb-5">{selectedEmail.subject}</h2>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="gmail-avatar w-10 h-10 rounded-full bg-[#1a73e8] text-white grid place-items-center font-semibold">
                    {selectedEmail.sender.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{selectedEmail.sender.name} <span className="font-normal text-[#5f6368]">&lt;{selectedEmail.sender.email}&gt;</span></div>
                    <div className="text-xs text-[#5f6368]">to {selectedEmail.recipients.join(', ')}</div>
                  </div>
                </div>
                <div className="text-xs text-[#5f6368]">{new Date(selectedEmail.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-sm leading-7 whitespace-pre-wrap text-[#202124]">{selectedEmail.body}</div>
            </div>
          </div>
        ) : (
          <>
            {activeFolder === 'inbox' && (
              <div className="flex border-b border-[#e8eaed]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 max-w-[220px] px-4 py-3 flex items-center gap-3 text-sm ${
                        active ? 'text-[#0b57d0] border-b-4 border-[#0b57d0] font-semibold' : 'text-[#444746] hover:bg-[#f6f8fc]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-10 text-center text-sm text-[#5f6368]">Loading messages...</div>
              ) : visibleEmails.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#5f6368]">No emails in this view.</div>
              ) : (
                visibleEmails.map((email) => {
                  const checked = selectedIds.includes(email.id);
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`group flex items-center gap-2 px-2 h-10 border-b border-[#f1f3f4] cursor-pointer hover:shadow-sm ${
                        email.isRead ? 'bg-white' : 'bg-[#f2f6fc] font-semibold'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() =>
                          setSelectedIds((prev) => (checked ? prev.filter((id) => id !== email.id) : [...prev, email.id]))
                        }
                        className="ml-2 accent-[#0b57d0]"
                      />
                      <button
                        type="button"
                        onClick={(event) => handleToggleImportant(event, email)}
                        className={email.isImportant ? 'text-[#f4b400]' : 'text-[#dadce0] hover:text-[#5f6368]'}
                      >
                        <Star className={`w-4 h-4 ${email.isImportant ? 'fill-current' : ''}`} />
                      </button>
                      <div className="w-[180px] shrink-0 truncate text-[13px]">
                        {activeFolder === 'sent' ? `To: ${email.recipients[0] || 'Unknown'}` : email.sender.name}
                      </div>
                      <div className="flex-1 min-w-0 truncate text-[13px]">
                        <span className={email.isRead ? 'text-[#202124] font-normal' : 'text-[#202124] font-semibold'}>{email.subject}</span>
                        <span className="text-[#5f6368] font-normal"> - {email.body.replace(/\s+/g, ' ').trim()}</span>
                      </div>
                      <div className="w-[72px] text-right text-xs text-[#5f6368] shrink-0 pr-3">{formatMailDate(email.timestamp)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </section>

      {composeOpen && (
        <div className="fixed bottom-4 right-8 z-50 w-[520px] bg-white border border-[#dadce0] rounded-t-xl shadow-2xl overflow-hidden text-[#202124]">
          <div className="gmail-compose-header px-4 py-2.5 bg-[#404040] text-white flex items-center justify-between">
            <h3 className="text-sm font-medium">New Message</h3>
            <button type="button" onClick={() => setComposeOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {sendError && <div className="px-4 py-2 text-xs text-rose-600 bg-rose-50">{sendError}</div>}
          <input
            type="email"
            placeholder="To"
            value={composeRecipient}
            onChange={(e) => setComposeRecipient(e.target.value)}
            className="w-full px-4 py-2 border-b border-[#e8eaed] text-sm outline-none"
          />
          <input
            type="text"
            placeholder="Subject"
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            className="w-full px-4 py-2 border-b border-[#e8eaed] text-sm outline-none"
          />
          <textarea
            rows={10}
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none resize-none"
          />
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className="gmail-send inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send'}
            </button>
            <button type="button" onClick={() => setComposeOpen(false)} className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
