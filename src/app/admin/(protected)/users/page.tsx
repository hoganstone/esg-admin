'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShieldCheck, User, Edit2, Trash2, Plus, X, Eye, EyeOff,
  Loader2, Monitor, LogIn, LogOut, Clock, Globe, ChevronDown, ChevronUp,
  AlertTriangle,
} from 'lucide-react';

type Role = 'USER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  lastLoginAt: string | null;
  createdAt: string;
  loginRecords: { loginAt: string; logoutAt: string | null; ipAddress: string | null }[];
}

interface LoginRecord {
  id: string;
  userId: string;
  loginAt: string;
  logoutAt: string | null;
  onlineSec: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  user: { name: string | null; email: string; role: Role };
}

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: '超級管理員', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  ADMIN:       { label: 'ESG管理員',  color: 'text-blue-700 dark:text-blue-300',   bg: 'bg-blue-100 dark:bg-blue-900/40' },
  EDITOR:      { label: '編輯人員',   color: 'text-green-700 dark:text-green-300',  bg: 'bg-green-100 dark:bg-green-900/40' },
  USER:        { label: '一般用戶',   color: 'text-gray-700 dark:text-gray-300',    bg: 'bg-gray-100 dark:bg-gray-700' },
};

const ROLE_PERMS: Record<Role, string[]> = {
  SUPER_ADMIN: ['全部功能、用戶管理、系統設定、無限制操作'],
  ADMIN:       ['儀表板、服務管理、案例管理、用戶管理、訂單、詢問'],
  EDITOR:      ['儀表板、服務管理、案例管理、客戶評論、詢問（唯讀）'],
  USER:        ['無後台存取權限（前台一般用戶）'],
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('zh-TW', { hour12: false });
}

function fmtOnline(sec: number | null) {
  if (sec == null) return '—';
  if (sec < 60) return `${sec} 秒`;
  if (sec < 3600) return `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`;
  return `${Math.floor(sec / 3600)} 小時 ${Math.floor((sec % 3600) / 60)} 分`;
}

// ─── Modals ──────────────────────────────────────────────────────────────────

interface UserFormProps {
  initial?: Partial<UserRow>;
  onSave: (data: { name: string; email: string; password: string; role: Role }) => Promise<void>;
  onClose: () => void;
  isEdit?: boolean;
}

