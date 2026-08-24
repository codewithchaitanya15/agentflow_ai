import { create } from 'zustand';

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Navy',
    icon: 'Moon',
    color: '#090d16',
    accent: '#6366f1',
    description: 'Deep cosmic dark mode with indigo and cyan neon'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: 'Zap',
    color: '#030712',
    accent: '#10b981',
    description: 'High-contrast obsidian with neon emerald and electric pink'
  },
  {
    id: 'nebula',
    name: 'Nebula Amethyst',
    icon: 'Sparkles',
    color: '#0c071e',
    accent: '#a855f7',
    description: 'Radiant deep violet galaxy with royal amethyst'
  },
  {
    id: 'light',
    name: 'Daylight Studio',
    icon: 'Sun',
    color: '#f8fafc',
    accent: '#4f46e5',
    description: 'Clean high-readability daylight theme with slate surfaces'
  }
];

export const useThemeStore = create((set) => ({
  theme: 'midnight',

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agentflow_theme') || 'midnight';
      set({ theme: saved });
      document.documentElement.setAttribute('data-theme', saved);
      if (saved === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark');
      }
    }
  },

  setTheme: (newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentflow_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light-mode');
        document.documentElement.classList.add('dark');
      }
    }
    set({ theme: newTheme });
  }
}));
