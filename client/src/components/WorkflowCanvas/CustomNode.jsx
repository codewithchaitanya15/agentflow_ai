import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Mail,
  Webhook,
  Clock,
  Cpu,
  Brain,
  Send,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Split,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ICON_MAP = {
  Mail,
  Webhook,
  Clock,
  Cpu,
  Brain,
  Send,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Split
};

function CustomNode({ id, data, selected }) {
  const { label, category, nodeType, icon, config = {}, status } = data;
  const Icon = ICON_MAP[icon] || Cpu;

  const getCategoryStyles = () => {
    switch (category) {
      case 'trigger':
        return {
          border: 'border-indigo-500/40 hover:border-indigo-400',
          glow: selected ? 'shadow-glow-brand ring-2 ring-indigo-500' : '',
          headerBg: 'bg-indigo-500/10 text-indigo-400',
          dot: 'bg-indigo-400',
          tag: 'Trigger'
        };
      case 'ai':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
          glow: selected ? 'shadow-glow-brand ring-2 ring-purple-500' : '',
          headerBg: 'bg-purple-500/10 text-purple-400',
          dot: 'bg-purple-400',
          tag: 'AI Agent'
        };
      case 'action':
        return {
          border: 'border-cyan-500/40 hover:border-cyan-400',
          glow: selected ? 'shadow-glow-cyan ring-2 ring-cyan-500' : '',
          headerBg: 'bg-cyan-500/10 text-cyan-400',
          dot: 'bg-cyan-400',
          tag: 'Action'
        };
      case 'logic':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          glow: selected ? 'shadow-glow-emerald ring-2 ring-emerald-500' : '',
          headerBg: 'bg-emerald-500/10 text-emerald-400',
          dot: 'bg-emerald-400',
          tag: 'Logic'
        };
      default:
        return {
          border: 'border-slate-700 hover:border-slate-500',
          glow: selected ? 'ring-2 ring-slate-400' : '',
          headerBg: 'bg-slate-800 text-slate-300',
          dot: 'bg-slate-400',
          tag: 'Node'
        };
    }
  };

  const styles = getCategoryStyles();

  const renderStatusBadge = () => {
    if (!status) return null;
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> running
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" /> done
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
            <AlertCircle className="w-2.5 h-2.5" /> failed
          </span>
        );
      default:
        return null;
    }
  };

  // Preview snippet of node config
  const getSubtext = () => {
    if (config.prompt) return config.prompt.slice(0, 36) + '...';
    if (config.channel) return `Target: ${config.channel}`;
    if (config.to) return `To: ${config.to}`;
    if (config.spreadsheetId) return `Sheet: ${config.spreadsheetId}`;
    if (config.cronExpression) return `Cron: ${config.cronExpression}`;
    if (config.query) return `Filter: ${config.query}`;
    return nodeType;
  };

  const hasInputs = category !== 'trigger' && !nodeType.endsWith('_trigger');

  return (
    <div
      className={`w-64 rounded-2xl bg-surface/90 backdrop-blur-xl border ${styles.border} ${styles.glow} p-3.5 shadow-glass transition-all duration-200 cursor-pointer relative group`}
    >
      {/* Target Handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          className="!w-3 !h-3 !-left-2 !bg-brand-500 !border-2 !border-background hover:!scale-125 transition"
        />
      )}

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3 !h-3 !-right-2 !bg-brand-500 !border-2 !border-background hover:!scale-125 transition"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${styles.headerBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {styles.tag}
          </span>
        </div>

        {renderStatusBadge() || (
          <span className="text-[10px] text-slate-500 font-mono">#{id}</span>
        )}
      </div>

      {/* Node Title */}
      <h4 className="text-xs font-bold text-slate-100 truncate">{label || 'Untitled Node'}</h4>

      {/* Node Snippet / Parameter preview */}
      <p className="text-[11px] text-slate-400 font-mono truncate mt-1 bg-slate-900/60 px-2 py-1 rounded-lg border border-border/40">
        {getSubtext()}
      </p>
    </div>
  );
}

export default memo(CustomNode);
