import { prisma } from '@/lib/prisma';
import { ShoppingCart, DollarSign, TrendingUp, XCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  PENDING: '待付款',
  PAID: '已付款',
  FAILED: '失敗',
  REFUNDED: '已退款',
  CANCELLED: '已取消',
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  const revenue = orders
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">訂單管理</h1>
        <p className="text-gray-500 mt-1">查看與管理所有付款訂單</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-blue-500" />
          <div><div className="text-xl font-bold">{orders.length}</div><div className="text-sm text-gray-500">總訂單</div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          <div><div className="text-xl font-bold">NT${revenue.toLocaleString()}</div><div className="text-sm text-gray-500">總營收</div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-500" />
          <div><div className="text-xl font-bold">{orders.filter(o => o.status === 'FAILED').length}</div><div className="text-sm text-gray-500">失敗訂單</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">所有訂單</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3">訂單編號</th>
                <th className="px-6 py-3">客戶</th>
                <th className="px-6 py-3">金額</th>
                <th className="px-6 py-3">狀態</th>
                <th className="px-6 py-3">日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-700">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user?.name ?? order.user?.email ?? '訪客'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">NT${order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">尚無訂單記錄</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
