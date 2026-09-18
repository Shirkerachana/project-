import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  Mail,
  Bot,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { AIBadge } from '../components/common/AIBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Modal } from '../components/common/Modal';
import { CandidateAddForm } from './CandidateAddPage';
import { candidatesService } from '../api/candidates.service';
import { screeningService } from '../api/screening.service';
import { Candidate, CandidateWorkflowStage } from '../types';

export const CandidatesListPage: React.FC = () => {
  const { role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await candidatesService.getAll();
      setCandidates(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectToggle = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter((item) => item !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedCandidateIds(ids);
  };

  const handleDispatchBatchScreening = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsDispatchingBatch(true);
    try {
      const createdCalls = await screeningService.bookBatchCalls(selectedCandidateIds);
      toast.success(
        'Batch Screening Scheduled',
        `Dispatched AI screening calls for ${createdCalls.length} candidate(s). Transcripts and RTR drafts will be generated upon call completion.`
      );
      setIsBatchModalOpen(false);
      setSelectedCandidateIds([]);
      await loadCandidates();
      navigate('/screening/calls');
    } catch (err: any) {
      toast.error('Batch Scheduling Error', err.message);
    } finally {
      setIsDispatchingBatch(false);
    }
  };

  // Filter candidates
  const filtered = candidates.filter((c) => {
    if (stageFilter === 'all') return true;
    if (stageFilter === 'phase1') return c.phase === 1;
    if (stageFilter === 'phase2') return c.phase === 2;
    if (stageFilter === 'rtr_pending') return c.status === 'RTR_Pending';
    if (stageFilter === 'approvals') return c.status === 'Profile_Pending_Approval';
    if (stageFilter === 'phase4') return c.phase === 4 || c.round1ReportId;
    if (stageFilter === 'phase5') return c.phase === 5;
    return true;
  });

  const columns: Column<Candidate>[] = [
    {
      key: 'fullName',
      header: 'Candidate Name & Role',
      sortable: true,
      render: (c) => (
        <div>
          <Link
            to={`/candidates/${c.id}`}
            className="font-bold text-white hover:text-indigo-400 transition-colors text-sm flex items-center gap-1.5"
          >
            <span>{c.fullName}</span>
            {(c.aiExtractedFields?.length ?? 0) > 0 && <AIBadge label="AI Parsed" size="sm" />}
          </Link>
          <div className="text-xs text-slate-400 mt-0.5">
            {c.email} &bull; {c.phone}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium mt-0.5">
            Target JD: {c.requirementTitle}
          </div>
        </div>
      )
    },
    {
      key: 'skills',
      header: 'Skills & Experience',
      render: (c) => {
        const skillsList = Array.isArray(c.skills) ? c.skills : [];
        return (
          <div className="text-xs space-y-1">
            <div className="text-slate-300 font-medium">{c.experienceYears} Years Exp &bull; {c.location}</div>
            <div className="flex flex-wrap gap-1">
              {skillsList.slice(0, 3).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                  {s}
                </span>
              ))}
              {skillsList.length > 3 && (
                <span className="text-[10px] text-slate-500">+{skillsList.length - 3}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Workflow Stage',
      sortable: true,
      render: (c) => (
        <div className="space-y-1">
          <StatusBadge status={c.status} />
          <div className="text-[11px] text-slate-500 font-mono">
            Phase {c.phase} of 5
          </div>
        </div>
      )
    },
    {
      key: 'scores',
      header: 'AI Scores & Gates',
      render: (c) => (
        <div className="text-xs space-y-0.5">
          {c.screeningScore ? (
            <div className="text-slate-300">
              Screen: <strong className="text-emerald-400 font-mono">{c.screeningScore}/100</strong>
            </div>
          ) : null}

          {c.round1Score ? (
            <div className="text-slate-300">
              AI R1: <strong className="text-indigo-400 font-mono">{c.round1Score}/100</strong>
            </div>
          ) : null}

          <div className="text-[11px]">
            {c.rtrAcknowledged ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> RTR Signed
              </span>
            ) : c.rtrEmailId ? (
              <span className="text-amber-400 font-semibold">RTR Pending</span>
            ) : (
              <span className="text-slate-500">RTR Uninitiated</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          {c.status === 'Sourced' && (
            <button
              type="button"
              onClick={() => {
                setSelectedCandidateIds([c.id]);
                setIsBatchModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Book Screening</span>
            </button>
          )}

          {c.status === 'Ceipal_Submitted' && (
            <Link
              to={`/scheduling?candidateId=${c.id}`}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>AI Schedule</span>
            </Link>
          )}

          {(c.status === 'Slot_Booked' || c.status === 'Round1_Setup_Pending') && (
            <Link
              to={`/interviews/round1/${c.id}/setup`}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>R1 Setup</span>
            </Link>
          )}

          {c.round1ReportId && (
            <Link
              to={`/interviews/round1/${c.id}/report`}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Report</span>
            </Link>
          )}

          <Link
            to={`/candidates/${c.id}`}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Profile
          </Link>
        </div>
      )
    }
  ];

  return (
    <div id="candidates-list-page" className="space-y-6">
      <PageHeader
        title="Candidate Talent Pool & Workflow Directory"
        description="Search, filter, and track candidates across the 5 automated & human-gated phases."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        }
      />

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">
          Filter Stage:
        </span>
        {[
          { key: 'all', label: 'All Candidates' },
          { key: 'phase1', label: 'Phase 1: Sourced' },
          { key: 'phase2', label: 'Phase 2: Screening & RTR' },
          { key: 'rtr_pending', label: 'RTR Action Required' },
          { key: 'approvals', label: 'Profile Approval Queue' },
          { key: 'phase4', label: 'Phase 4: Round 1 AI' },
          { key: 'phase5', label: 'Phase 5: Final Decisions' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStageFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              stageFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Action Bar when items selected */}
      {selectedCandidateIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-white">
                {selectedCandidateIds.length} candidate(s) selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedCandidateIds([])}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Book Batch AI Screening Calls ({selectedCandidateIds.length})</span>
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        searchPlaceholder="Search candidates by name, email, skills..."
        searchFilter={(c, q) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.requirementTitle.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
        }
        selectedIds={selectedCandidateIds}
        onSelectToggle={handleSelectToggle}
        onSelectAll={handleSelectAll}
        emptyTitle="No candidates in this stage"
        emptyDescription="Add a new candidate using AI resume extraction."
      />

      {/* Batch Booking Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleDispatchBatchScreening}
        title="Confirm Batch AI Screening Calls"
        message={`You are about to initiate AI automated voice screening calls for ${selectedCandidateIds.length} candidate(s). The AI agent will dial each candidate, ask configured screening questions, record audio, generate real-time transcripts, and draft individual RTR authorization emails.`}
        confirmLabel={`Dispatch ${selectedCandidateIds.length} AI Call(s)`}
        isLoading={isDispatchingBatch}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Candidate"
        subtitle="Fill candidate details here. Attributes can be added or removed."
        maxWidth="4xl"
      >
        <CandidateAddForm
          compact
          onCancel={() => setIsAddModalOpen(false)}
          onSaved={() => {
            setIsAddModalOpen(false);
            loadCandidates();
          }}
        />
      </Modal>
    </div>
  );
};
