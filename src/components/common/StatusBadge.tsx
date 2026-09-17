import React from 'react';
import { CandidateWorkflowStage, RequirementStatus } from '../../types';

interface StatusBadgeProps {
  status: CandidateWorkflowStage | RequirementStatus | string;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  // Candidate Stages
  Sourced: { label: 'Sourced & Parsed', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300 font-semibold', border: 'border-blue-200 dark:border-blue-500/30' },
  Screening_Scheduled: { label: 'Screening Scheduled', bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300 font-semibold', border: 'border-indigo-200 dark:border-indigo-500/30' },
  Screening_Completed: { label: 'Screening Done', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-200 dark:border-amber-500/30' },
  RTR_Pending: { label: 'RTR Pending', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-200 dark:border-amber-500/40' },
  RTR_Acknowledged: { label: 'RTR Confirmed', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Profile_Pending_Approval: { label: 'Manager Review Pending', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-200 dark:border-amber-500/30' },
  Profile_Approved: { label: 'Profile Approved', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Profile_Rejected: { label: 'Profile Rejected', bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-800 dark:text-rose-300 font-semibold', border: 'border-rose-200 dark:border-rose-500/30' },
  Ceipal_Submitted: { label: 'Ceipal Submitted', bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-300 font-semibold', border: 'border-cyan-200 dark:border-cyan-500/30' },
  Availability_Calling: { label: 'AI Availability Calling', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300 font-semibold', border: 'border-purple-200 dark:border-purple-500/30' },
  Slot_Booked: { label: 'Slot Booked', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Round1_Setup_Pending: { label: 'Round 1 Setup Pending', bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300 font-semibold', border: 'border-indigo-200 dark:border-indigo-500/30' },
  Round1_Scheduled: { label: 'AI Interview Scheduled', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300 font-semibold', border: 'border-purple-200 dark:border-purple-500/30' },
  Round1_Completed: { label: 'AI Report Ready', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Round2_Pending_Decision: { label: 'Round 2 Gate Pending', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-200 dark:border-amber-500/40' },
  Round2_Scheduled: { label: 'Human Round 2 Scheduled', bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-800 dark:text-sky-300 font-semibold', border: 'border-sky-200 dark:border-sky-500/30' },
  Round2_Completed: { label: 'Round 2 Evaluated', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Final_Decision_Pending: { label: 'Final Decision Gate', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300 font-semibold', border: 'border-amber-200 dark:border-amber-500/40' },
  Offer_Extended: { label: 'Offer Extended (Hire)', bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/40' },
  Rejected: { label: 'Process Ended', bg: 'bg-rose-50 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-300 font-semibold', border: 'border-rose-200 dark:border-rose-500/40' },

  // Requirement Stages
  received: { label: 'Intake Received', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300 font-semibold', border: 'border-slate-300 dark:border-slate-600' },
  circulated: { label: 'Circulated', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300 font-semibold', border: 'border-blue-200 dark:border-blue-500/30' },
  assigned: { label: 'Assigned', bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300 font-semibold', border: 'border-indigo-200 dark:border-indigo-500/30' },
  sourcing: { label: 'Active Sourcing', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300 font-semibold', border: 'border-emerald-200 dark:border-emerald-500/30' },
  filled: { label: 'Positions Filled', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300 font-semibold', border: 'border-purple-200 dark:border-purple-500/30' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const config = STATUS_CONFIGS[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700'
  };

  const displayText = label || config.label;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm font-medium';

  return (
    <span
      id={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{displayText}</span>
    </span>
  );
};
