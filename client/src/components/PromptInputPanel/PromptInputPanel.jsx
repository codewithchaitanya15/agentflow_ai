import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'When a new lead email arrives in Gmail, analyze sentiment and post an alert to Slack',
  'Ingest invoice webhook, extract invoice number and total amount with AI, log to Google Sheets, and notify Discord',
  'Daily 9 AM cron schedule: generate operations digest with AI and broadcast to standup Slack channel',
  'Customer support inquiry triage: classify urgency with AI, route critical tickets to Discord priority channel'
];

export default function PromptInputPanel({ onGenerate, isGenerating = false }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim());
    }
  };

  const handleSelectSuggestion = (text) => {
    setPrompt(text);
    if (!isGenerating) {
      onGenerate(text);
    }
  };

  return (
    <div className="w-full bg-surface/90 border border-border/80 rounded-2xl p-4 sm:p-6 shadow-glass backdrop-blur-xl">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white shadow-glow-brand">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Describe Automation in Natural Language
          </h2>
          <p className="text-xs text-slate-400">
            Our multi-agent architect will parse your prompt and synthesize a fully connected visual workflow.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-3">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. When a support email arrives in Gmail, extract the order number with AI and post a ticket to Slack..."
          disabled={isGenerating}
          className="w-full bg-slate-950/80 border border-border rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition shadow-inner resize-none font-medium leading-relaxed"
        />

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping inline-block" />
            <span>OpenRouter &bull; Gemini &bull; Deterministic Fallback</span>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-brand"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Graph...</span>
              </>
            ) : (
              <>
                <span>Generate Workflow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Prompts */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Inspiration Templates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(s)}
              disabled={isGenerating}
              className="text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-border/60 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition line-clamp-2 leading-relaxed"
            >
              &ldquo;{s}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
