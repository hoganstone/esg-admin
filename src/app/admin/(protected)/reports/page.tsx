'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Save, Loader2, RefreshCw, FileText, Upload, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  year: number;
  fileUrl: string;
  fileSize: number | null;
  category: string;
  published: boolean;
  createdAt: string;
}

const CATEGORIES = ['ESG報告書', '永續報告書', '氣候相關財務揭露', '供應鏈報告', '其他'];
const EMPTY = { title: '', year: new Date().getFullYear(), fileUrl: '', fileSize: null as number | null, category: 'ESG報告書', published: true };

function fmtSize(bytes: number | null) {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ReportModal({ report, onClose, onSave }: { report: Report | null; onClose: () => void; onSave: () => void }) {
  const isNew = !report;
  const [form, setForm] = useState(report
    ? { title: report.title, year: report.year, fileUrl: report.fileUrl, fileSize: report.fileSize, category: report.category, published: report.published }
    : EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const ic = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3a7d3e] placeholder:text-gray-400';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setForm(p => ({ ...p, fileUrl: json.url, fileSize: json.size }));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '上傳失敗'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fileUrl) { setError('請填寫標題並上傳檔案'); return; }
    setSaving(true); setError('');
    try {
      const body = { ...form, fileSize: form.fileSize ?? undefined };
      const res = await fetch(isNew ? '/api/admin/reports' : `/api/admin/reports/${report!.id}`,
        { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSave(); onClose();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '儲存失敗'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{isNew ? '新增報告' : '編輯報告'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">報告標題 *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="2024 ESG永續報告書" className={ic} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">年份 *</label>
              <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) || p.year }))} min={2000} max={2100} className={ic} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">類別</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={ic}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">PDF 檔案 *</label>
            <div className="space-y-2">
              <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'border-gray-200 text-gray-300' : 'border-[#3a7d3e]/40 hover:border-[#3a7d3e] text-[#3a7d3e] hover:bg-[#3a7d3e]/5'}`}>
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> 上傳中...</> : <><Upload className="w-4 h-4" /> 點擊上傳 PDF</>}
                <input type="file" accept=".pdf" className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
              {form.fileUrl && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm">
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-400 truncate flex-1 text-xs">{form.fileUrl.split('/').pop()}</span>
                  <span className="text-green-600 text-xs flex-shrink-0">{fmtSize(form.fileSize)}</span>
                  <a href={form.fileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 text-green-600" /></a>
                </div>
              )}
              <p className="text-xs text-gray-400">或直接輸入 URL：</p>
              <input value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." className={ic} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-[#3a7d3e]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">公開發布（前台可下載）</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">取消</button>
            <button type="submit" disabled={saving || uploading} className="flex-1 py-2.5 bg-[#3a7d3e] text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reports');
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
    setReports(prev => prev.filter(r => r.id !== id));
    setDeleteId(null);
  };

  const togglePublish = async (r: Report) => {
    const res = await fetch(`/api/admin/reports/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !r.published }) });
    if (res.ok) setReports(prev => prev.map(x => x.id === r.id ? { ...x, published: !r.published } : x));
  };

  const stats = {
    total: reports.length,
    published: reports.filter(r => r.published).length,
    years: [...new Set(reports.map(r => r.year))].length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">報告管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">上傳與管理 ESG 報告書 PDF</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setModalTarget(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> 新增報告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '總報告', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '已發布', value: stats.published, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '涵蓋年份', value: stats.years, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <FileText className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin" /> 載入中...</div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>尚無報告</p>
            <button onClick={() => { setModalTarget(null); setModalOpen(true); }} className="mt-3 text-sm text-[#3a7d3e] hover:underline">+ 新增第一份報告</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left">報告名稱</th>
                <th className="px-6 py-3 text-left">年份</th>
                <th className="px-6 py-3 text-left">類別</th>
                <th className="px-6 py-3 text-left">大小</th>
                <th className="px-6 py-3 text-left">狀態</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">{r.year}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">{r.category}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{fmtSize(r.fileSize)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => togglePublish(r)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${r.published ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                      {r.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {r.published ? '已發布' : '草稿'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {deleteId === r.id ? (
                        <>
                          <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 font-medium">確認</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-gray-400">取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setModalTarget(r); setModalOpen(true); }} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-lg">編輯</button>
                          <button onClick={() => setDeleteId(r.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      {modalOpen && <ReportModal report={modalTarget} onClose={() => setModalOpen(false)} onSave={fetch_} />}
    </div>
  );
}
