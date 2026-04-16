'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, DollarSign, Clock, CheckCircle, XCircle,
  RefreshCcw, ChevronDown, ChevronUp, Loader2, AlertTriangle,
  Package, User, Phone, Building2, MessageSquare, X,
} from 'lucide-react';

type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

interface OrderItem {
  name: string;
  // support both naming conventions
  unitPrice?: number;
  price?: number;
  qty?: number;
  quantity?: number;
}
interface OrderMeta {
  // support both naming conventions from API and seed
  customerName?: string; name?: string;
  customerEmail?: string; email?: string;
  customerPhone?: string; phone?: string;
  company?: string;
  note?: string; message?: string;
  adminNotes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  metadata: OrderMeta | null;
  user: { name: string | null; email: string | null } | null;
}

function itemPrice(item: OrderItem): number {
  return item.unitPrice ?? item.price ?? 0;
}
function itemQty(item: OrderItem): number {
  return item.qty ?? item.quantity ?? 1;
}
function metaName(meta: OrderMeta | null): string {
  return meta?.customerName ?? meta?.name ?? '';
}
function metaEmail(meta: OrderMeta | null): string {
  return meta?.customerEmail ?? meta?.email ?? '';
}
function metaPhone(meta: OrderMeta | null): string {
  return meta?.customerPhone ?? meta?.phone ?? '';
}
function metaNote(meta: OrderMeta | null): string {
  return meta?.note ?? meta?.message ?? '';
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:   { label: '待付款', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
  PAID:      { label: '已付款', color: 'text-green-700 dark:text-green-300',  bg: 'bg-green-100 dark:bg-green-900/30',  icon: CheckCircle },
  FAILED:    { label: '失敗',   color: 'text-red-700 dark:text-red-300',     bg: 'bg-red-100 dark:bg-red-900/30',     icon: XCircle },
  REFUNDED:  { label: '已退款', color: 'text-purple-700 dark:text-purple-300',bg: 'bg-purple-100 dark:bg-purple-900/30',icon: RefreshCcw },
  CANCELLED: { label: '已取消', color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-700',      icon: XCircle },
};

const FILTER_TABS: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL',       label: '全部' },
  { key: 'PENDING',   label: '待付款' },
  { key: 'PAID',      label: '已付款' },
  { key: 'FAILED',    label: '失敗' },
  { key: 'REFUNDED',  label: '已退款' },
  { key: 'CANCELLED', label: '已取消' },
];

function fmtMoney(n: number) {
  return `NT$${n.toLocaleString()}`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString('zh-TW', { hour12: false });
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onStatusUpdate }: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (id: string, status: OrderStatus, notes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.metadata?.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const meta = order.metadata;
  const sm = STATUS_META[status];
  const custName  = metaName(meta);
  const custEmail = metaEmail(meta);
  const custPhone = metaPhone(meta);
  const custNote  = metaNote(meta);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onStatusUpdate(order.id, status, notes);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '更新失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">訂單詳情</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">服務項目</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#3a7d3e]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <span className="text-xs text-gray-400">×{itemQty(item)}</span>
                  </div>
                  <span className="text-sm font-bold text-[#3a7d3e]">{fmtMoney(itemPrice(item))}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">合計</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{fmtMoney(order.amount)}</span>
            </div>
          </div>

          {/* Customer info */}
          {meta && (custName || custEmail) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">客戶資訊</h4>
              <div className="grid grid-cols-2 gap-2">
                {custName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{custName}</span>
                  </div>
                )}
                {custEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-4 h-4 flex-shrink-0 text-gray-400 text-xs">@</span>
                    <span className="truncate">{custEmail}</span>
                  </div>
                )}
                {custPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{custPhone}</span>
                  </div>
                )}
                {meta.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{meta.company}</span>
                  </div>
                )}
              </div>
              {custNote && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{custNote}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status update */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">更新狀態</h4>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
            >
              {(Object.keys(STATUS_META) as OrderStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>

            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${sm.bg} ${sm.color}`}>
              <sm.icon className="w-4 h-4" />
              {sm.label}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase block mb-2">備註</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="管理員備註（不對外顯示）"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (id: string, status: OrderStatus, notes: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, metadata: { ...o.metadata, adminNotes: notes } } : o));
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
  const revenue  = orders.filter(o => o.status === 'PAID').reduce((s, o) => s + o.amount, 0);
  const pending  = orders.filter(o => o.status === 'PENDING').length;
  const failed   = orders.filter(o => o.status === 'FAILED').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">訂單管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">查看與管理所有服務預約訂單</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '總訂單', value: orders.length, icon: ShoppingCart, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '總營收',  value: `NT$${revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '待付款', value: pending, icon: Clock,     color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: '失敗',   value: failed,  icon: XCircle,   color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit flex-wrap">
        {FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {tab.label}
            {tab.key !== 'ALL' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({orders.filter(o => o.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 w-8" />
                  <th className="px-6 py-3">訂單編號</th>
                  <th className="px-6 py-3">服務/客戶</th>
                  <th className="px-6 py-3">金額</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">日期</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(order => {
                  const sm = STATUS_META[order.status];
                  const meta = order.metadata;
                  const isExpanded = expandedId === order.id;
                  const customerName = metaName(meta) || order.user?.name || '訪客';
                  const serviceName = (order.items as OrderItem[])[0]?.name ?? '—';

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-3 py-4">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{serviceName}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{customerName}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {fmtMoney(order.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sm.bg} ${sm.color}`}>
                            <sm.icon className="w-3 h-3" />
                            {sm.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {fmtDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            詳情/編輯
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-gray-700/20">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              {metaEmail(meta) && (
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">Email</span>
                                  <span className="text-gray-700 dark:text-gray-300">{metaEmail(meta)}</span>
                                </div>
                              )}
                              {metaPhone(meta) && (
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">電話</span>
                                  <span className="text-gray-700 dark:text-gray-300">{metaPhone(meta)}</span>
                                </div>
                              )}
                              {meta?.company && (
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">公司</span>
                                  <span className="text-gray-700 dark:text-gray-300">{meta.company}</span>
                                </div>
                              )}
                              {meta?.adminNotes && (
                                <div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">備註</span>
                                  <span className="text-gray-700 dark:text-gray-300">{meta.adminNotes}</span>
                                </div>
                              )}
                              {metaNote(meta) && (
                                <div className="col-span-2">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">客戶留言</span>
                                  <span className="text-gray-700 dark:text-gray-300">{metaNote(meta)}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      尚無訂單記錄
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
