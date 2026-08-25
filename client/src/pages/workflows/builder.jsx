import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import PromptInputPanel from '../../components/PromptInputPanel/PromptInputPanel';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../lib/api';
import {
  Sparkles,
  Save,
  Play,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  Layers
} from 'lucide-react';

function WorkflowBuilderPage() {
  const router = useRouter();
  const {
    currentWorkflow,
    nodes,
    edges,
    generateFromPrompt,
    isGenerating,
    selectedNode
  } = useWorkflowStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleGenerate = async (prompt) => {
    setSaveError('');
    try {
      await generateFromPrompt(prompt);
    } catch (err) {
      setSaveError(err.message || 'Failed to generate workflow');
    }
  };

  const handleSaveAndOpen = async () => {
    if (!currentWorkflow || nodes.length === 0) {
      setSaveError('Please generate a workflow before saving');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await api.post('/workflows', {
        name: currentWorkflow.name || 'AI Generated Automation',
        description: currentWorkflow.description || '',
        triggerConfig: currentWorkflow.triggerConfig || { type: 'manual' },
        nodes,
        edges,
        tags: currentWorkflow.tags || ['AI Automation'],
        status: 'active',
        aiGenerated: true,
        prompt: currentWorkflow.prompt || ''
      });

      const savedWf = response.data;
      setSaveSuccess(true);
      setTimeout(() => {
        router.push(`/workflows/${savedWf._id}`);
      }, 800);
    } catch (err) {
      setSaveError(err.message || 'Failed to save workflow');
      setIsSaving(false);
    }
  };

  const handleSaveAndExecute = async () => {
    if (!currentWorkflow || nodes.length === 0) {
      setSaveError('Please generate a workflow before executing');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // 1. Save workflow
      const response = await api.post('/workflows', {
        name: currentWorkflow.name || 'AI Generated Automation',
        description: currentWorkflow.description || '',
        triggerConfig: currentWorkflow.triggerConfig || { type: 'manual' },
        nodes,
        edges,
        tags: currentWorkflow.tags || ['AI Automation'],
        status: 'active',
        aiGenerated: true,
        prompt: currentWorkflow.prompt || ''
      });

      const savedWf = response.data;

      // 2. Trigger execution immediately
      const execRes = await api.post(`/workflows/${savedWf._id}/execute`, { input: {} });
      const execution = execRes.data;

      router.push(`/executions/${execution._id}`);
    } catch (err) {
      setSaveError(err.message || 'Execution failed');
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="AI Prompt-to-Workflow Architect"
        actionButton={
          nodes.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndOpen}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border disabled:opacity-50"
              >
                {isSaving && !saveSuccess ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save to Canvas</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndExecute}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold transition shadow-glow-emerald disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Save &amp; Run Live</span>
              </button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          {/* Prompt Generation Section */}
          <PromptInputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />

          {/* Feedback alerts */}
          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Workflow successfully saved! Launching full canvas studio...</span>
            </div>
          )}

          {/* Live Preview Canvas Container */}
          {nodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Generated Graph Preview</span>
                    <span className="text-xs font-mono text-brand-400 font-normal">
                      ({nodes.length} nodes, {edges.length} connections)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any node on the canvas to inspect and edit its parameters in the right panel.
                  </p>
                </div>
              </div>

              <div className="h-[520px] rounded-2xl border border-border overflow-hidden bg-background relative shadow-2xl flex">
                <WorkflowCanvas className="flex-1" />
                {selectedNode && <NodeConfigPanel />}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

export default dynamic(() => Promise.resolve(WorkflowBuilderPage), { ssr: false });
