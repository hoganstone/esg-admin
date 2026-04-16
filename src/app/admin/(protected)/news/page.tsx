'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Loader2, RefreshCw, Eye, EyeOff, Newspaper } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORIES = ['新聞', '公告', 'ESG報告', '活動', '媒體報導'];
const EMPTY = { title: '', slug: '', excerpt: '', content: '', coverImage: '', category: '新聞', published: false };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 60);
}

function ArticleModal({ article, onClose, onSave }: { article: Article | null; onClose: () => void; onSave: () => void }) {
  const isNew = !article;
  const [form, setForm] = useState(article
    ? { title: article.title, slug: article.slug, excerpt: article.excerpt ?? '', content: article.content, coverImage: article.coverImage ?? '', category: article.category, published: article.published }
    : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const ic = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3a7d3e] placeholder:text-gray-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) { setError('請填寫標題、Slug 和內容'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(isNew ? '/api/admin/news' : `/api/admin/news/${article.id}`,
        { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSave(); onClose();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '儲存失敗'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <h3 className="font-bold text-gray-900 dark:text-white">{isNew ? '新增文章' : '編輯文章'}</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['edit', 'preview'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${tab === t ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                  {t === 'edit' ? '編輯' : '預覽'}
                </button>
              ))}
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {tab === 'edit' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">標題 *</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: isNew ? slugify(e.target.value) : p.slug }))} placeholder="文章標題" className={ic} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Slug（URL）*</label>
                    <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))} placeholder="article-slug" className={`${ic} font-mono`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">類別</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={ic}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">封面圖片 URL（選填）</label>
                    <input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." className={ic} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">摘要（選填）</label>
                  <input value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="簡短描述..." className={ic} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">內容（Markdown）*</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={12} placeholder="支援 Markdown 格式..." className={`${ic} resize-none font-mono text-xs leading-relaxed`} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-[#3a7d3e]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">立即發布</span>
                </label>
              </>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {form.coverImage && <img src={form.coverImage} alt="cover" className="w-full rounded-xl mb-4 object-cover max-h-48" />}
                <h1 className="text-2xl font-bold">{form.title || '（未填標題）'}</h1>
                {form.excerpt && <p className="text-gray-500 italic">{form.excerpt}</p>}
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">{form.content || '（未填內容）'}</pre>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">取消</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#3a7d3e] text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<Article | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/news');
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
  };

  const togglePublish = async (a: Article) => {
    const res = await fetch(`/api/admin/news/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !a.published }) });
    if (res.ok) setArticles(prev => prev.map(x => x.id === a.id ? { ...x, published: !a.published, publishedAt: !a.published ? new Date().toISOString() : null } : x));
  };

  const stats = { total: articles.length, published: articles.filter(a => a.published).length, draft: articles.filter(a => !a.published).length };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">新聞管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">發布新聞、公告與 ESG 報導</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setModalTarget(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> 新增文章
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '總文章', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '已發布', value: stats.published, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '草稿', value: stats.draft, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Newspaper className={`w-5 h-5 ${s.color}`} />
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
        ) : articles.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>尚無文章</p>
            <button onClick={() => { setModalTarget(null); setModalOpen(true); }} className="mt-3 text-sm text-[#3a7d3e] hover:underline">+ 新增第一篇文章</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-3 text-left">標題</th>
                <th className="px-6 py-3 text-left">類別</th>
                <th className="px-6 py-3 text-left">Slug</th>
                <th className="px-6 py-3 text-left">狀態</th>
                <th className="px-6 py-3 text-left">發布時間</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {articles.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{a.title}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{a.excerpt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">{a.category}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{a.slug}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => togglePublish(a)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${a.published ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                      {a.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {a.published ? '已發布' : '草稿'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('zh-TW') : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {deleteId === a.id ? (
                        <>
                          <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 font-medium">確認</button>
                          <button onClick={() => setDeleteId(null)} className="text-xs text-gray-400">取消</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setModalTarget(a); setModalOpen(true); }} className="text-blue-500 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(a.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      {modalOpen && <ArticleModal article={modalTarget} onClose={() => setModalOpen(false)} onSave={fetch_} />}
    </div>
  );
}
