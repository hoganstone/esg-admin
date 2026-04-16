'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Leaf, LayoutDashboard, MessageSquare, Briefcase, FolderOpen,
  ShoppingCart, Users, Settings, LogOut, ChevronRight, Sun, Moon,
  Star, BarChart2, Newspaper, FileText,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import type { Locale } from '@/i18n/translations';

type Role = 'USER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'zh-TW', label: 'TW' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JP' },
];

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: '超級管理員', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  ADMIN:       { label: 'ESG管理員',  color: 'text-blue-700 dark:text-blue-300',   bg: 'bg-blue-100 dark:bg-blue-900/40' },
  EDITOR:      { label: '編輯人員',   color: 'text-green-700 dark:text-green-300',  bg: 'bg-green-100 dark:bg-green-900/40' },
  USER:        { label: '一般用戶',   color: 'text-gray-700 dark:text-gray-300',    bg: 'bg-gray-100 dark:bg-gray-700' },
};

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();

  const role = (user.role ?? 'USER') as Role;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const roleMeta = ROLE_META[role] ?? ROLE_META.USER;

  const navItems = [
    { label: t.sidebar.dashboard, href: '/admin/dashboard', icon: LayoutDashboard, show: true },
    { label: t.sidebar.inquiries, href: '/admin/inquiries', icon: MessageSquare, show: true },
    { label: t.sidebar.services,  href: '/admin/services',  icon: Briefcase,      show: true },
    { label: t.sidebar.projects,  href: '/admin/projects',  icon: FolderOpen,     show: true },
    { label: '客戶評論',           href: '/admin/testimonials', icon: Star,        show: true },
    { label: 'ESG 數據',          href: '/admin/esg-data',  icon: BarChart2,      show: true },
    { label: '新聞管理',           href: '/admin/news',      icon: Newspaper,      show: true },
    { label: '報告管理',           href: '/admin/reports',   icon: FileText,       show: true },
    { label: t.sidebar.orders,    href: '/admin/orders',    icon: ShoppingCart,   show: isAdmin },
    { label: t.sidebar.users,     href: '/admin/users',     icon: Users,          show: isAdmin },
    { label: t.sidebar.settings,  href: '/admin/settings',  icon: Settings,       show: isAdmin },
  ].filter(i => i.show);

  const handleLogout = async () => {
    // Record logout time before signing out
    const sessionId = localStorage.getItem('esg-admin-session-id');
    if (sessionId) {
      try {
        await fetch('/api/admin/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sessionId }),
        });
        localStorage.removeItem('esg-admin-session-id');
      } catch {
        // Non-blocking
      }
    }
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white text-sm">{t.sidebar.esgTitle}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t.sidebar.adminPanel}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-500 dark:text-green-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Controls: Language + Theme */}
      <div className="px-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                locale === code
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-9 h-9 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-sm">
            {user.name?.[0] ?? user.email?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name ?? '管理員'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
          </div>
        </div>
        {/* Role badge */}
        <div className="px-3 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleMeta.bg} ${roleMeta.color}`}>
            {isSuperAdmin && <Star className="w-3 h-3" />}
            {roleMeta.label}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t.sidebar.logout}
        </button>
      </div>
    </aside>
  );
}