function UserFormModal({ initial, onSave, onClose, isEdit }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(initial?.role ?? 'USER');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPerms, setShowPerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave({ name, email, password, role });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? '編輯用戶' : '新增用戶'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">姓名</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="王小明" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required type="email"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="user@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              密碼{isEdit && <span className="text-gray-400 ml-1 font-normal">（留空則不修改）</span>}
            </label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)}
                required={!isEdit} type={showPwd ? 'text' : 'password'}
                minLength={isEdit && password === '' ? undefined : 6}
                className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={isEdit ? '留空表示不修改' : '至少 6 個字元'} />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">角色</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              {(Object.keys(ROLE_META) as Role[]).map(r => (
                <option key={r} value={r}>{ROLE_META[r].label}</option>
              ))}
            </select>
            {/* Permissions preview */}
            <button type="button" onClick={() => setShowPerms(p => !p)}
              className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              {showPerms ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              查看此角色權限
            </button>
            {showPerms && (
              <div className="mt-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                {ROLE_PERMS[role].map(p => <p key={p}>• {p}</p>)}
              </div>
            )}
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              取消
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? '儲存變更' : '新增用戶'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ user, onConfirm, onClose }: { user: UserRow; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : '刪除失敗'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">確認刪除用戶</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          即將刪除：<span className="font-semibold text-gray-900 dark:text-white">{user.name ?? user.email}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">此操作無法復原，所有相關資料將一併刪除。</p>
        {error && <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [tab, setTab] = useState<'users' | 'records'>('users');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  const fetchRecords = useCallback(async () => {
    const res = await fetch('/api/admin/session');
    if (res.ok) setRecords(await res.json());
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRecords();
  }, [fetchUsers, fetchRecords]);

  const handleAdd = async (data: { name: string; email: string; password: string; role: Role }) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setShowAdd(false);
    fetchUsers();
  };

  const handleEdit = async (data: { name: string; email: string; password: string; role: Role }) => {
    if (!editUser) return;
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setEditUser(null);
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setDeleteUser(null);
    fetchUsers();
    fetchRecords();
  };

  const filteredUsers = filterRole === 'ALL' ? users : users.filter(u => u.role === filterRole);

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length,
    editor: users.filter(u => u.role === 'EDITOR').length,
    user: users.filter(u => u.role === 'USER').length,
  };

  const onlineNow = records.filter(r => !r.logoutAt && new Date(r.loginAt) > new Date(Date.now() - 30 * 60 * 1000)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">用戶管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理系統用戶、角色與登入記錄</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          新增用戶
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: '總用戶數', value: stats.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'ESG管理員', value: stats.admin, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '編輯人員', value: stats.editor, icon: Edit2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '一般用戶', value: stats.user, icon: User, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-700/50' },
          { label: '目前在線', value: onlineNow, icon: Monitor, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {[{ key: 'users', label: '用戶列表' }, { key: 'records', label: '登入記錄' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as 'users' | 'records')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Filter bar */}
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">篩選角色：</span>
            {(['ALL', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'] as const).map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterRole === r ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                {r === 'ALL' ? '全部' : ROLE_META[r].label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3">用戶</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">角色</th>
                    <th className="px-6 py-3">最後登入</th>
                    <th className="px-6 py-3">最後 IP</th>
                    <th className="px-6 py-3">註冊日期</th>
                    <th className="px-6 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filteredUsers.map(u => {
                    const meta = ROLE_META[u.role];
                    const lastRecord = u.loginRecords[0];
                    const isOnline = lastRecord && !lastRecord.logoutAt &&
                      new Date(lastRecord.loginAt) > new Date(Date.now() - 30 * 60 * 1000);
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-sm">
                                {u.name?.[0] ?? u.email?.[0] ?? '?'}
                              </div>
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{u.name ?? '未設定'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {u.lastLoginAt ? fmtDate(u.lastLoginAt) : '從未登入'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {lastRecord?.ipAddress ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => setEditUser(u)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                              編輯
                            </button>
                            <button onClick={() => setDeleteUser(u)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        無符合條件的用戶
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Login Records Tab */}
      {tab === 'records' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">最近 200 筆登入記錄，依登入時間降序排列</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3">用戶</th>
                  <th className="px-6 py-3">角色</th>
                  <th className="px-6 py-3"><div className="flex items-center gap-1"><LogIn className="w-3.5 h-3.5" />登入時間</div></th>
                  <th className="px-6 py-3"><div className="flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />登出時間</div></th>
                  <th className="px-6 py-3"><div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />在線時長</div></th>
                  <th className="px-6 py-3"><div className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />IP 位置</div></th>
                  <th className="px-6 py-3">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {records.map(r => {
                  const meta = ROLE_META[r.user.role];
                  const isActive = !r.logoutAt && new Date(r.loginAt) > new Date(Date.now() - 30 * 60 * 1000);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{r.user.name ?? '—'}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{r.user.email}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{fmtDate(r.loginAt)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{r.logoutAt ? fmtDate(r.logoutAt) : '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{fmtOnline(r.onlineSec)}</td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-500 dark:text-gray-400">{r.ipAddress ?? '—'}</td>
                      <td className="px-6 py-3">
                        {isActive ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            在線中
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">已離線</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                      <Monitor className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      尚無登入記錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <UserFormModal onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {editUser && (
        <UserFormModal isEdit initial={editUser} onSave={handleEdit} onClose={() => setEditUser(null)} />
      )}
      {deleteUser && (
        <DeleteModal user={deleteUser} onConfirm={handleDelete} onClose={() => setDeleteUser(null)} />
      )}
    </div>
  );
}
