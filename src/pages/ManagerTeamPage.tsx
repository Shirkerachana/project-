import React, { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { candidatesService } from '../api/candidates.service';
import { Candidate } from '../types';

const TEAM_MEMBERS = [
  { name: 'David Miller', email: 'david.miller@talentpulse.internal', title: 'Senior Technical Talent Partner' },
  { name: 'Rachel Adams', email: 'rachel.adams@talentpulse.internal', title: 'Technical Recruiter' },
  { name: 'Carlos Mendez', email: 'carlos.mendez@talentpulse.internal', title: 'Sourcing Specialist' }
];

export const ManagerTeamPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    candidatesService
      .getAll()
      .then(setCandidates)
      .finally(() => setIsLoading(false));
  }, []);

  const rows = useMemo(() => {
    return TEAM_MEMBERS.map((member, index) => ({
      ...member,
      candidates: candidates.filter((candidate, candidateIndex) => {
        if (candidate.recruiterName) return candidate.recruiterName === member.name;
        return candidateIndex % TEAM_MEMBERS.length === index;
      })
    }));
  }, [candidates]);

  if (isLoading) return <LoadingState message="Loading team..." variant="spinner" />;

  return (
    <div id="manager-team-page" className="space-y-6">
      <PageHeader
        title="My Team"
        description="Team members and the candidates currently assigned to them."
      />

      <div className="space-y-4">
        {rows.map((member) => (
          <div key={member.email} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 grid place-items-center text-sm font-bold text-indigo-300">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{member.name}</div>
                  <div className="text-xs text-slate-400">{member.title}</div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">{member.candidates.length} candidate(s)</div>
            </div>

            {member.candidates.length === 0 ? (
              <div className="text-xs text-slate-500">No candidates assigned.</div>
            ) : (
              <div className="divide-y divide-slate-800/70">
                {member.candidates.map((candidate) => (
                  <div key={candidate.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{candidate.fullName}</div>
                      <div className="text-xs text-slate-400">{candidate.requirementTitle}</div>
                    </div>
                    <StatusBadge status={candidate.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
