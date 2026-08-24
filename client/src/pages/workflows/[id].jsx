import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../lib/api';
import {
  Save,
  Play,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  GitBranch,
  Trash2,
  Copy
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    currentWorkflow,
    setWorkflow,
    nodes,
    edges,
    selectedNode,
    isDirty,
    saveWorkflow,
    isSaving
  } = useWorkflowStore();

  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!id) return;

    const fetchWorkflow = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/workflows/${id}`);
        const wf = response.data;
        setWorkflow(wf);
        setWorkflowName(wf.name || '');
        setStatus(wf.status || 'draft');
      } catch (err) {
        setError(err.message || 'Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [id, setWorkflow]);

  const handleSave = async () => {
    setError('');
    setSaveSuccess(false);
    try {
      if (currentWorkflow) {
        currentWorkflow.name = workflowName;
        currentWorkflow.status = status;
      }
      await saveWorkflow();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
  };

  const handleExecute = async () => {
    setError('');
    setExecuting(true);
    try {
      // Save before executing if dirty
      if (isDirty) {
        await saveWorkflow();
      }

      const response = await api.post(`/workflows/${id}/execute`, { input: {} });
      const execution = response.data;
      router.push(`/executions/${execution._id}`);
    } catch (err) {
      setError(err.message || 'Failed to trigger execution');
      setExecuting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await api.post(`/workflows/${id}/duplicate`);
      router.push(`/workflows/${response.data._id}`);
    } catch (err) {
      alert('Failed to duplicate: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/workflows/${id}`);
        router.push('/workflows');
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-background text-slate-100 overflow-hidden">
        {/* Studio Topbar */}
        <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/workflows"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Back to workflows"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:bg-slate-900 border border-transparent focus:border-brand-500 rounded-lg px-2 py-1 outline-none transition truncate max-w-xs sm:max-w-md"
                placeholder="Workflow Name"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-900 border border-border text-xs rounded-lg px-2 py-1 text-slate-300 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>

              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-border">
                v{currentWorkflow?.version || 1}
              </span>

              {isDirty && (
                <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-semibold transition shadow-glow-brand disabled:opacity-50"
            >
              {executing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Run Pipeline</span>
            </button>

            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              title="Clone"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace Canvas Container (Palette Left + React Flow Center + Config Drawer Right) */}
        <div className="flex-1 flex overflow-hidden relative">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-mono">Rendering React Flow DAG...</p>
            </div>
          ) : (
            <>
              {/* Left Node Palette */}
              <NodePalette />

              {/* Main Visual Canvas */}
              <WorkflowCanvas className="flex-1" />

              {/* Right Inspector Drawer */}
              {selectedNode && <NodeConfigPanel />}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
