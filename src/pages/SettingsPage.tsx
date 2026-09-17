import React, { useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  Bell,
  Cpu,
  Shield,
  CheckCircle2,
  Save,
  Key,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'integrations' | 'account'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || 'David Miller');
  const [email, setEmail] = useState(user?.email || 'david.miller@talentpulse.internal');
  const [title, setTitle] = useState(user?.title || 'Senior Technical Talent Partner');
  const [department, setDepartment] = useState(user?.department || 'Talent Acquisition');

  // Preferences
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // Notifications
  const [emailOnBooking, setEmailOnBooking] = useState(true);
  const [emailOnCompletion, setEmailOnCompletion] = useState(true);
  const [proctorAlerts, setProctorAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleSave = () => {
    toast.success('Settings Saved', 'Your system preferences have been updated.');
  };

  return (
    <div id="settings-page" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Preferences</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Configure profile details, interview notification rules, integrations, and security policies.
        </p>
      </div>

      {/* Main Settings Layout: Left Nav + Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Persona</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferences & Display</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Integrations & Telephony</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Account</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="md:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Profile Details</h3>
                <p className="text-xs text-slate-400">Your identity and organizational role.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Current Active Role: </span>
                <strong className="text-indigo-400 font-semibold">{role}</strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Role is managed via system access permissions or the top-bar role persona switcher.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Display & Timezone Preferences</h3>
                <p className="text-xs text-slate-400">Configure your local display settings and theme.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Theme Mode */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Theme Mode</span>
                    <span className="text-[11px] text-slate-400">
                      Toggle between dark high-contrast mode and bright daylight mode.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    {isBright ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span>{isBright ? 'Switch to Dark' : 'Switch to Bright'}</span>
                  </button>
                </div>

                {/* Timezone */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Display Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="America/New_York (EST)">Eastern Time (US & Canada) - EST</option>
                    <option value="America/Chicago (CST)">Central Time (US & Canada) - CST</option>
                    <option value="America/Denver (MST)">Mountain Time (US & Canada) - MST</option>
                    <option value="America/Los_Angeles (PST)">Pacific Time (US & Canada) - PST</option>
                    <option value="Europe/London (GMT)">London - GMT</option>
                    <option value="Asia/Kolkata (IST)">India Standard Time - IST</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Email & Notification Rules</h3>
                <p className="text-xs text-slate-400">Control automated alerts for AI interviews and evaluations.</p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Interview Slot Booked Alert</span>
                    <span className="text-[11px] text-slate-400">
                      Notify recruiter immediately when a candidate selects a slot.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailOnBooking}
                    onChange={(e) => setEmailOnBooking(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">AI Interview Completed Notification</span>
                    <span className="text-[11px] text-slate-400">
                      Email recruiter when Round 1 AI dossier & score are ready.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailOnCompletion}
                    onChange={(e) => setEmailOnCompletion(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Proctoring Anomaly Warnings</span>
                    <span className="text-[11px] text-slate-400">
                      Flag critical anti-cheating events (multiple faces, window tab loss) in real-time.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={proctorAlerts}
                    onChange={(e) => setProctorAlerts(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">System Integrations</h3>
                <p className="text-xs text-slate-400">Status of connected communication and calendar services.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Google / Outlook Calendar Two-Way Sync</span>
                    <span className="text-[11px] text-slate-400">Synchronizes interview meetings to personal calendars.</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">WebRTC Video & AI Avatar Streaming Cluster</span>
                    <span className="text-[11px] text-slate-400">Sub-80ms encrypted media server for live candidate sessions.</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Operational (v3.4)</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Whisper Real-Time Speech Transcription (STT)</span>
                    <span className="text-[11px] text-slate-400">Multi-lingual technical vocabulary speech-to-text pipeline.</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Security & Access Management</h3>
                <p className="text-xs text-slate-400">Manage credentials and authentication compliance.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] text-slate-400">Required for internal recruiter and evaluator access.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                    ENFORCED
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Candidate interview links are secured via one-time cryptographic session tokens and do not require user account logins.
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-950"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
