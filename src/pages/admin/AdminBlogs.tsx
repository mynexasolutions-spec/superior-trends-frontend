import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit2, Loader2, FileText, Upload, ExternalLink, X, BookOpen } from 'lucide-react';
import { useAdminBlogs, useBlogMutations } from '../../hooks/useBlogs';
import { uploadImage } from '../../lib/api';
import type { BlogPost } from '../../lib/blogTypes';

/* ─── Scroll-lock helpers ─────────────────────────────────────────────────── */
const lockedElements: { el: HTMLElement; prevOverflowY: string }[] = [];

function lockScroll() {
  // Clear any previous lock first to avoid duplicates on re-renders
  if (lockedElements.length > 0) unlockScroll();

  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    // Skip elements inside the modal (they manage their own scroll)
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

/* ─── Constants ───────────────────────────────────────────────────────────── */
const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tag: 'Editorial',
  readMinutes: 5,
  isPublished: false,
};

const TAGS = ['Editorial', 'Style Guide', 'Trends', 'Behind the Scenes', 'Lookbook', 'News'];

/* ─── Component ───────────────────────────────────────────────────────────── */
export const AdminBlogs: React.FC = () => {
  const { data: posts, isLoading } = useAdminBlogs();
  const { create, update, remove } = useBlogMutations();
  const fileRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing]       = useState<BlogPost | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [uploading, setUploading]   = useState(false);

  /* scroll lock */
  useEffect(() => {
    if (isFormOpen) lockScroll();
    else            unlockScroll();
    return ()      => unlockScroll();
  }, [isFormOpen]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); setIsFormOpen(false); };

  const openCreate = () => { setForm(emptyForm); setEditing(null); setIsFormOpen(true); };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title:       post.title,
      slug:        post.slug,
      excerpt:     post.excerpt,
      content:     post.content || '',
      coverImage:  post.coverImage || '',
      tag:         post.tag || 'Editorial',
      readMinutes: post.readMinutes,
      isPublished: post.isPublished ?? false,
    });
    setIsFormOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm(f => ({ ...f, coverImage: url }));
    } catch {
      alert('Cover image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) return;
    const payload = {
      title:       form.title.trim(),
      slug:        form.slug.trim() || undefined,
      excerpt:     form.excerpt.trim(),
      content:     form.content.trim(),
      coverImage:  form.coverImage.trim() || undefined,
      tag:         form.tag.trim() || 'Editorial',
      readMinutes: form.readMinutes,
      isPublished: form.isPublished,
    };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, payload });
      else         await create.mutateAsync(payload);
      resetForm();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to save blog';
      alert(msg);
    }
  };

  const pending = create.isPending || update.isPending;

  /* stats */
  const total     = posts?.length ?? 0;
  const published = posts?.filter(p => p.isPublished).length ?? 0;
  const drafts    = total - published;

  /* ── Shared field styles ── */
  const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/20 focus:border-[#8b1a2a] transition-all placeholder:text-neutral-300';
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{children}</label>
  );

  return (
    <>
      <div className="space-y-6 px-1">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={20} className="text-[#8b1a2a]" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Blog Posts</h1>
            </div>
            <p className="text-sm text-neutral-500">Create and publish stories for the Style Journal.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7a1725] active:scale-95 transition-all shadow-sm shadow-[#8b1a2a]/30 whitespace-nowrap"
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total posts', value: total,     color: 'text-neutral-800' },
            { label: 'Published',   value: published, color: 'text-emerald-700' },
            { label: 'Drafts',      value: drafts,    color: 'text-amber-600'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-neutral-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Posts table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-[#8b1a2a]" size={22} />
            <span className="text-sm">Loading posts…</span>
          </div>
        ) : !posts?.length ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 bg-white rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-600">No blog posts yet</p>
            <p className="text-xs text-neutral-400 mt-1">Click "New Post" to write your first story.</p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Post</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:table-cell">Tag</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden md:table-cell">Read time</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {posts.map((post: BlogPost) => (
                    <tr key={post.id} className="hover:bg-neutral-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {post.coverImage
                            ? <img src={post.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0" />
                            : <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0"><FileText size={16} className="text-neutral-400" /></div>
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 truncate max-w-[260px]">{post.title}</p>
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate max-w-[260px]">{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md">
                          {post.tag || 'Editorial'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-neutral-500">{post.readMinutes} min</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${post.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${post.isPublished ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {post.isPublished && (
                            <a
                              href={`/blogs/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg text-neutral-400 hover:text-[#8b1a2a] hover:bg-[#8b1a2a]/5 transition-colors"
                              title="View on site"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(post)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { if (confirm('Delete this post?')) remove.mutate(post.id); }}
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

      {/* ── Modal — portal so it escapes sidebar transform stacking context ── */}
      {isFormOpen && createPortal((
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={resetForm} />

          {/* sheet */}
          <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90dvh] overflow-hidden">

            {/* sticky header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{editing ? 'Edit Post' : 'New Post'}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{editing ? `Editing "${editing.title}"` : 'Write a new blog post for the Style Journal'}</p>
              </div>
              <button onClick={resetForm} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200">
                <X size={18} />
              </button>
            </div>

            {/* scrollable body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-5">

                {/* Title + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Label>Title *</Label>
                    <input
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                      placeholder="Your post headline"
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug (optional)</Label>
                    <input
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      className={inputCls + ' font-mono'}
                      placeholder="auto-from-title"
                    />
                  </div>
                </div>

                {/* Tag + Read time */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <Label>Tag</Label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, tag: t })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.tag === t ? 'bg-[#8b1a2a] text-white border-[#8b1a2a]' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Read time (min)</Label>
                    <input
                      type="number"
                      min={1}
                      value={form.readMinutes}
                      onChange={e => setForm({ ...form, readMinutes: Number(e.target.value) || 5 })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <Label>Excerpt *</Label>
                  <textarea
                    value={form.excerpt}
                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                    rows={2}
                    className={inputCls + ' resize-none'}
                    placeholder="A short summary shown on the blog listing page"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <Label>Content * &nbsp;<span className="normal-case font-normal text-neutral-300">use ## for headings, blank line between paragraphs</span></Label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    rows={14}
                    className={inputCls + ' font-mono resize-y min-h-[200px]'}
                    placeholder="Write your post content here…"
                    required
                  />
                </div>

                {/* Cover image */}
                <div>
                  <Label>Cover image</Label>
                  <div className="flex gap-3 items-stretch">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:border-neutral-300 bg-white transition-colors whitespace-nowrap disabled:opacity-60"
                    >
                      {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      {uploading ? 'Uploading…' : 'Upload'}
                    </button>
                    <input
                      value={form.coverImage}
                      onChange={e => setForm({ ...form, coverImage: e.target.value })}
                      className={inputCls}
                      placeholder="Or paste an image URL"
                    />
                  </div>
                  {form.coverImage && (
                    <div className="mt-3 relative inline-block">
                      <img src={form.coverImage} alt="" className="h-36 w-auto rounded-xl object-cover border border-neutral-200" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow text-neutral-500 hover:text-red-500 flex items-center justify-center transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Publish toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-[#8b1a2a]' : 'bg-neutral-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="sr-only" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-800">Publish on storefront</div>
                    <div className="text-[11px] text-neutral-400">{form.isPublished ? 'Post is live and visible to readers' : 'Saved as draft — not visible to readers'}</div>
                  </div>
                </label>
              </div>

              {/* sticky footer */}
              <div className="shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t border-neutral-100 bg-white">
                <div className="text-xs text-neutral-400 hidden sm:block">
                  {editing ? `Editing post ID: ${editing.id.slice(0, 8)}…` : 'New post'}
                </div>
                <div className="flex gap-3 ml-auto">
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
                    {pending ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ), document.body)}
    </>
  );
};