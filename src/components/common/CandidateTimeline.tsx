import React from 'react';
import { Candidate } from '../../types';
import { WorkflowStepper, WorkflowStepItem } from './WorkflowStepper';

interface CandidateTimelineProps {
  candidate: Candidate;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (step: WorkflowStepItem) => void;
}

export const CandidateTimeline: React.FC<CandidateTimelineProps> = ({
  candidate,
  orientation = 'horizontal',
  onStepClick
}) => {
  // Compute dynamic steps based on candidate actual data across the 5 phases
  const steps: WorkflowStepItem[] = [
    {
      id: 'step-p1',
      phaseNumber: 1,
      phaseTitle: 'Sourcing & Parsing',
      stepTitle: (candidate.aiExtractedFields?.length ?? 0) > 0 ? 'AI Parsed Resume' : 'Candidate Added',
      status: 'completed',
      subtitle: `${candidate.skills?.length ?? 0} skills indexed`,
      date: new Date(candidate.createdAt).toLocaleDateString()
    },
    {
      id: 'step-p2',
      phaseNumber: 2,
      phaseTitle: 'Screening & Gating',
      stepTitle: candidate.managerApproval?.approved
        ? 'Profile Approved (Ceipal Ready)'
        : candidate.rtrAcknowledged
        ? 'RTR Acknowledged (Gate Passed)'
        : candidate.status === 'Screening_Completed'
        ? 'Call Done - Score & RTR Pending'
        : candidate.phase > 2
        ? 'Screening & Gate Passed'
        : 'Screening Scheduled',
      status:
        candidate.phase > 2 || candidate.status === 'Profile_Approved' || candidate.status === 'Ceipal_Submitted'
          ? 'completed'
          : candidate.status === 'Profile_Rejected'
          ? 'failed'
          : candidate.phase === 2
          ? 'current'
          : 'pending',
      subtitle: candidate.rtrAcknowledged
        ? 'RTR Authorized by Candidate'
        : 'RTR Candidate Gate Pending',
      date: candidate.rtrAcknowledgedAt ? new Date(candidate.rtrAcknowledgedAt).toLocaleDateString() : undefined
    },
    {
      id: 'step-p3',
      phaseNumber: 3,
      phaseTitle: 'AI Availability',
      stepTitle: candidate.bookedSlotId
        ? 'Interview Slot Confirmed'
        : candidate.status === 'Availability_Calling'
        ? 'AI Phone Call In Progress'
        : candidate.phase > 3
        ? 'Availability Confirmed'
        : 'Pending Profile Clearance',
      status:
        candidate.phase > 3 || candidate.bookedSlotId
          ? 'completed'
          : candidate.phase === 3
          ? 'current'
          : 'pending',
      subtitle: candidate.bookedSlotId ? 'Calendar synced & reminders logged' : 'AI voice call negotiation'
    },
    {
      id: 'step-p4',
      phaseNumber: 4,
      phaseTitle: 'AI Avatar Interview',
      stepTitle: candidate.round1ReportId
        ? 'AI Interview Report Ready'
        : candidate.status === 'Round1_Scheduled'
        ? 'Interview Dispatched & Ready'
        : candidate.phase > 4
        ? 'Round 1 Completed'
        : 'Match Scoring & Setup',
      status:
        candidate.phase > 4 || candidate.round1ReportId
          ? 'completed'
          : candidate.phase === 4
          ? 'current'
          : 'pending',
      subtitle: candidate.round1ReportId ? 'Proctored technical assessment scored' : 'Live avatar session link active'
    },
    {
      id: 'step-p5',
      phaseNumber: 5,
      phaseTitle: 'Decisions & Outcome',
      stepTitle: candidate.finalDecision
        ? `Final: ${candidate.finalDecision.status === 'hire' ? 'Offer Extended' : 'Ended'}`
        : candidate.round2Decision
        ? candidate.round2Decision.proceed
          ? 'Round 2 Human Assessment'
          : 'Process Ended'
        : 'Human Go/No-Go Gate',
      status: candidate.finalDecision
        ? candidate.finalDecision.status === 'hire'
          ? 'completed'
          : 'failed'
        : candidate.phase === 5
        ? 'current'
        : 'pending',
      subtitle: candidate.finalDecision
        ? `Decided by ${candidate.finalDecision.decidedBy} (${candidate.finalDecision.deciderRole})`
        : 'Human control points active'
    }
  ];

  return <WorkflowStepper steps={steps} orientation={orientation} onStepClick={onStepClick} />;
};
