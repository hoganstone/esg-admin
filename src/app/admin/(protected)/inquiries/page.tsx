'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Clock, CheckCircle, ChevronDown, ChevronUp,
  RefreshCw, Send, X, AlertCircle, Search,
} from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  reply: string | null;
  repliedAt: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待處理',
  IN_PROGRESS: '處理中',
  RESOLVED: '已解決',
  CLOSED: '已關閉',
};

const FILTER_TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待處理' },
  { key: 'IN_PROGRESS', label: '處理中' },
  { key: 'RESOLVED', label: '已解決' },
  { key: 'CLOSED', label: '已關閉' },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalInquiry, setModalInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const openModal = (inq: Inquiry) => {
    setModalInquiry(inq);
    setReplyText(inq.reply ?? '');
    setNewStatus(inq.status);
    setSaveMsg('');
  };

  const closeModal = () => { setModalInquiry(null); setReplyText(''); setNewStatus(''); setSaveMsg(''); };

  const handleSave = async () => {
    if (!modalInquiry) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const body: Record<string, string> = {};
      if (newStatus !== modalInquiry.status) body.status = newStatus;
      if (replyText.trim() !== (modalInquiry.reply ?? '')) body.reply = replyText.trim();
      if (Object.keys(body).length === 0) { setSaveMsg('沒有變更'); setSaving(false); return; }

      const res = await fetch(`/api/admin/inquiries/${modalInquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('更新失敗');
      setSaveMsg('已儲存');
      await fetchInquiries();
      const updated = await fetch(`/api/admin/inquiries`).then(r => r.json()) as Inquiry[];
      const refreshed = updated.find(i => i.id === modalInquiry.id);
      if (refreshed) setModalInquiry(refreshed);
    } catch {
      setSaveMsg('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const filtered = inquiries.filter(i => {
    const matchStatus = filter === 'ALL' || i.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q) || (i.company ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    inProgress: inquiries.filter(i => i.status === 'IN_PROGRESS').length,
    resolved: inquiries.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">諮詢管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理所有客戶諮詢與問題回覆</p>
        </div>
        <button
          onClick={fetchInquiries}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新整理
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: '總諮詢', value: stats.total, icon: MessageSquare, color: 'text-blue-500' },
          { label: '待處理', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: '處理中', value: stats.inProgress, icon: AlertCircle, color: 'text-blue-400' },
          { label: '已解決', value: stats.resolved, icon: CheckCircle, color: 'text-green-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <s.icon className={`w-8 h-8 ${s.color}`} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-[#3a7d3e] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {tab.key !== 'ALL' && (
                <span className="ml-1.5 text-xs opacity-70">
                  {inquiries.filter(i => i.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋姓名、Email、主題..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3a7d3e]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" /> 載入中...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 dark:text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>尚無諮詢記錄</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.map(inq => (
              <div key={inq.id}>
                {/* Row */}
                <div
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#3a7d3e]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#3a7d3e]">{inq.name.charAt(0)}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">{inq.name}</span>
                        {inq.company && <span className="text-xs text-gray-400">· {inq.company}</span>}
                        {inq.reply && (
                          <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-medium rounded">已回覆</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{inq.subject}</div>
                    </div>
                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(inq.createdAt).toLocaleDateString('zh-TW')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[inq.status]}`}>
                        {STATUS_LABELS[inq.status]}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); openModal(inq); }}
                        className="px-3 py-1.5 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        回覆
                      </button>
                      {expandedId === inq.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    {/* Mobile */}
                    <div className="flex sm:hidden items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[inq.status]}`}>
                        {STATUS_LABELS[inq.status]}
                      </span>
                      {expandedId === inq.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === inq.id && (
                  <div className="px-6 pb-5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                    <div className="pt-4 grid sm:grid-cols-2 gap-6">
                      {/* Left: Contact info + message */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 text-xs">Email</span>
                            <div className="text-gray-700 dark:text-gray-300">{inq.email}</div>
                          </div>
                          {inq.phone && (
                            <div>
                              <span className="text-gray-400 text-xs">電話</span>
                              <div className="text-gray-700 dark:text-gray-300">{inq.phone}</div>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">諮詢主題</span>
                          <span className="inline-block px-2.5 py-1 bg-[#3a7d3e]/10 text-[#3a7d3e] dark:text-[#5a9d5e] rounded-lg text-sm font-medium">{inq.subject}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block mb-1">客戶訊息</span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                            {inq.message}
                          </p>
                        </div>
                      </div>
                      {/* Right: Reply section */}
                      <div className="space-y-3">
                        {inq.reply ? (
                          <div>
                            <span className="text-gray-400 text-xs block mb-1">
                              已回覆 · {inq.repliedAt ? new Date(inq.repliedAt).toLocaleString('zh-TW') : ''}
                            </span>
                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-800">
                              {inq.reply}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 dark:text-gray-500 italic">尚未回覆</div>
                        )}
                        <button
                          onClick={() => openModal(inq)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {inq.reply ? '修改回覆' : '撰寫回覆'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {modalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">回覆諮詢</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{modalInquiry.name} · {modalInquiry.subject}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Original message */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">客戶訊息</p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {modalInquiry.message}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">狀態</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7d3e]"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Reply */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">回覆內容</label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={6}
                  placeholder="輸入回覆內容..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7d3e] resize-none placeholder:text-gray-400"
                />
              </div>

              {saveMsg && (
                <div className={`px-4 py-2 rounded-lg text-sm ${saveMsg === '已儲存' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                  {saveMsg}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {saving ? '儲存中...' : '儲存回覆'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
