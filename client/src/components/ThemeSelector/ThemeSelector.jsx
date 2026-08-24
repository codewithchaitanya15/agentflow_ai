import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore, THEMES } from '../../store/themeStore';
import { Palette, Check, Sun, Moon, Zap, Sparkles } from 'lucide-react';

const ICONS = {
  Moon: Moon,
  Zap: Zap,
  Sparkles: Sparkles,
  Sun: Sun
};

export default function ThemeSelector({ className = '' }) {
  const { theme, setTheme, initTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const CurrentIcon = ICONS[activeTheme.icon] || Moon;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-border transition text-xs font-medium shadow-sm"
        title="Change Visual Theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: activeTheme.accent }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline font-mono">{activeTheme.name.split(' ')[0]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-surface/95 backdrop-blur-2xl border border-border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-border/60 mb-1">
            Visual Themes
          </div>

          {THEMES.map((t) => {
            const Icon = ICONS[t.icon] || Moon;
            const isSelected = t.id === theme;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                  isSelected
                    ? 'bg-brand-500/15 border border-brand-500/30 text-white'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0 shadow-sm"
                    style={{ backgroundColor: t.color, border: `1px solid ${t.accent}` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: t.accent }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{t.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
