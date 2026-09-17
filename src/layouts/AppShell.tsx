import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  Shield,
  Briefcase,
  Layers,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NAVIGATION_ITEMS } from '../config/navigation';
import { UserRole } from '../types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, role, loginAsRole, logout } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Filter navigation items by active user role
  const allowedNavItems = NAVIGATION_ITEMS.filter((item) => item.roles.includes(role));

  const allRoles: UserRole[] = ['Recruiter', 'TeamManager', 'CRM', 'Evaluator', 'HR', 'Admin'];

  const handleSwitchRole = async (newRole: UserRole) => {
    setRoleMenuOpen(false);
    await loginAsRole(newRole);
    navigate('/dashboard');
  };

  return (
    <div id="app-shell" className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-950">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                TalentPulse
              </span>
              <span className="text-[10px] font-mono block text-indigo-400 font-semibold tracking-wider uppercase">
                AI Recruitment
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Phase Workflow Indicator Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 flex items-center justify-between">
            <span>5-Phase AI Architecture</span>
            <span className="text-indigo-400 font-mono">End-to-End</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-[9px] font-semibold text-center text-slate-400">
            <span title="Phase 1: JD Intake & Sourcing" className="py-0.5 rounded bg-slate-800 text-indigo-300">P1</span>
            <span title="Phase 2: Screening & RTR Gate" className="py-0.5 rounded bg-slate-800 text-indigo-300">P2</span>
            <span title="Phase 3: AI Availability" className="py-0.5 rounded bg-slate-800 text-indigo-300">P3</span>
            <span title="Phase 4: AI Avatar Technical" className="py-0.5 rounded bg-slate-800 text-indigo-300">P4</span>
            <span title="Phase 5: Human Decision Gate" className="py-0.5 rounded bg-slate-800 text-indigo-300">P5</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Candidate Live Demo Link in Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              {isBright ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="font-semibold">{isBright ? 'Dark Theme' : 'Bright Mode'}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{isBright ? 'On' : 'Active'}</span>
          </button>

          <Link
            to="/interview/session-alex-rivera-9821"
            className="flex items-center justify-between p-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">Candidate Avatar View</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block text-xs text-slate-400">
              Active Context: <span className="font-semibold text-slate-200">{role} Workspace</span>
            </div>
          </div>

          {/* Role Switcher, Bright/Dark Mode & User Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Bright / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95"
            >
              {isBright ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Bright</span>
                </>
              )}
            </button>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Role: <strong className="text-indigo-300">{role}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Switch Test Persona
                  </div>
                  {allRoles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSwitchRole(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        role === r ? 'font-bold text-indigo-400 bg-slate-800/40' : 'text-slate-300'
                      }`}
                    >
                      <span>{r}</span>
                      {role === r && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current User Card */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-semibold text-white truncate max-w-[120px]">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{user?.title || role}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Routed Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
