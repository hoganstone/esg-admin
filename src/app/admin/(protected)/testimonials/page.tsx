'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, Plus, Pencil, Trash2, X, RefreshCw,
  Eye, EyeOff, Save, Loader2, MessageSquare, User, Building2,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  image: string | null;
  active: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  name: '',
  position: '',
  company: '',
  content: '',
  rating: 5,
  image: '',
  active: true,
};

type FormState = typeof EMPTY_FORM;

// ─── Star Rating Input ────────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              n <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 self-center">{value} / 5</span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function TestimonialModal({
  testimonial,
  onClose,
  onSave,
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isNew = !testimonial;
  const [form, setForm] = useState<FormState>(
    testimonial
      ? {
          name: testimonial.name,
          position: testimonial.position,
          company: testimonial.company,
          content: testimonial.content,
          rating: testimonial.rating,
          image: testimonial.image ?? '',
          active: testimonial.active,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.position || !form.company || !form.content) {
      setError('請填寫姓名、職稱、公司與評論內容');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        position: form.position,
        company: form.company,
        content: form.content,
        rating: form.rating,
        image: form.image || null,
        active: form.active,
      };
      const res = await fetch(
        isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${testimonial.id}`,
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
            {isNew ? '新增客戶評論' : '編輯客戶評論'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> 姓名 <span className="text-red-400">*</span>
              </label>
              <input value={form.name} onChange={set('name')} placeholder="王小明" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                職稱 <span className="text-red-400">*</span>
              </label>
              <input value={form.position} onChange={set('position')} placeholder="永續長 / CSR 主任" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> 公司 <span className="text-red-400">*</span>
            </label>
            <input value={form.company} onChange={set('company')} placeholder="XX股份有限公司" className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> 評論內容 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={set('content')}
              rows={4}
              placeholder="請輸入客戶評論..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">評分</label>
            <StarInput value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
              頭像圖片 URL <span className="text-gray-400 font-normal">（選填）</span>
            </label>
            <input value={form.image} onChange={set('image')} placeholder="https://..." className={inputClass} />
          </div>

          <div>
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
  testimonial,
  onClose,
  onDeleted,
}: {
  testimonial: Testimonial;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: 'DELETE' });
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
          確定要刪除「<span className="font-medium text-gray-700 dark:text-gray-300">{testimonial.name}</span>」的評論？此操作無法復原。
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            取消
          </button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stars Display ────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<Testimonial | null | 'new'>('new' as never);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/testimonials');
    if (res.ok) setTestimonials(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const openNew = () => { setModalTarget(null); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setModalTarget(t); setModalOpen(true); };

  const toggleActive = async (t: Testimonial) => {
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !t.active }),
    });
    if (res.ok) setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, active: !t.active } : x));
  };

  const stats = {
    total: testimonials.length,
    active: testimonials.filter(t => t.active).length,
    avgRating: testimonials.length
      ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
      : '0',
    fiveStar: testimonials.filter(t => t.rating === 5).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">客戶評論</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理前台顯示的客戶評論與評分</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTestimonials}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#3a7d3e] hover:bg-[#5a9d5e] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增評論
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: '總評論數', value: stats.total, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: '顯示中', value: stats.active, icon: Eye, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: '平均評分', value: `${stats.avgRating} ★`, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: '5星評論', value: stats.fiveStar, icon: Star, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" /> 載入中...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-20 text-center text-gray-400 dark:text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>尚無客戶評論</p>
          <button onClick={openNew} className="mt-3 text-sm text-[#3a7d3e] hover:underline">
            + 新增第一筆評論
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div
              key={t.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${
                t.active
                  ? 'border-gray-100 dark:border-gray-700'
                  : 'border-dashed border-gray-200 dark:border-gray-600 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#3a7d3e]/10 flex items-center justify-center flex-shrink-0 text-[#3a7d3e] font-bold text-sm">
                  {t.image
                    ? <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    : t.name.charAt(0)
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.position} · {t.company}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                  t.active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {t.active ? '顯示' : '隱藏'}
                </span>
              </div>

              {/* Stars */}
              <Stars rating={t.rating} />

              {/* Content */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {t.content}
              </p>

              {/* Date */}
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(t.createdAt).toLocaleDateString('zh-TW')}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50 dark:border-gray-700">
                <button
                  onClick={() => toggleActive(t)}
                  className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-[#3a7d3e] dark:hover:text-[#5a9d5e] transition-colors"
                >
                  {t.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {t.active ? '隱藏' : '顯示'}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-auto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  編輯
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TestimonialModal
          testimonial={modalTarget as Testimonial | null}
          onClose={() => setModalOpen(false)}
          onSave={fetchTestimonials}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          testimonial={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={fetchTestimonials}
        />
      )}
    </div>
  );
}
