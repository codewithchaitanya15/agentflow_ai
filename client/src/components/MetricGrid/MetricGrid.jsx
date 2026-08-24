import React from 'react';
import {
  GitBranch,
  PlayCircle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Activity,
  Zap,
  Clock
} from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    completedExecutions = 0,
    failedExecutions = 0,
    runningExecutions = 0,
    successRate = 100
  } = metrics;

  const cards = [
    {
      title: 'Total Workflows',
      value: totalWorkflows,
      subValue: `${activeWorkflows} active`,
      icon: GitBranch,
      color: 'from-brand-500/20 to-brand-500/5',
      iconColor: 'text-brand-400',
      borderColor: 'border-brand-500/20'
    },
    {
      title: 'Total Executions',
      value: totalExecutions,
      subValue: `${runningExecutions} in progress`,
      icon: PlayCircle,
      color: 'from-cyan-500/20 to-cyan-500/5',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      subValue: `${completedExecutions} succeeded`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Agent Recoveries',
      value: failedExecutions,
      subValue: 'Failures caught & logged',
      icon: AlertOctagon,
      color: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-b ${card.color} border ${card.borderColor} backdrop-blur-md shadow-glass flex flex-col justify-between relative overflow-hidden group hover:border-slate-600 transition-all`}
          >
            {/* Background glowing flare */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-900/60 border border-border ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                {card.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
