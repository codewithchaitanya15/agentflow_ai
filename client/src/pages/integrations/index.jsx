import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../lib/api';
import { getStatusBadgeClasses, formatDate, formatTimeAgo } from '../../lib/utils';
import {
  Mail,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  RotateCw,
  Loader2,
  X,
  Lock
} from 'lucide-react';

const PROVIDER_METADATA = {
  gmail: {
    name: 'Gmail',
    icon: Mail,
    color: 'from-red-500/20 to-red-500/5',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    description: 'Read incoming emails, filter by subject/labels, and dispatch automated customer communications over OAuth2.'
  },
  slack: {
    name: 'Slack',
    icon: MessageSquare,
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    description: 'Post operational incident alerts, approval cards, and summaries directly to designated Slack channels.'
  },
  discord: {
    name: 'Discord',
    icon: Bot,
    color: 'from-indigo-500/20 to-indigo-500/5',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    description: 'Broadcast real-time operational notifications and rich embeds to Discord servers via Bot API or Webhook.'
  },
  'google-sheets': {
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    color: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    description: 'Append invoice entries, record ticket logs, and query spreadsheets as a continuous data sink.'
  },
  openrouter: {
    name: 'OpenRouter AI',
    icon: Brain,
    color: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    description: 'Multi-LLM gateway connecting Claude 3.5 Sonnet, GPT-4o, and DeepSeek for advanced reasoning nodes.'
  },
  gemini: {
    name: 'Google Gemini',
    icon: Brain,
    color: 'from-cyan-500/20 to-cyan-500/5',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    description: 'Ultra-fast multimodal LLM reasoning engine via Google Generative AI SDK.'
  }
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Manual token entry modal state
  const [modalProvider, setModalProvider] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [channelInput, setChannelInput] = useState('');
  const [savingToken, setSavingToken] = useState(false);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data || []);
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleStartOAuth = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start?json=true`);
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      alert('OAuth initialization failed: ' + err.message);
    }
  };

  const handleTest = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const response = await api.post(`/integrations/${provider}/test`);
      setTestResult({
        provider,
        success: true,
        message: `Health check passed! Connected to: ${response.data.account || response.data.bot || response.data.team || 'Active'}`
      });
      fetchIntegrations();
    } catch (err) {
      setTestResult({
        provider,
        success: false,
        message: err.message || 'Connection test failed'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveCustom = async (e) => {
    e.preventDefault();
    if (!modalProvider) return;

    setSavingToken(true);
    try {
      await api.post('/integrations', {
        provider: modalProvider,
        apiKey: tokenInput,
        config: { defaultChannel: channelInput },
        status: 'connected'
      });
      setModalProvider(null);
      setTokenInput('');
      setChannelInput('');
      fetchIntegrations();
    } catch (err) {
      alert('Failed to save integration: ' + err.message);
    } finally {
      setSavingToken(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Third-Party Integrations"
        actionButton={
          <button
            onClick={fetchIntegrations}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh integration states"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        }
      >
        <div className="space-y-6">
          {/* Header Description */}
          <div className="p-5 rounded-2xl bg-surface/80 border border-border shadow-glass flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Application-Level Encryption (AES-256-GCM)</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All OAuth access tokens, refresh keys, and webhook secrets are encrypted at rest using your instance key (<code className="text-brand-400 font-mono">CREDENTIAL_ENCRYPTION_KEY</code>). Integrations will automatically sandbox with high-fidelity simulated handlers if external credentials are not set.
              </p>
            </div>
          </div>

          {/* Test Diagnostic Result Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  <strong>[{testResult.provider.toUpperCase()} Diagnostic]:</strong> {testResult.message}
                </span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Integrations Grid */}
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-mono">Scanning provider health states...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {integrations.map((item) => {
                const meta = PROVIDER_METADATA[item.provider] || {
                  name: item.provider,
                  icon: Key,
                  color: 'from-slate-500/20 to-slate-500/5',
                  iconColor: 'text-slate-400',
                  borderColor: 'border-slate-700',
                  description: 'Integration connector'
                };
                const Icon = meta.icon;
                const isConnected = item.status === 'connected';
                const isTesting = testingProvider === item.provider;

                return (
                  <div
                    key={item.provider}
                    className={`p-5 rounded-2xl bg-gradient-to-b ${meta.color} border ${meta.borderColor} shadow-glass backdrop-blur flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl bg-slate-900/80 ${meta.iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{meta.name}</h3>
                            <span
                              className={`inline-block text-[10px] font-mono uppercase px-2 py-0.2 rounded-full border ${getStatusBadgeClasses(
                                item.status
                              )} mt-0.5`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {meta.description}
                      </p>

                      {item.accountEmail && (
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-border text-[11px] font-mono text-slate-300 mb-3 truncate">
                          Account: {item.accountEmail}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTest(item.provider)}
                        disabled={isTesting}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-border disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isTesting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCw className="w-3.5 h-3.5" />
                        )}
                        <span>Test Health</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setModalProvider(item.provider);
                            setTokenInput('');
                            setChannelInput('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-border"
                          title="Manual API Key entry"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartOAuth(item.provider)}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition shadow-glow-brand flex items-center gap-1"
                        >
                          <span>{isConnected ? 'Reconnect' : 'Connect'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manual Credential Input Modal */}
          {modalProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-bold text-white capitalize">
                      Manual {modalProvider} Configuration
                    </h3>
                  </div>
                  <button
                    onClick={() => setModalProvider(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveCustom} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      API Key / Bot Token / Webhook URL
                    </label>
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Paste secret or webhook URL..."
                      className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Channel / Target ID (optional)
                    </label>
                    <input
                      type="text"
                      value={channelInput}
                      onChange={(e) => setChannelInput(e.target.value)}
                      placeholder="#operations or spreadsheet ID"
                      className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalProvider(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingToken}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
                    >
                      {savingToken ? 'Saving...' : 'Save & Encrypt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
