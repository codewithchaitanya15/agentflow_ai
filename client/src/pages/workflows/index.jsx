import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../lib/api';
import { getStatusBadgeClasses, formatTimeAgo } from '../../lib/utils';
import {
  GitBranch,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Search,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState(null);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/workflows', {
        params: { search, status: statusFilter }
      });
      setWorkflows(response.data || []);
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleDuplicate = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      alert('Failed to duplicate workflow: ' + err.message);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workflow and all execution history?')) {
      try {
        await api.delete(`/workflows/${id}`);
        setWorkflows(workflows.filter((w) => w._id !== id));
      } catch (err) {
        alert('Failed to delete workflow: ' + err.message);
      }
    }
  };

  const handleExecute = async (e, id) => {
    e.stopPropagation();
    setExecutingId(id);
    try {
      const response = await api.post(`/workflows/${id}/execute`, { input: {} });
      const execution = response.data;
      router.push(`/executions/${execution._id}`);
    } catch (err) {
      alert('Failed to trigger execution: ' + err.message);
      setExecutingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Workflow Directory"
        actionButton={
          <div className="flex items-center gap-2">
            <Link
              href="/workflows/builder"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-semibold transition shadow-glow-brand"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Builder</span>
            </Link>

            <button
              onClick={async () => {
                try {
                  const res = await api.post('/workflows', {
                    name: 'New Custom Automation',
                    description: 'Interactive canvas workflow',
                    status: 'draft',
                    nodes: [
                      {
                        id: 'node_1',
                        type: 'customNode',
                        position: { x: 100, y: 150 },
                        data: {
                          label: 'Manual Trigger',
                          category: 'trigger',
                          nodeType: 'manual_trigger',
                          icon: 'Cpu',
                          config: {},
                          inputs: [],
                          outputs: ['out']
                        }
                      }
                    ],
                    edges: []
                  });
                  router.push(`/workflows/${res.data._id}`);
                } catch (err) {
                  alert(err.message);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Blank Canvas</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface/80 border border-border rounded-2xl p-3 shadow-glass">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows by name or tags..."
                className="w-full bg-slate-950/80 border border-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'active', 'draft', 'paused'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                    statusFilter === status
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Cards Grid */}
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-mono">Loading operations catalogue...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="p-12 text-center bg-surface/60 border border-border rounded-2xl">
              <GitBranch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No workflows found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No automations matched your search query. Try generating one with our AI generator!
              </p>
              <Link
                href="/workflows/builder"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch AI Builder</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  onClick={() => router.push(`/workflows/${wf._id}`)}
                  className="p-5 rounded-2xl bg-surface/80 border border-border/80 hover:border-brand-500/40 transition-all duration-200 cursor-pointer shadow-glass flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(
                          wf.status
                        )}`}
                      >
                        {wf.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <span>v{wf.version || 1}</span>
                        {wf.aiGenerated && (
                          <span className="text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                            AI
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition truncate">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {wf.description || 'No description provided.'}
                    </p>

                    {/* Tags */}
                    {wf.tags && wf.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {wf.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-border font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-mono">
                      <span>{wf.nodes?.length || 0} nodes</span>
                      <span className="mx-1.5">&bull;</span>
                      <span>{wf.executionCount || 0} runs</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleExecute(e, wf._id)}
                        disabled={executingId === wf._id}
                        className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 transition shadow-sm"
                        title="Run through 5-agent chain"
                      >
                        {executingId === wf._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(e, wf._id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-border transition"
                        title="Clone workflow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, wf._id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-border transition"
                        title="Delete workflow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

export default dynamic(() => Promise.resolve(WorkflowsListPage), { ssr: false });
