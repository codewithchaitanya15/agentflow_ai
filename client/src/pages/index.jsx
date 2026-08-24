import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import ThemeSelector from '../components/ThemeSelector/ThemeSelector';
import {
  Zap,
  Sparkles,
  Compass,
  Play,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Bot,
  Terminal,
  Check,
  Brain
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuthStore();

  const agents = [
    {
      name: 'Planner Agent',
      icon: Compass,
      color: 'from-indigo-500/20 to-indigo-500/5',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      desc: 'Performs topological sort on the workflow DAG, resolves dependencies, and scores plan confidence.'
    },
    {
      name: 'Execution Agent',
      icon: Play,
      color: 'from-cyan-500/20 to-cyan-500/5',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      desc: 'Invokes integrations (Gmail, Slack, Sheets) and LLM models with dynamic variable interpolation.'
    },
    {
      name: 'Validation Agent',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      desc: 'Enforces output schema compliance, validates payload integrity, and guarantees contract correctness.'
    },
    {
      name: 'Recovery Agent',
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-amber-500/5',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      desc: 'Classifies failure modes (AUTH_EXPIRED, TRANSIENT, RATE_LIMIT) and chooses between backoff or escalation.'
    },
    {
      name: 'Monitoring Agent',
      icon: Activity,
      color: 'from-purple-500/20 to-purple-500/5',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      desc: 'Persists audit history in Mongo, updates shared agent memory, and streams live telemetry via WebSockets.'
    }
  ];

  const features = [
    {
      title: 'Prompt-to-Graph Generation',
      desc: 'Turn English prompts into executable React Flow node DAGs with automatic placement and edge routing.',
      icon: Sparkles
    },
    {
      title: 'Real-Time Telemetry Stream',
      desc: 'Watch each agent reason, validate, and recover in real time through dedicated WebSocket channels.',
      icon: Activity
    },
    {
      title: 'Encrypted OAuth Integrations',
      desc: 'Native connections for Gmail, Slack, Discord, and Google Sheets with AES-256-GCM token encryption at rest.',
      icon: ShieldCheck
    },
    {
      title: 'Resilient Queue & Retry Backoff',
      desc: 'Backed by BullMQ and Redis with automatic in-memory queue fallback for zero-dependency local runs.',
      icon: Cpu
    }
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-border/80 bg-surface/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-glow-brand">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Agentflow<span className="text-brand-400">_AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition shadow-glow-brand"
              >
                <span>Console Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold transition shadow-glow-brand"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-cyan-500/20 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-brand-500/30 text-xs font-medium text-brand-300 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Autonomous Multi-Agent AI Operations Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Turn Natural Language into <br className="hidden sm:inline" />
            <span className="text-gradient">Self-Healing Visual Workflows</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Describe any enterprise automation in plain English. Watch our 5-agent pipeline synthesize the graph, validate payloads, integrate with Gmail, Slack & Sheets, and stream execution telemetry live.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={user ? '/workflows/builder' : '/register'}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold text-sm transition shadow-glow-brand"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Builder</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition"
            >
              <span>Explore Operator Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Live Pipeline Preview Banner */}
          <div className="mt-14 p-1 rounded-2xl bg-gradient-to-r from-brand-500/30 via-cyan-500/30 to-emerald-500/30 shadow-2xl">
            <div className="bg-surface/90 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">agentflow-orchestration-preview.json</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  5 Agents Active
                </span>
              </div>

              {/* Visual Node Flow Simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-left">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail Trigger</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Incoming invoice email parsed</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-left">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                    <Brain className="w-3.5 h-3.5" />
                    <span>AI Extractor</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Extracts vendor & $1,450 total</p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-left">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Google Sheets</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Appends row to Finance Ledger</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Slack Alerts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Broadcasts to #operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Agent Multi-Agent Section */}
      <section className="py-20 bg-slate-950/60 border-y border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Cooperative Multi-Agent Chain
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
              Five Specialized AI Agents in Every Run
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Unlike static workflow runners, Agentflow_AI executes through a continuous feedback loop of reasoning, validation, and self-healing recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl bg-gradient-to-b ${agent.color} border ${agent.border} backdrop-blur shadow-glass flex flex-col justify-between`}
                >
                  <div>
                    <div className={`w-9 h-9 rounded-xl bg-slate-900/80 flex items-center justify-center ${agent.text} mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{agent.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[10px] font-mono text-slate-500">
                    Step 0{i + 1} Pipeline
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Built for Modern Operations
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Engineered with enterprise security, OAuth token encryption, and real-time observability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-surface/60 border border-border hover:border-slate-600 transition backdrop-blur flex gap-4"
              >
                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 h-fit shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Agentflow_AI. High-Performance Agentic Operations Platform.</p>
      </footer>
    </div>
  );
}
