'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, Plus, Star, StarOff, Pencil, Trash2,
  X, RefreshCw, Eye, EyeOff, Save, Loader2,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  year: string | null;
  featured: boolean;
  active: boolean;
  image: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  title: '',
  category: '',
  description: '',
  tags: '',
  year: '',
  featured: false,
  active: true,
  image: '',
};

type FormState = typeof EMPTY_FORM;

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: Project | null; // null = new
  onClose: () => void;
  onSave: () => void;
}) {
  const isNew = !project;
  const [form, setForm] = useState<FormState>(
    project
      ? {
          title: project.title,
          category: project.category,
          description: project.description,
          tags: project.tags.join(', '),
          year: project.year ?? '',
          featured: project.featured,
          active: project.active,
          image: project.image ?? '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description) {
      setError('請填寫名稱、類別、說明');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        year: form.year || null,
        featured: form.featured,
        active: form.active,
        image: form.image || null,
      };
      const res = await fetch(
        isNew ? '/api/admin/projects' : `/api/admin/projects/${project.id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? '儲存失敗');
      onSave();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7d3e] placeholder:text-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {isNew ? '新增案例' : '編輯案例'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              案例名稱 <span className="text-red-400">*</span>
            </label>
            <input value={form.title} onChange={set('title')} placeholder="輸入案例名稱" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                類別 <span className="text-red-400">*</span>
              </label>
              <input value={form.category} onChange={set('category')} placeholder="如：碳盤查、ESG報告書" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">年份</label>
              <input value={form.year} onChange={set('year')} placeholder="2024" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              說明 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="案例說明..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              標籤 <span className="text-gray-400 font-normal">（逗號分隔）</span>
            </label>
            <input value={form.tags} onChange={set('tags')} placeholder="ISO 14064, 碳中和, 製造業" className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">圖片 URL（選填）</label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." className={inputClass} />
          </div>

          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#3a7d3e]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">設為精選</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 accent-[#3a7d3e]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">顯示於前台</span>
            </label>
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteModal({
  project,
  onClose,
  onDeleted,
}: {
  project: Project;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      onDeleted();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">確認刪除</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          確定要刪除「<span className="font-medium text-gray-700 dark:text-gray-300">{project.title}</span>」？此操作無法復原。
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            取消
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Project | null | 'new'>('new' as never);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/projects');
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openNew = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditTarget(p); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const toggleActive = async (p: Project) => {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) setProjects(prev => prev.map(x => x.id === p.id ? { ...x, active: !p.active } : x));
  };

  const toggleFeatured = async (p: Project) => {
    const res = await fetch(`/api/admin/projects/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !p.featured }),
    });
    if (res.ok) setProjects(prev => prev.map(x => x.id === p.id ? { ...x, featured: !p.featured } : x));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">案例管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理網站顯示的成功案例</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增案例
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin" /> 載入中...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3">案例名稱</th>
                  <th className="px-6 py-3">類別</th>
                  <th className="px-6 py-3">標籤</th>
                  <th className="px-6 py-3">年份</th>
                  <th className="px-6 py-3">精選</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{tag}</span>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{project.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{project.year ?? '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(project)}
                        title={project.featured ? '取消精選' : '設為精選'}
                        className="transition-transform hover:scale-110"
                      >
                        {project.featured
                          ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          : <StarOff className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(project)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          project.active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {project.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {project.active ? '顯示中' : '已隱藏'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(project)}
                          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          編輯
                        </button>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="flex items-center gap-1 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-gray-400 dark:text-gray-500">
                      <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>尚無案例資料</p>
                      <button onClick={openNew} className="mt-3 text-sm text-[#3a7d3e] hover:underline">
                        + 新增第一筆案例
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <ProjectModal
          project={editTarget as Project | null}
          onClose={closeModal}
          onSave={fetchProjects}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchProjects}
        />
      )}
    </div>
  );
}
