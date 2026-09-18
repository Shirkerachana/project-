import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Bot,
  Video,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { AuditLogRecord, AuditSeverity, UserRole } from '../types';
import { auditService } from '../api/audit.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingState } from '../components/common/LoadingState';

export const AuditLogPage: React.FC = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditService.getAll();
      setLogs(data);
    } catch (e: any) {
      toast.error('Failed to load audit logs', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRole === 'ALL' || log.actor.role === selectedRole;
    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
    const matchesEntity = selectedEntityType === 'ALL' || log.entityType === selectedEntityType;

    return matchesSearch && matchesRole && matchesSeverity && matchesEntity;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Status', 'Severity', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.actor.name}"`,
      l.actor.role,
      `"${l.action}"`,
      l.entityType,
      l.status,
      l.severity,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `talentpulse_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit Log Exported', 'CSV downloaded successfully.');
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'Interview':
        return <Bot className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Meeting':
        return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case 'Candidate':
        return <User className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div id="audit-log-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Audit Log</h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              Immutable Trail
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise compliance and audit trail recording interview creations, AI scoring, evaluator panel decisions, and human authority enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={loadLogs}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="Recruiter">Recruiter</option>
            <option value="TeamManager">Team Manager</option>
            <option value="Evaluator">Evaluator</option>
            <option value="Admin">Admin / AI Engine</option>
            <option value="Candidate">Candidate</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          {/* Entity Filter */}
          <select
            value={selectedEntityType}
            onChange={(e) => setSelectedEntityType(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Entities</option>
            <option value="Interview">Interview</option>
            <option value="Meeting">Meeting</option>
            <option value="Email">Email</option>
            <option value="Decision">Decision</option>
            <option value="Evaluation">Evaluation</option>
          </select>

          {(selectedRole !== 'ALL' || selectedSeverity !== 'ALL' || selectedEntityType !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ALL');
                setSelectedSeverity('ALL');
                setSelectedEntityType('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-400 hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <LoadingState message="Loading audit trail..." />
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No audit records match the current filters.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-normal text-slate-300">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{log.actor.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.actor.role}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-indigo-300">{log.action}</span>
                    </td>

                    {/* Entity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getEntityIcon(log.entityType)}
                        <span className="text-slate-300 font-medium">{log.entityType}</span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.severity === 'critical'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                            : log.severity === 'warning'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>

                    {/* Details snippet */}
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {log.details}
                    </td>

                    {/* Inspect Link */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Audit Log Modal */}
      {selectedLog && (
        <div className="tp-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Audit Record Detail</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">RECORD ID</span>
                  <div className="font-mono text-slate-300 mt-0.5">{selectedLog.id}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">TIMESTAMP</span>
                  <div className="font-mono text-slate-300 mt-0.5">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">
                  Actor Information
                </span>
                <div className="font-bold text-white text-sm">{selectedLog.actor.name}</div>
                <div className="text-slate-400">
                  Role: <span className="text-indigo-400 font-semibold">{selectedLog.actor.role}</span> &bull; Email:{' '}
                  {selectedLog.actor.email}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                  Action & Target Entity
                </span>
                <div className="font-semibold text-white">{selectedLog.action}</div>
                {selectedLog.entityName && (
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Target: <strong className="text-slate-200">{selectedLog.entityName}</strong> ({selectedLog.entityType})
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                  Audit Details & Payload
                </span>
                <p className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
