import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import ExecutionTimeline from '../../components/ExecutionTimeline/ExecutionTimeline';
import api from '../../lib/api';
import { subscribeToExecution } from '../../lib/socket';
import { getStatusBadgeClasses, formatDate, formatTimeAgo } from '../../lib/utils';
import {
  Play,
  Pause,
  RotateCw,
  XCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Code2,
  Layers,
  Cpu,
  Sparkles,
  ExternalLink
} from 'lucide-react';

function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'payload' | 'snapshot'

  const fetchExecutionAndLogs = async () => {
    if (!id) return;
    try {
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`)
      ]);
      setExecution(execRes.data);
      setTimelineLogs(timelineRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load execution details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutionAndLogs();

    if (id) {
      // Connect to Live Socket Room
      const unsubscribe = subscribeToExecution(
        id,
        (newEvent) => {
          setTimelineLogs((prev) => [...prev, newEvent]);
        },
        (statusPayload) => {
          setExecution((prev) => (prev ? { ...prev, ...statusPayload } : prev));
        }
      );

      return () => unsubscribe();
    }
  }, [id]);

  const handlePause = async () => {
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutionAndLogs();
    } catch (err) {
      alert('Failed to pause: ' + err.message);
    }
  };

  const handleResume = async () => {
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutionAndLogs();
    } catch (err) {
      alert('Failed to resume: ' + err.message);
    }
  };

  const handleCancel = async () => {
    if (confirm('Cancel this running execution?')) {
      try {
        await api.post(`/executions/${id}/cancel`);
        fetchExecutionAndLogs();
      } catch (err) {
        alert('Failed to cancel: ' + err.message);
      }
    }
  };

  const handleRerun = async () => {
    if (!execution?.workflow?._id) return;
    try {
      const response = await api.post(`/workflows/${execution.workflow._id}/execute`, {
        input: execution.input || {}
      });
      router.push(`/executions/${response.data._id}`);
    } catch (err) {
      alert('Failed to re-run: ' + err.message);
    }
  };

  const isRunning = execution?.status === 'RUNNING';
  const isPaused = execution?.status === 'PAUSED';

  return (
    <ProtectedRoute>
      <AppShell
        title={`Execution Run #${id?.slice(-6) || ''}`}
        actionButton={
          <div className="flex items-center gap-2">
            {isRunning && (
              <>
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </>
            )}

            {isPaused && (
              <button
                type="button"
                onClick={handleResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRerun}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-run</span>
            </button>
          </div>
        }
      >
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-mono">Connecting to agent telemetry channel...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-surface border border-rose-500/30 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">Execution Not Found</h3>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Execution Card */}
            <div className="p-5 rounded-2xl bg-surface/90 border border-border shadow-glass backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Link
                    href="/executions"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">
                        {execution?.workflowSnapshot?.name || execution?.workflow?.name || 'Automation Run'}
                      </h2>
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClasses(
                          execution?.status
                        )}`}
                      >
                        {execution?.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span>Execution ID: {execution?._id}</span>
                      <span>&bull;</span>
                      <span>
                        Duration:{' '}
                        {execution?.durationMs > 0
                          ? (execution.durationMs / 1000).toFixed(2) + 's'
                          : 'In Progress'}
                      </span>
                      {execution?.workflow?._id && (
                        <>
                          <span>&bull;</span>
                          <Link
                            href={`/workflows/${execution.workflow._id}`}
                            className="text-brand-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Canvas</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-border text-center">
                    <span className="text-[10px] text-slate-500 block">Agent Confidence</span>
                    <span className="text-brand-400 font-bold text-sm">
                      {((execution?.confidenceScore || 1.0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-border text-center">
                    <span className="text-[10px] text-slate-500 block">LangGraph Engine</span>
                    <span
                      className={`font-bold text-xs ${
                        execution?.langGraphAvailable ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {execution?.langGraphAvailable ? 'Available' : 'Native 5-Agent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Current Node Banner */}
              {isRunning && (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>
                      Executing Node: <strong>{execution?.currentNodeId || 'Starting DAG...'}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono animate-pulse">
                    Live WebSockets Active
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'bg-brand-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>5-Agent Live Timeline ({timelineLogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payload')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'payload'
                    ? 'bg-brand-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Input &amp; Output Payloads</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('snapshot')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                  activeTab === 'snapshot'
                    ? 'bg-brand-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>DAG Graph Snapshot</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'timeline' && (
              <div className="p-4 sm:p-6 bg-surface/70 border border-border rounded-2xl shadow-glass">
                <ExecutionTimeline logs={timelineLogs} isLive={isRunning} />
              </div>
            )}

            {activeTab === 'payload' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface/80 border border-border rounded-2xl p-4 shadow-glass space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Workflow Input Payload
                  </h4>
                  <pre className="p-3 bg-slate-950 border border-border rounded-xl text-xs font-mono text-cyan-400 overflow-x-auto max-h-96">
                    {JSON.stringify(execution?.input || {}, null, 2)}
                  </pre>
                </div>

                <div className="bg-surface/80 border border-border rounded-2xl p-4 shadow-glass space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Accumulated Context &amp; Output
                  </h4>
                  <pre className="p-3 bg-slate-950 border border-border rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                    {JSON.stringify(execution?.output || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'snapshot' && (
              <div className="bg-surface/80 border border-border rounded-2xl p-4 shadow-glass space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Immutable Runtime Graph Snapshot
                </h4>
                <p className="text-xs text-slate-400">
                  Recorded snapshot of nodes and edges at execution timestamp:
                </p>
                <pre className="p-3 bg-slate-950 border border-border rounded-xl text-xs font-mono text-purple-400 overflow-x-auto max-h-96">
                  {JSON.stringify(execution?.workflowSnapshot || {}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

export default dynamic(() => Promise.resolve(ExecutionDetailPage), { ssr: false });
