import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, Bot, Briefcase, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { formatRoleLabel } from '../config/roles';

export const LoginPage: React.FC = () => {
  const { loginAsRole, user, isAuthenticated } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Recruiter');
  const [email, setEmail] = useState('david.miller@talentpulse.internal');
  const [isLoading, setIsLoading] = useState(false);

  const roleProfiles: Record<UserRole, { title: string; desc: string; sampleEmail: string }> = {
    Recruiter: {
      title: 'Recruiter Workspace',
      desc: 'Add candidates with AI parsing, review screening calls, review RTR drafts, configure Round 1 AI interviews.',
      sampleEmail: 'david.miller@talentpulse.internal'
    },
    TeamManager: {
      title: 'Manager Workspace',
      desc: 'Review incoming client JDs, distribute to recruiters, and review candidate profiles.',
      sampleEmail: 'sarah.jenkins@talentpulse.internal'
    },
    CRM: {
      title: 'CRM Lead Workspace',
      desc: 'Intake client job requirements, set budgets and position targets, circulate internally.',
      sampleEmail: 'marcus.chen@talentpulse.internal'
    },
    Evaluator: {
      title: 'Evaluator / Tech Interviewer',
      desc: 'Conduct Round 2 human technical deep-dives, enter structured rubric scores and feedback.',
      sampleEmail: 'aris.thorne@techpartners.internal'
    },
    Admin: {
      title: 'System Administrator',
      desc: 'Configure master data, screening question bank, evaluation rubric weights, and evaluator calendar slots.',
      sampleEmail: 'elena.vance@talentpulse.internal'
    },
    Candidate: {
      title: 'Candidate Portal (Demo)',
      desc: 'Candidate interactions happen via phone, email, and the public interview link.',
      sampleEmail: 'alex.rivera@techworker.io'
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(roleProfiles[role].sampleEmail);
  };

  const handleDirectLoginAs = async (role: UserRole) => {
    setIsLoading(true);
    try {
      if (role === 'Candidate') {
        navigate('/interview/session-alex-rivera-9821');
        return;
      }
      setSelectedRole(role);
      const targetEmail = roleProfiles[role].sampleEmail;
      setEmail(targetEmail);
      const loggedUser = await loginAsRole(role, targetEmail);
      toast.success('Signed in successfully', `Entered workspace as ${loggedUser.name} (${formatRoleLabel(loggedUser.role)}).`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error('Authentication Error', err.message || 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (selectedRole === 'Candidate') {
        navigate('/interview/session-alex-rivera-9821');
        return;
      }
      const loggedUser = await loginAsRole(selectedRole, email);
      toast.success('Signed in successfully', `Entered workspace as ${loggedUser.name} (${formatRoleLabel(loggedUser.role)}).`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error('Authentication Error', err.message || 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Top bar theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-md active:scale-95"
        >
          {isBright ? (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Bright Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-950 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">TalentPulse AI</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            AI-assisted recruitment and interview platform with human-in-the-loop governance.
          </p>
        </div>

        {/* Existing Session Banner if user already authenticated */}
        {isAuthenticated && user && (
          <div className="mb-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span>Active session: </span>
                <strong className="text-white">{user.name}</strong> ({formatRoleLabel(user.role)})
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              Continue to Dashboard &rarr;
            </Link>
          </div>
        )}

        {/* Card */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Persona (Click to switch)
              </label>
              <span className="text-[11px] text-indigo-400">Instant Demo Access</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Recruiter', 'TeamManager', 'CRM', 'Evaluator', 'Admin'] as UserRole[]).map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/40 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs">{formatRoleLabel(r)}</div>
                    <div className="text-[10px] opacity-75 font-normal truncate mt-0.5">
                      {roleProfiles[r].title.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs text-slate-300">
            <span className="font-semibold text-indigo-300">{roleProfiles[selectedRole].title}: </span>
            {roleProfiles[selectedRole].desc}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Password / SSO Token
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : `Enter as ${selectedRole}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Candidate direct demo link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-500 block mb-2">Looking for candidate avatar interview test?</span>
            <button
              type="button"
              onClick={() => navigate('/interview/session-alex-rivera-9821')}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
            >
              <span>Launch Public Candidate AI Avatar Interview Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

