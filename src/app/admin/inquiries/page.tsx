import { prisma } from '@/lib/prisma';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusLabels: Record<string, string> = {
  PENDING: '待處理',
  IN_PROGRESS: '處理中',
  RESOLVED: '已解決',
  CLOSED: '已關閉',
};

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    resolved: inquiries.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">諮詢管理</h1>
        <p className="text-gray-500 mt-1">管理所有客戶諮詢與問題</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">總諮詢</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <Clock className="w-8 h-8 text-yellow-500" />
          <div>
            <div className="text-xl font-bold">{stats.pending}</div>
            <div className="text-sm text-gray-500">待處理</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <div className="text-xl font-bold">{stats.resolved}</div>
            <div className="text-sm text-gray-500">已解決</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">所有諮詢</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">姓名</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">公司</th>
                <th className="px-6 py-3">主題</th>
                <th className="px-6 py-3">狀態</th>
                <th className="px-6 py-3">日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{inquiry.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{inquiry.email}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{inquiry.company ?? '-'}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm max-w-[200px] truncate">{inquiry.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[inquiry.status]}`}>
                      {statusLabels[inquiry.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(inquiry.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">尚無諮詢記錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
