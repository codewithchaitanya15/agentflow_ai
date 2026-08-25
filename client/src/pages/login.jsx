import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Zap, Lock, Mail, ArrowRight, Loader2, Sparkles, ShieldAlert } from 'lucide-react';

function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Invalid credentials');
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand logo */}
      <div className="text-center mb-8 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Agentflow<span className="text-brand-400">_AI</span>
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-slate-400">
          Sign in to access your Agentic Operations Console
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface/90 border border-border rounded-2xl p-6 sm:p-8 shadow-glass backdrop-blur-xl relative z-10">
        <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Operator Login</h2>

        {(formError || error) && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@agentflow.ai"
                required
                className="w-full bg-slate-950/80 border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950/80 border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm transition shadow-glow-brand disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Section */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Instant Demo Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('operator@agentflow.ai', 'OperatorPass123!')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-left transition text-[11px]"
            >
              <span className="font-semibold text-brand-400 block">Operator Demo</span>
              <span className="text-slate-500 text-[10px]">operator@agentflow.ai</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@agentflow.ai', 'AdminPass123!')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border text-left transition text-[11px]"
            >
              <span className="font-semibold text-cyan-400 block">Admin Demo</span>
              <span className="text-slate-500 text-[10px]">admin@agentflow.ai</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="text-xs text-center text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-400 hover:underline">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
