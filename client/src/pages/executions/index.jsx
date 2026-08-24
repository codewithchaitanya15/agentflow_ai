import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../lib/api';
import { getStatusBadgeClasses, formatDate, formatTimeAgo } from '../../lib/utils';
import {
  PlayCircle,
  Clock,
  RotateCw,
  Search,
  ChevronRight,
  Loader2,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/executions', {
        params: { status: statusFilter }
      });
      setExecutions(response.data || []);
    } catch (err) {
      console.error('Failed to load executions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000); // Polling update
    return () => clearInterval(interval);
  }, [statusFilter]);

  return (
    <ProtectedRoute>
      <AppShell
        title="Execution Run History"
        actionButton={
          <button
            onClick={fetchExecutions}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh runs"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        }
      >
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 bg-surface/80 border border-border rounded-2xl p-3 shadow-glass flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'COMPLETED', 'RUNNING', 'FAILED', 'PAUSED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase transition ${
                    statusFilter === s
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {s === 'all' ? 'All Statuses' : s}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Total Runs: <strong className="text-white">{executions.length}</strong>
            </span>
          </div>

          {/* Executions Table */}
          {isLoading && executions.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-mono">Retrieving agent execution logs...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="p-12 text-center bg-surface/60 border border-border rounded-2xl">
              <PlayCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No executions recorded</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Trigger a workflow from the Workflows tab to begin streaming live agent telemetry.
              </p>
              <Link
                href="/workflows"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
              >
                <span>View Workflows</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-surface/80 border border-border rounded-2xl overflow-hidden shadow-glass divide-y divide-border/60">
              {executions.map((exec) => {
                const durationSec =
                  exec.durationMs > 0 ? (exec.durationMs / 1000).toFixed(2) + 's' : '<1s';

                return (
                  <Link
                    key={exec._id}
                    href={`/executions/${exec._id}`}
                    className="p-4 sm:p-5 hover:bg-slate-800/40 transition flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="mt-1">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            exec.status === 'COMPLETED'
                              ? 'bg-emerald-400'
                              : exec.status === 'RUNNING'
                              ? 'bg-cyan-400 animate-ping'
                              : exec.status === 'FAILED'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition truncate">
                            {exec.workflow?.name || 'Untitled Workflow'}
                          </h4>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.2 rounded-full border ${getStatusBadgeClasses(
                              exec.status
                            )}`}
                          >
                            {exec.status}
                          </span>
                          {exec.retryCount > 0 && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              {exec.retryCount} retries
                            </span>
                          )}
                        </div>

                        {exec.error && (
                          <p className="text-xs text-rose-400 mt-1 font-mono line-clamp-1">
                            Error: {exec.error.message}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono flex-wrap">
                          <span>Run #{exec._id.slice(-6)}</span>
                          <span>&bull;</span>
                          <span>Duration: {durationSec}</span>
                          <span>&bull;</span>
                          <span>{formatTimeAgo(exec.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-brand-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                        <span>Inspect Run</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
