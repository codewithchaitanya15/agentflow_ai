import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatTimeAgo } from '../../lib/utils';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsDrawer() {
  const {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'escalation':
      case 'error':
        return <Flame className="w-5 h-5 text-rose-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Real-time alerts & agent escalations</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">All clear, Operator!</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Agent actions, failures, and execution milestones will appear here in real time.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                className={`p-3.5 rounded-xl transition cursor-pointer flex gap-3 ${
                  notif.isRead
                    ? 'bg-transparent hover:bg-slate-800/40 text-slate-400'
                    : 'bg-slate-800/60 hover:bg-slate-800/90 border border-brand-500/20 text-slate-200'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">{getTypeIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-medium truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.execution && (
                    <Link
                      href={`/executions/${notif.execution}`}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-400 hover:text-brand-300 mt-2"
                    >
                      View Live Run <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-slate-900/50 text-center">
          <p className="text-xs text-slate-500">Live WebSockets connected to Agentflow_AI</p>
        </div>
      </div>
    </div>
  );
}
