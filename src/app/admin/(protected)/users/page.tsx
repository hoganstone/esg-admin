import { prisma } from '@/lib/prisma';
import { Users, ShieldCheck, User } from 'lucide-react';

const roleColors: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-blue-100 text-blue-700',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
};

const roleLabels: Record<string, string> = {
  USER: '一般用戶',
  ADMIN: '管理員',
  SUPER_ADMIN: '超級管理員',
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用戶管理</h1>
          <p className="text-gray-500 mt-1">管理所有系統用戶與權限</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" />
          <div><div className="text-xl font-bold">{users.length}</div><div className="text-sm text-gray-500">總用戶數</div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-purple-500" />
          <div><div className="text-xl font-bold">{users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}</div><div className="text-sm text-gray-500">管理員</div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <User className="w-8 h-8 text-green-500" />
          <div><div className="text-xl font-bold">{users.filter(u => u.role === 'USER').length}</div><div className="text-sm text-gray-500">一般用戶</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">用戶</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">角色</th>
                <th className="px-6 py-3">註冊日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                        {user.name?.[0] ?? user.email?.[0] ?? '?'}
                      </div>
                      <span className="font-medium text-gray-900">{user.name ?? '未設定'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
