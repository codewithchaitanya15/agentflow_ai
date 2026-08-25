import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, THEMES } from '../store/themeStore';
import {
  User,
  Shield,
  Key,
  Database,
  Bell,
  Cpu,
  Lock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Server,
  Palette
} from 'lucide-react';

function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [notificationMuted, setNotificationMuted] = useState(false);
  const [autoRetryFailed, setAutoRetryFailed] = useState(true);

  return (
    <ProtectedRoute>
      <AppShell title="Platform Settings & Diagnostics">
        <div className="max-w-4xl space-y-6">
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-surface/80 border border-border shadow-glass space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-border pb-3">
              <User className="w-4 h-4 text-brand-400" />
              <span>Operator Profile</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-glow-brand shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{user?.name || 'Operator'}</h3>
                <p className="text-xs text-slate-400">{user?.email || 'operator@agentflow.ai'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono uppercase bg-brand-500/15 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">
                    Role: {user?.role || 'operator'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Status: Verified Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System & Encryption Health Checks */}
          <div className="p-6 rounded-2xl bg-surface/80 border border-border shadow-glass space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-border pb-3">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>System &amp; Security Health Diagnostics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AES-256-GCM Encryption Key</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Application-level encryption active &amp; healthy.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    CREDENTIAL_ENCRYPTION_KEY: Set
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">5-Agent Engine &amp; LangGraph</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Planner, Execution, Validation, Recovery, Monitoring.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                    Orchestrator: Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Database Layer</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    MongoDB with auto in-memory store support.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Storage: Connected
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-border flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Model Router</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    OpenRouter &bull; Gemini &bull; Deterministic Fallback.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    Fallback: Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Theme Selection */}
          <div className="p-6 rounded-2xl bg-surface/80 border border-border shadow-glass space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-border pb-3">
              <Palette className="w-4 h-4 text-brand-400" />
              <span>Visual Interface Theme</span>
            </div>

            <p className="text-xs text-slate-400">
              Customize the look and feel of the operations console. Choose from dark cosmic modes, neon high-contrast, or clean daylight.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {THEMES.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow-brand ring-1 ring-brand-500'
                        : 'border-border bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: t.accent }}
                        />
                        {isSelected && (
                          <span className="text-[10px] font-mono text-brand-400 font-bold bg-brand-500/20 px-1.5 py-0.2 rounded border border-brand-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="p-6 rounded-2xl bg-surface/80 border border-border shadow-glass space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-border pb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Operator Execution Preferences</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Automatic Failure Recovery &amp; Backoff
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Allow Recovery Agent to automatically retry transient network and rate-limit errors
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRetryFailed}
                  onChange={(e) => setAutoRetryFailed(e.target.checked)}
                  className="w-4 h-4 accent-brand-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-border cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Mute Non-Critical Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Only receive escalation alerts and fatal error warnings in the notification drawer
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationMuted}
                  onChange={(e) => setNotificationMuted(e.target.checked)}
                  className="w-4 h-4 accent-brand-500"
                />
              </label>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Console</span>
            </button>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

export default dynamic(() => Promise.resolve(SettingsPage), { ssr: false });
