import { prisma } from '@/lib/prisma';
import { Users, MessageSquare, FolderOpen, ShoppingCart, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

async function getStats() {
  const [users, inquiries, projects, orders, pendingInquiries, paidOrders] = await Promise.all([
    prisma.user.count(),
    prisma.inquiry.count(),
    prisma.project.count(),
    prisma.order.count(),
    prisma.inquiry.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
  ]);

  return { users, inquiries, projects, orders, pendingInquiries, revenue: paidOrders._sum.amount ?? 0 };
}

async function getRecentInquiries() {
  return prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  PENDING: '待處理',
  IN_PROGRESS: '處理中',
  RESOLVED: '已解決',
  CLOSED: '已關閉',
};

export default async function DashboardPage() {
  const [stats, recentInquiries] = await Promise.all([
    getStats(),
    getRecentInquiries(),
  ]);

  const statCards = [
    { label: '總用戶數', value: stats.users, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: '諮詢表單', value: stats.inquiries, icon: MessageSquare, color: 'bg-green-500', change: '+8%' },
    { label: '專案案例', value: stats.projects, icon: FolderOpen, color: 'bg-purple-500', change: '+3%' },
    { label: '總營收(TWD)', value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-500', change: '+25%' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
        <p className="text-gray-500 mt-1">ESG永續發展網站管理概覽</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {card.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">{stats.pendingInquiries}</div>
              <div className="text-sm text-yellow-600">待處理諮詢</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">{stats.orders}</div>
              <div className="text-sm text-green-600">總訂單數</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-700">{stats.projects}</div>
              <div className="text-sm text-purple-600">案例展示</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">最新諮詢</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">姓名</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">主題</th>
                <th className="px-6 py-3">狀態</th>
                <th className="px-6 py-3">時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{inquiry.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{inquiry.email}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm truncate max-w-[200px]">{inquiry.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                      {statusLabels[inquiry.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(inquiry.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                </tr>
              ))}
              {recentInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">尚無諮詢記錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
