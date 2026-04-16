'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Plus, Pencil, Trash2, X, Save, Loader2, RefreshCw, BarChart2 } from 'lucide-react';

interface EsgMetric {
  id: string;
  year: number;
  category: string;
  label: string;
  value: number;
  unit: string;
  note: string | null;
}

const CATEGORIES = [
  { key: 'GHG', label: '溫室氣體排放', unit: '公噸CO₂e', color: '#3a7d3e' },
  { key: 'ENERGY', label: '能源消耗', unit: 'MWh', color: '#2563eb' },
  { key: 'WATER', label: '用水量', unit: '公噸', color: '#0891b2' },
  { key: 'WASTE', label: '廢棄物', unit: '公噸', color: '#d97706' },
  { key: 'GENDER_PAY', label: '薪酬比例（女/男）', unit: '%', color: '#7c3aed' },
  { key: 'FEMALE_RATIO', label: '女性員工比例', unit: '%', color: '#db2777' },
  { key: 'TRAINING', label: '員工培訓時數', unit: '小時/人', color: '#059669' },
  { key: 'CUSTOM', label: '自訂', unit: '', color: '#6b7280' },
];

const EMPTY_FORM = { year: new Date().getFullYear(), category: 'GHG', label: '', value: 0, unit: '', note: '' };

function MetricModal({
  metric, onClose, onSave,
}: { metric: EsgMetric | null; onClose: () => void; onSave: () => void }) {
  const isNew = !metric;
  const [form, setForm] = useState(metric
    ? { year: metric.year, category: metric.category, label: metric.label, value: metric.value, unit: metric.unit, note: metric.note ?? '' }
    : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCat = CATEGORIES.find(c => c.key === form.category);

  const handleCategoryChange = (cat: string) => {
    const found = CATEGORIES.find(c => c.key === cat);
    setForm(p => ({ ...p, category: cat, unit: found?.unit ?? p.unit, label: found?.label ?? p.label }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch(
        isNew ? '/api/admin/esg-metrics' : `/api/admin/esg-metrics/${metric.id}`,
        { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, value: Number(form.value) }) }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSave(); onClose();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '儲存失敗'); }
    finally { setSaving(false); }
  };

  const ic = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3a7d3e]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{isNew ? '新增數據' : '編輯數據'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">年份</label>
              <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">類別</label>
              <select value={form.category} onChange={e => handleCategoryChange(e.target.value)} className={ic}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">項目標籤</label>
            <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder={selectedCat?.label} className={ic} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">數值</label>
              <input type="number" step="any" value={form.value} onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">單位</label>
              <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder={selectedCat?.unit} className={ic} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">備註（選填）</label>
            <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className={ic} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">取消</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#3a7d3e] text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EsgDataPage() {
  const [metrics, setMetrics] = useState<EsgMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('GHG');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [modalTarget, setModalTarget] = useState<EsgMetric | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/esg-metrics');
    if (res.ok) setMetrics(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/esg-metrics/${id}`, { method: 'DELETE' });
    setMetrics(prev => prev.filter(m => m.id !== id));
    setDeleteId(null);
  };

  // Chart data: pivot by year
  const catMetrics = metrics.filter(m => m.category === activeCategory);
  const years = [...new Set(catMetrics.map(m => m.year))].sort();
  const labels = [...new Set(catMetrics.map(m => m.label))];
  const colors = ['#3a7d3e', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#059669'];
  const chartData = years.map(y => {
    const row: Record<string, number | string> = { year: y };
    labels.forEach(l => {
      const found = catMetrics.find(m => m.year === y && m.label === l);
      row[l] = found?.value ?? 0;
    });
    return row;
  });

  const activeCat = CATEGORIES.find(c => c.key === activeCategory);
  const ChartComp = chartType === 'bar' ? BarChart : LineChart;
  const DataComp = chartType === 'bar' ? Bar : Line;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ESG 數據管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理歷年 ESG 指標數據並預覽圖表</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setModalTarget(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> 新增數據
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.filter(c => c.key !== 'CUSTOM').map(cat => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat.key ? 'text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400'}`}
            style={activeCategory === cat.key ? { backgroundColor: cat.color } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#3a7d3e]" />
            {activeCat?.label} 趨勢圖
            {activeCat?.unit && <span className="text-xs text-gray-400 font-normal">（{activeCat.unit}）</span>}
          </h2>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['bar', 'line'] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${chartType === t ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {t === 'bar' ? '長條圖' : '折線圖'}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">此類別尚無數據，請新增資料</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ChartComp data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend />
              {labels.map((label, i) => (
                chartType === 'bar'
                  ? <Bar key={label} dataKey={label} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
                  : <Line key={label} type="monotone" dataKey={label} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              ))}
            </ChartComp>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">數據列表 · {activeCat?.label}</h2>
          <span className="text-xs text-gray-400">{catMetrics.length} 筆</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><RefreshCw className="w-4 h-4 animate-spin" /> 載入中...</div>
        ) : catMetrics.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">此類別尚無數據</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left">年份</th>
                <th className="px-6 py-3 text-left">項目</th>
                <th className="px-6 py-3 text-right">數值</th>
                <th className="px-6 py-3 text-left">單位</th>
                <th className="px-6 py-3 text-left">備註</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {catMetrics.sort((a, b) => b.year - a.year).map(m => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">{m.year}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{m.label}</td>
                  <td className="px-6 py-3 text-right font-semibold text-[#3a7d3e]">{m.value.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{m.unit}</td>
                  <td className="px-6 py-3 text-sm text-gray-400 max-w-[160px] truncate">{m.note ?? '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {deleteId === m.id ? (
                        <>
                          <span className="text-xs text-gray-500">確認刪除？</span>
                          <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 font-medium hover:underline">確認</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-gray-400 hover:underline">取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setModalTarget(m); setModalOpen(true); }} className="text-blue-500 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(m.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <MetricModal metric={modalTarget} onClose={() => setModalOpen(false)} onSave={fetch_} />}
    </div>
  );
}
