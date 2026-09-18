import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, ArrowLeft, Plus, X, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { requirementsService } from '../api/requirements.service';
import { configService } from '../api/config.service';
import { authService } from '../api/auth.service';
import { MasterData, User } from '../types';

export const RequirementIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [managers, setManagers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote (US/Canada)');
  const [openPositions, setOpenPositions] = useState<number>(1);
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [budget, setBudget] = useState('$130,000 - $155,000 / year');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTeamManagerId, setAssignedTeamManagerId] = useState('');

  useEffect(() => {
    configService.getMasterData().then((data) => {
      setMasterData(data);
    });
    authService.getAllUsers().then((users) => {
      const teamManagers = users.filter((u) => u.role === 'TeamManager');
      setManagers(teamManagers);
      if (teamManagers[0]) setAssignedTeamManagerId(teamManagers[0].id);
    });
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) {
      toast.error('Missing fields', 'Title and Client Name are required.');
      return;
    }

    if (!assignedTeamManagerId) {
      toast.error('Manager required', 'Select which Manager should see this job.');
      return;
    }

    const selectedManager = managers.find((m) => m.id === assignedTeamManagerId);

    setIsSubmitting(true);
    try {
      const created = await requirementsService.create({
        title,
        clientName,
        department,
        location,
        openPositions: Number(openPositions),
        positions: Number(openPositions),
        experienceYears: Number(experienceYears),
        budget,
        description,
        requiredSkills,
        niceToHaveSkills: ['GraphQL', 'AWS', 'Docker'],
        assignedRecruiters: [],
        assignedTeamManager: selectedManager?.name || '',
        assignedTeamManagerId: selectedManager?.id || '',
        createdBy: user?.name || 'Marcus Chen (CRM)',
        status: 'circulated',
        priority: 'High'
      });

      toast.success('Requirement Created', `${created.title} has been logged and sent for circulation.`);
      navigate('/requirements');
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'Could not create requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="requirement-intake-page" className="space-y-6">
      <PageHeader
        title="New Client Job Requirement (JD Intake)"
        description="Phase 1: Enter incoming client role requirements. Dynamic dropdowns driven by master data configuration."
        breadcrumbs={[
          { label: 'Job Requirements', href: '/requirements' },
          { label: 'New Requirement Intake' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Core Role & Client Details</span>
            <span className="text-xs font-normal text-slate-400">Intake Owner: {user?.name} (CRM)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Client Organization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme FinTech Corp"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {masterData?.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )) || <option>Engineering</option>}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {masterData?.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                )) || <option>Remote (US/Canada)</option>}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Open Positions</label>
              <input
                type="number"
                min={1}
                max={50}
                value={openPositions}
                onChange={(e) => setOpenPositions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Minimum Experience (Years)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Client Target Budget / Hourly Bill Rate
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $140,000 - $160,000 or $75/hr C2C"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Required Technical Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 font-medium"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add another required skill..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Job Description (JD Text / Scope)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write the client job description details, responsibilities, and qualifications..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Show this job to Manager <span className="text-rose-400">*</span>
            </label>
            <select
              value={assignedTeamManagerId}
              onChange={(e) => setAssignedTeamManagerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">Select a manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} — {manager.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              After the job is generated, only the selected manager will see this requirement in their workspace.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              CRM Notes / Special Client Conditions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Strict US citizen or Green Card requirement for defense clearance."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/requirements')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Requirement...' : 'Generate Job & Assign Manager'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
