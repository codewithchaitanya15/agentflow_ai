import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../lib/api';
import { getAgentColor, getStatusBadgeClasses, formatTimeAgo } from '../lib/utils';
import {
  Sparkles,
  Plus,
  ArrowRight,
  GitBranch,
  PlayCircle,
  Clock,
  Activity,
  Layers,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/workflows/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell
        title="Operations Overview"
        actionButton={
          <Link
            href="/workflows/builder"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-semibold transition shadow-glow-brand"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </Link>
        }
      >
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-mono">Aggregating telemetry & metrics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Metric Grid */}
            <MetricGrid metrics={data?.metrics} />

            {/* Quick Action Hero Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-surface to-cyan-950/30 border border-brand-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" /> AI Automation Builder
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Design complex workflows with natural language
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Provide your prompt to generate DAG graph nodes, configure Gmail &amp; Slack connectors, and trigger autonomous execution.
                </p>
              </div>

              <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto">
                <Link
                  href="/workflows/builder"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition shadow-glow-brand"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Prompt Builder</span>
                </Link>
                <Link
                  href="/workflows"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border"
                >
                  <span>Manual Canvas</span>
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2-Column Split: Recent Workflows & AI Agent Reasoning Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Workflows */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">Recent Workflows</h3>
                  </div>

                  <Link
                    href="/workflows"
                    className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    View all ({data?.metrics?.totalWorkflows || 0}) <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="bg-surface/80 border border-border rounded-2xl divide-y divide-border/60 overflow-hidden shadow-glass">
                  {(!data?.recentWorkflows || data.recentWorkflows.length === 0) ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No workflows found. Launch the AI Builder to create one!
                    </div>
                  ) : (
                    data.recentWorkflows.map((wf) => (
                      <div
                        key={wf._id}
                        className="p-4 hover:bg-slate-800/40 transition flex items-center justify-between gap-4 group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/workflows/${wf._id}`}
                              className="text-sm font-semibold text-white group-hover:text-brand-400 transition truncate"
                            >
                              {wf.name}
                            </Link>
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.2 rounded-full border ${getStatusBadgeClasses(
                                wf.status
                              )}`}
                            >
                              {wf.status}
                            </span>
                            {wf.aiGenerated && (
                              <span className="text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 rounded">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {wf.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                            <span>{wf.nodes?.length || 0} nodes</span>
                            <span>&bull;</span>
                            <span>v{wf.version || 1}</span>
                            <span>&bull;</span>
                            <span>{formatTimeAgo(wf.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/workflows/${wf._id}`}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-border transition text-xs font-medium"
                          >
                            Canvas
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Live AI Agent Activity Stream */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">Live Agent Reasoning</h3>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Streaming
                  </span>
                </div>

                <div className="bg-surface/80 border border-border rounded-2xl p-3 shadow-glass space-y-2 max-h-[420px] overflow-y-auto">
                  {(!data?.recentAgentActivity || data.recentAgentActivity.length === 0) ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No agent logs recorded yet. Run a workflow to view live events!
                    </div>
                  ) : (
                    data.recentAgentActivity.map((log) => {
                      const color = getAgentColor(log.agent);
                      return (
                        <div
                          key={log._id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-border/80 text-xs space-y-1 hover:border-slate-600 transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${color.bg} ${color.text} ${color.border}`}
                            >
                              {log.agent}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {formatTimeAgo(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-300 font-normal leading-relaxed">
                            {log.message}
                          </p>
                          {log.execution && (
                            <Link
                              href={`/executions/${log.execution}`}
                              className="text-[10px] font-mono text-brand-400 hover:underline block pt-1"
                            >
                              Execution #{log.execution.slice(-6)} &rarr;
                            </Link>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
