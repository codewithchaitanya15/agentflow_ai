import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const cachedUser = localStorage.getItem('agentflow_user');

    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    if (cachedUser) {
      try {
        set({ user: JSON.parse(cachedUser), token });
      } catch {
        // Ignored
      }
    }

    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      localStorage.setItem('agentflow_user', JSON.stringify(user));
      set({ user, token, isLoading: false, error: null });
    } catch (err) {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
      set({ user: null, token: null, isLoading: false, error: err.message });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = response.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('agentflow_token');
    localStorage.removeItem('agentflow_user');
    set({ user: null, token: null, isLoading: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}));
