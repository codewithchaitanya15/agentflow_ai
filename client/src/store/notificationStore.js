import { create } from 'zustand';
import api from '../lib/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,

  setOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set({ isOpen: !get().isOpen }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/notifications');
      set({
        notifications: response.data || [],
        unreadCount: response.unreadCount || 0,
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addNotification: (notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1
    });
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set({
        notifications: get().notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch {
      // Ignored
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set({
        notifications: get().notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });
    } catch {
      // Ignored
    }
  }
}));
