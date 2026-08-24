import React, { useState } from 'react';
import { getAgentColor, formatTimeAgo } from '../../lib/utils';
import {
  Compass,
  Play,
  CheckCircle,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronRight,
  Code2,
  Clock,
  Sparkles
} from 'lucide-react';

const AGENT_ICONS = {
  planner: Compass,
  execution: Play,
  validation: CheckCircle,
  recovery: AlertTriangle,
  monitoring: Activity
};

export default function ExecutionTimeline({ logs = [], isLive = false }) {
  const [expandedLogIds, setExpandedLogIds] = useState(new Set());

  const toggleExpand = (id) => {
    const next = new Set(expandedLogIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedLogIds(next);
  };

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-surface/50 border border-border rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Awaiting Agent Events...</p>
        <p className="text-xs text-slate-500 mt-1">
          When this execution starts, the 5-agent pipeline telemetry will stream here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border/60">
      {logs.map((log, index) => {
        const agent = log.agent?.toLowerCase() || 'monitoring';
        const AgentIcon = AGENT_ICONS[agent] || Activity;
        const color = getAgentColor(agent);
        const logId = log._id || log.logId || index;
        const isExpanded = expandedLogIds.has(logId);
        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

        return (
          <div key={logId} className="relative flex items-start gap-3.5 pl-1 group">
            {/* Agent Icon Badge */}
            <div
              className={`w-7 h-7 rounded-lg ${color.bg} border ${color.border} ${color.text} flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5`}
            >
              <AgentIcon className="w-3.5 h-3.5" />
            </div>

            {/* Event Body Card */}
            <div className="flex-1 bg-surface/80 border border-border/80 rounded-xl p-3 shadow-sm hover:border-slate-600 transition">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}
                  >
                    {agent}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {log.eventType}
                  </span>
                  {log.nodeId && (
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-border">
                      {log.nodeId}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Just now'}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-normal">
                {log.message}
              </p>

              {/* Metadata toggle */}
              {hasMetadata && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => toggleExpand(logId)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-brand-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-brand-400" />
                    )}
                    <span>Telemetry Payload</span>
                  </button>

                  {isExpanded && (
                    <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-border text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLive && (
        <div className="relative flex items-center gap-3 pl-1 pt-1">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 z-10 animate-pulse">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            Agent pipeline active & streaming events...
          </span>
        </div>
      )}
    </div>
  );
}
