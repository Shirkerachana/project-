import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search, Briefcase, MapPin, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { requirementsService } from '../api/requirements.service';
import { authService } from '../api/auth.service';
import { Requirement, RequirementStatus, User } from '../types';

export const RequirementsListPage: React.FC = () => {
  const { role, user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRequirements();
    authService.getAllUsers().then((users) => setManagers(users.filter((u) => u.role === 'TeamManager')));
  }, []);

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const data = await requirementsService.getAll();
      setRequirements(data);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleRequirements =
    role === 'TeamManager'
      ? requirements.filter(
          (r) => r.assignedTeamManagerId === user?.id || r.assignedTeamManager === user?.name
        )
      : requirements;

  const filtered = statusFilter === 'all'
    ? visibleRequirements
    : visibleRequirements.filter((r) => r.status === statusFilter);

  const handleAssignManager = async (reqId: string, managerId: string) => {
    const manager = managers.find((m) => m.id === managerId);
    await requirementsService.update(reqId, {
      assignedTeamManagerId: managerId,
      assignedTeamManager: manager?.name || ''
    });
    await loadRequirements();
  };

  const columns: Column<Requirement>[] = [
    {
      key: 'title',
      header: 'Job Title & Client',
      sortable: true,
      render: (req) => (
        <div>
          <Link
            to={`/requirements/${req.id}`}
            className="font-bold text-white hover:text-indigo-400 transition-colors text-sm"
          >
            {req.title}
          </Link>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="text-slate-300 font-medium">{req.clientName}</span>
            <span>&bull;</span>
            <span>{req.department}</span>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location & Positions',
      render: (req) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{req.location}</span>
          </div>
          <div className="text-slate-400">
            {req.openPositions} open position(s) &bull; {req.experienceYears}+ yrs exp
          </div>
        </div>
      )
    },
    {
      key: 'budget',
      header: 'Budget / Rate',
      render: (req) => (
        <div className="text-xs font-mono font-medium text-emerald-400">
          {req.budget}
        </div>
      )
    },
    {
      key: 'assignedRecruiters',
      header: 'Assigned Team',
      render: (req) => {
        const recruiters = req.assignedRecruiters || req.assignedRecruiterNames || [];
        return (
          <div className="text-xs">
            {recruiters.length > 0 ? (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{recruiters.join(', ')}</span>
              </div>
            ) : (
              <span className="text-amber-400 italic">Unassigned</span>
            )}
            {req.assignedTeamManager ? (
              <div className="text-[11px] text-slate-500">Mgr: {req.assignedTeamManager}</div>
            ) : (
              <div className="text-[11px] text-amber-400">No manager assigned</div>
            )}
            {(role === 'CRM' || role === 'Admin') && (
              <select
                value={req.assignedTeamManagerId || managers.find((m) => m.name === req.assignedTeamManager)?.id || ''}
                onChange={(e) => handleAssignManager(req.id, e.target.value)}
                className="mt-1 w-full max-w-[180px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200"
              >
                <option value="">Assign manager...</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (req) => <StatusBadge status={req.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (req) => (
        <Link
          to={`/requirements/${req.id}`}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          {role === 'TeamManager' ? 'Assign & Circulate' : 'View Details'}
        </Link>
      )
    }
  ];

  return (
    <div id="requirements-list-page" className="space-y-6">
      <PageHeader
        title="Job Requirements Intake & Circulation"
        description="Phase 1: Direct client job descriptions, team assignment, and active sourcing status."
        actions={
          (role === 'CRM' || role === 'Admin') && (
            <Link
              to="/requirements/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Intake New Job Requirement</span>
            </Link>
          )
        }
      />

      {/* Filter Component */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status:</span>
        {['all', 'received', 'circulated', 'assigned', 'sourcing', 'filled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st === 'all' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        searchPlaceholder="Search by title, client, or location..."
        searchFilter={(r, q) =>
          r.title.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
        }
        emptyTitle="No requirements found"
        emptyDescription="Start by intaking a new requirement from a client."
      />
    </div>
  );
};
