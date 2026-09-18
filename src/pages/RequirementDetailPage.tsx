import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';
import { requirementsService } from '../api/requirements.service';
import { Requirement } from '../types';

export const RequirementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [req, setReq] = useState<Requirement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment edit state
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  const [assignedManager, setAssignedManager] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const r = await requirementsService.getById(id);
        if (r) {
          setReq(r);
          setSelectedRecruiters(r.assignedRecruiters || []);
          setAssignedManager(r.assignedTeamManager || 'Sarah Jenkins');
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) return <LoadingState message="Loading requirement details..." variant="spinner" />;
  if (!req) return <div className="p-8 text-center text-slate-400">Requirement not found.</div>;

  const handleToggleRecruiter = (name: string) => {
    if (selectedRecruiters.includes(name)) {
      setSelectedRecruiters(selectedRecruiters.filter((r) => r !== name));
    } else {
      setSelectedRecruiters([...selectedRecruiters, name]);
    }
  };

  const handleSaveAssignment = async () => {
    setIsSaving(true);
    try {
      const updated = await requirementsService.update(req.id, {
        assignedRecruiters: selectedRecruiters,
        assignedTeamManager: assignedManager,
        assignedTeamManagerId: assignedManager === 'Sarah Jenkins' ? 'user-manager-1' : assignedManager === 'Priya Kapoor' ? 'user-manager-2' : assignedManager === 'James Ortiz' ? 'user-manager-3' : '',
        status: (selectedRecruiters.length > 0 ? 'sourcing' : req.status) as any
      });
      setReq(updated);
      toast.success('Assignment Saved', `Requirement assigned to ${selectedRecruiters.length} recruiter(s). Status updated to ${updated.status}.`);
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const availableRecruiters = ['David Miller', 'Rachel Adams', 'Carlos Mendez'];

  return (
    <div id="requirement-detail-page" className="space-y-6">
      <PageHeader
        title={req.title}
        description={`Client: ${req.clientName} • Department: ${req.department} • Ref: ${req.id}`}
        breadcrumbs={[
          { label: 'Job Requirements', href: '/requirements' },
          { label: req.title }
        ]}
        badge={<StatusBadge status={req.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Spec */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Job Specification</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {req.description || 'No detailed scope provided. Sourcing based on required technical skill profile.'}
            </p>

            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Mandatory Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {req.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs font-medium text-indigo-300"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {req.niceToHaveSkills && req.niceToHaveSkills.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nice-to-Have Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {req.niceToHaveSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignment & Distribution (Team Manager human control) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Manager Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Distribute this requirement to recruiters on your team to begin sourcing and scheduling AI screening calls.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Show this job to Manager
              </label>
              <select
                value={assignedManager}
                onChange={(e) => setAssignedManager(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="Sarah Jenkins">Sarah Jenkins</option>
                <option value="Priya Kapoor">Priya Kapoor</option>
                <option value="James Ortiz">James Ortiz</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Assign Recruiter(s)
              </label>
              <div className="space-y-2">
                {availableRecruiters.map((recruiter) => {
                  const isChecked = selectedRecruiters.includes(recruiter);
                  return (
                    <label
                      key={recruiter}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-white font-semibold'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRecruiter(recruiter)}
                        className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{recruiter}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAssignment}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save & Distribute to Recruiters'}
            </button>
          </div>

          {/* Quick Snapshot Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Position Snapshot</div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Open Positions:</span>
              <span className="text-white font-semibold">{req.openPositions}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Experience Req:</span>
              <span className="text-white font-semibold">{req.experienceYears}+ years</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Budget:</span>
              <span className="text-emerald-400 font-semibold font-mono">{req.budget}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Created At:</span>
              <span className="text-slate-300">{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
