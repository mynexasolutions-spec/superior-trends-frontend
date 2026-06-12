import React, { useState, useEffect } from 'react';
import { useBlogCategories, useBlogCategoryMutations } from '../../hooks/useBlogCategories';
import { Plus, Trash2, Edit2, Loader2, FolderTree, X, Tag } from 'lucide-react';
import type { BlogCategory } from '../../lib/api';

/* ─── Scroll-lock helpers ─────────────────────────────────────────────────── */
const lockedElements: { el: HTMLElement; prevOverflowY: string }[] = [];

function lockScroll() {
  if (lockedElements.length > 0) unlockScroll();
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el.closest('[data-modal-scroll]')) return;
    const style = window.getComputedStyle(el);
    const isScrollable =
      ['auto', 'scroll', 'overlay'].includes(style.overflowY) ||
      ['auto', 'scroll', 'overlay'].includes(style.overflow);
    if (isScrollable && el.scrollHeight > el.clientHeight) {
      lockedElements.push({ el, prevOverflowY: el.style.overflowY });
      el.style.overflowY = 'hidden';
    }
  });
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

function unlockScroll() {
  lockedElements.forEach(({ el, prevOverflowY }) => {
    el.style.overflowY = prevOverflowY;
  });
  lockedElements.length = 0;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export const AdminBlogCategories: React.FC = () => {
  const { data: categories, isLoading } = useBlogCategories();
  const { create, update, remove } = useBlogCategoryMutations();

  const [isFormOpen, setIsFormOpen]           = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [name, setName]                       = useState('');
  const [slug, setSlug]                       = useState('');

  /* scroll lock */
  useEffect(() => {
    if (isFormOpen) lockScroll();
    else            unlockScroll();
    return ()      => unlockScroll();
  }, [isFormOpen]);

  const resetForm = () => {
    setName(''); setSlug(''); setEditingCategory(null); setIsFormOpen(false);
  };

  const handleEditClick = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = { name: name.trim(), slug: slug.trim() || undefined };
    try {
      if (editingCategory) await update.mutateAsync({ id: editingCategory.id, payload });
      else                  await create.mutateAsync(payload);
      resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to save category';
      alert(message || 'Failed to save category');
    }
  };

  const pending = create.isPending || update.isPending;

  /* stats */
  const total      = categories?.length ?? 0;
  const totalPosts = categories?.reduce((s, c) => s + (c._count?.posts ?? 0), 0) ?? 0;

  const inputCls =
    'w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/20 focus:border-[#8b1a2a] ' +
    'transition-all placeholder:text-neutral-300';

  return (
    <>
      <div className="space-y-6 px-1">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderTree size={20} className="text-[#8b1a2a]" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Blog Categories</h1>
            </div>
            <p className="text-sm text-neutral-500">Organize style journal posts under distinct categories.</p>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7a1725] active:scale-95 transition-all shadow-sm shadow-[#8b1a2a]/30 whitespace-nowrap"
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
            <div className="text-2xl font-bold text-neutral-800">{total}</div>
            <div className="text-[11px] text-neutral-400 font-medium mt-0.5">Categories</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
            <div className="text-2xl font-bold text-[#8b1a2a]">{totalPosts}</div>
            <div className="text-[11px] text-neutral-400 font-medium mt-0.5">Posts linked</div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-[#8b1a2a]" size={22} />
            <span className="text-sm">Loading categories…</span>
          </div>
        ) : !categories?.length ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 bg-white rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <FolderTree size={22} className="text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-600">No categories yet</p>
            <p className="text-xs text-neutral-400 mt-1">Create your first category to start organizing posts.</p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Category</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:table-cell">Slug</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Posts</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-neutral-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#8b1a2a]/8 flex items-center justify-center shrink-0">
                            <Tag size={12} className="text-[#8b1a2a]" />
                          </div>
                          <span className="text-sm font-semibold text-neutral-800">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          (cat._count?.posts ?? 0) > 0
                            ? 'bg-[#8b1a2a]/8 text-[#8b1a2a] border-[#8b1a2a]/20'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}>
                          {cat._count?.posts ?? 0} {cat._count?.posts === 1 ? 'post' : 'posts'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleEditClick(cat)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Delete "${cat.name}"? Posts in this category will become uncategorized.`)) {
                                try { await remove.mutateAsync(cat.id); }
                                catch { alert('Failed to delete category'); }
                              }
                            }}
                            className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={resetForm} />

          {/* card */}
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editingCategory ? `Editing "${editingCategory.name}"` : 'Add a new blog category'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* form body */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div data-modal-scroll className="px-6 py-6 space-y-5 overflow-y-auto overscroll-contain">

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Category name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Editorial, Trends, Lookbook"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputCls}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Slug <span className="normal-case font-normal text-neutral-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated-from-name"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className={inputCls + ' font-mono'}
                  />
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                    Leave blank to auto-generate from the name.
                  </p>
                </div>

                {/* Preview chip */}
                {name.trim() && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Preview:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8b1a2a]/8 text-[#8b1a2a] border border-[#8b1a2a]/20 text-xs font-semibold">
                      <Tag size={10} />
                      {name.trim()}
                    </span>
                  </div>
                )}
              </div>

              {/* footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8b1a2a] hover:bg-[#7a1725] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-[#8b1a2a]/30 active:scale-95"
                >
                  {pending && <Loader2 className="animate-spin" size={15} />}
                  {editingCategory ? 'Save changes' : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};