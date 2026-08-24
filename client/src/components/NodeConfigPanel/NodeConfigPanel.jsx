import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  X,
  Trash2,
  Sliders,
  Sparkles,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, setSelectedNode, updateNodeConfig, updateNodeLabel, deleteNode } =
    useWorkflowStore();

  const [label, setLabel] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setConfig(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeData = selectedNode.data || {};
  const nodeType = nodeData.nodeType || selectedNode.type;
  const category = nodeData.category || 'action';

  const handleConfigChange = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    updateNodeConfig(selectedNode.id, updated);
  };

  const handleLabelBlur = () => {
    if (label.trim()) {
      updateNodeLabel(selectedNode.id, label.trim());
    }
  };

  const renderConfigFields = () => {
    // 1. AI Nodes (Prompt / Reasoning / Classification / Extraction)
    if (category === 'ai' || nodeType.startsWith('ai_')) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              AI System Prompt
            </label>
            <textarea
              rows={3}
              value={config.systemPrompt || ''}
              onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
              placeholder="You are an intelligent operations agent..."
              className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Prompt Template / Task
            </label>
            <textarea
              rows={4}
              value={config.prompt || ''}
              onChange={(e) => handleConfigChange('prompt', e.target.value)}
              placeholder="Analyze the incoming payload {{input.body}}..."
              className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Supports dynamic interpolation like <code className="text-brand-400">{'{{node_1.output.field}}'}</code>
            </p>
          </div>

          {nodeType === 'ai_classifier' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classification Target Classes (comma separated)
              </label>
              <input
                type="text"
                value={Array.isArray(config.classes) ? config.classes.join(', ') : config.classes || ''}
                onChange={(e) =>
                  handleConfigChange(
                    'classes',
                    e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="URGENT, STANDARD, BILLING, SPAM"
                className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          )}

          {nodeType === 'ai_extractor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Output JSON Schema
              </label>
              <textarea
                rows={4}
                value={config.outputSchema || ''}
                onChange={(e) => handleConfigChange('outputSchema', e.target.value)}
                placeholder='{ "invoiceNumber": "string", "totalAmount": "number" }'
                className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span className="font-semibold">Temperature</span>
              <span className="font-mono text-brand-400">{config.temperature ?? 0.3}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature ?? 0.3}
              onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      );
    }

    // 2. Gmail Nodes
    if (nodeType === 'gmail_send' || nodeType === 'email_trigger') {
      return (
        <div className="space-y-4">
          {nodeType === 'gmail_send' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="text"
                  value={config.to || ''}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  placeholder="recipient@example.com or {{node_1.output.from}}"
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={config.subject || ''}
                  onChange={(e) => handleConfigChange('subject', e.target.value)}
                  placeholder="Agentflow Automation Alert"
                  className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Body (HTML/Text)
                </label>
                <textarea
                  rows={4}
                  value={config.body || ''}
                  onChange={(e) => handleConfigChange('body', e.target.value)}
                  placeholder="Hello, here is the report: {{node_2.output.result}}"
                  className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gmail Search Query
              </label>
              <input
                type="text"
                value={config.query || ''}
                onChange={(e) => handleConfigChange('query', e.target.value)}
                placeholder="is:unread category:primary"
                className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          )}
        </div>
      );
    }

    // 3. Slack & Discord
    if (nodeType === 'slack_notify' || nodeType === 'discord_notify') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Destination Channel / Webhook
            </label>
            <input
              type="text"
              value={config.channel || ''}
              onChange={(e) => handleConfigChange('channel', e.target.value)}
              placeholder="#operations-alerts"
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Message Content / Template
            </label>
            <textarea
              rows={4}
              value={config.message || ''}
              onChange={(e) => handleConfigChange('message', e.target.value)}
              placeholder="🚨 Alert: {{node_1.output.summary}}"
              className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      );
    }

    // 4. Google Sheets
    if (nodeType === 'sheets_append') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Spreadsheet ID / Name
            </label>
            <input
              type="text"
              value={config.spreadsheetId || ''}
              onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
              placeholder="corporate-operations-2026"
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sheet Name</label>
            <input
              type="text"
              value={config.sheetName || ''}
              onChange={(e) => handleConfigChange('sheetName', e.target.value)}
              placeholder="Sheet1"
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      );
    }

    // 5. Condition Branch
    if (nodeType === 'condition_branch') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field to Evaluate
            </label>
            <input
              type="text"
              value={config.conditionField || ''}
              onChange={(e) => handleConfigChange('conditionField', e.target.value)}
              placeholder="totalAmount"
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Operator</label>
            <select
              value={config.operator || 'greater_than'}
              onChange={(e) => handleConfigChange('operator', e.target.value)}
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            >
              <option value="greater_than">Greater than (&gt;)</option>
              <option value="less_than">Less than (&lt;)</option>
              <option value="equals">Equals (==)</option>
              <option value="contains">Contains text</option>
              <option value="is_truthy">Is not empty / Truthy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Value</label>
            <input
              type="text"
              value={config.value || ''}
              onChange={(e) => handleConfigChange('value', e.target.value)}
              placeholder="1000"
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      );
    }

    // 6. Delay
    if (nodeType === 'delay') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Delay Duration (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.seconds || 3}
              onChange={(e) => handleConfigChange('seconds', parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>
      );
    }

    // Default Fallback JSON Editor
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Custom Configuration (JSON)
        </label>
        <textarea
          rows={6}
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setConfig(parsed);
              updateNodeConfig(selectedNode.id, parsed);
            } catch {
              // Ignore invalid JSON while typing
            }
          }}
          className="w-full bg-slate-900 border border-border rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-500 transition"
        />
      </div>
    );
  };

  return (
    <div className="w-80 bg-surface/95 border-l border-border flex flex-col h-full overflow-hidden select-none shrink-0 z-10 shadow-xl">
      {/* Inspector Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Node Inspector</h2>
            <p className="text-[11px] text-slate-400 font-mono">{selectedNode.id}</p>
          </div>
        </div>

        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Node Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Node Title</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
            className="w-full bg-slate-900 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <hr className="border-border/60" />

        {/* Dynamic Config Controls */}
        {renderConfigFields()}

        <hr className="border-border/60" />

        {/* Danger zone */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => deleteNode(selectedNode.id)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node from Graph</span>
          </button>
        </div>
      </div>
    </div>
  );
}
