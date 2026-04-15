'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Leaf, LayoutDashboard, MessageSquare, Briefcase, FolderOpen,
  ShoppingCart, Users, Settings, LogOut, ChevronRight
} from 'lucide-react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const navItems = [
  { label: '儀表板', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: '諮詢管理', href: '/admin/inquiries', icon: MessageSquare },
  { label: '服務項目', href: '/admin/services', icon: Briefcase },
  { label: '案例管理', href: '/admin/projects', icon: FolderOpen },
  { label: '訂單管理', href: '/admin/orders', icon: ShoppingCart },
  { label: '用戶管理', href: '/admin/users', icon: Users },
  { label: '系統設定', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">ESG永續</div>
            <div className="text-xs text-gray-500">管理後台</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
            {user.name?.[0] ?? user.email?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name ?? '管理員'}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          登出
        </button>
      </div>
    </aside>
  );
}
