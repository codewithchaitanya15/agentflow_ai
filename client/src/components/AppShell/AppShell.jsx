import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationsDrawer from '../NotificationsDrawer/NotificationsDrawer';
import ThemeSelector from '../ThemeSelector/ThemeSelector';
import { getSocket, subscribeToUserNotifications } from '../../lib/socket';
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Radio,
  Zap,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/workflows/builder', label: 'AI Builder', icon: Sparkles, badge: 'AI' },
  { href: '/executions', label: 'Executions', icon: PlayCircle },
  { href: '/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children, title, actionButton }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { unreadCount, toggleOpen, addNotification, fetchNotifications } = useNotificationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      setIsSocketConnected(socket.connected);

      const onConnect = () => setIsSocketConnected(true);
      const onDisconnect = () => setIsSocketConnected(false);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      let cleanupUser = () => {};
      if (user?.id) {
        cleanupUser = subscribeToUserNotifications(user.id, (notif) => {
          addNotification(notif);
        });
      }

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        cleanupUser();
      };
    }
  }, [user, addNotification, fetchNotifications]);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col md:flex-row">
      {/* Notifications Drawer */}
      <NotificationsDrawer />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl shrink-0 h-screen sticky top-0 z-30">
        {/* Logo Branding */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">Agentflow<span className="text-brand-400">_AI</span></span>
              <span className="block text-[10px] text-slate-400 font-mono">Agentic Operations</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-brand-500 to-cyan-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-border bg-slate-900/40">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Operator'}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="capitalize">{user?.role || 'operator'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    online
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2 truncate">
                {title || 'Agentflow_AI Platform'}
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-amber-400 animate-pulse'}`} />
              <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {isSocketConnected ? 'Live Socket Active' : 'Connecting...'}
              </span>
            </div>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* Notifications Trigger */}
            <button
              onClick={toggleOpen}
              className="relative p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Custom Page Action Button */}
            {actionButton}
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border p-4 space-y-2 animate-in slide-in-from-top duration-200">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-brand-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
