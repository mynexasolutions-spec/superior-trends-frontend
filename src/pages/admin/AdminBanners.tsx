import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, X, AlertCircle, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useBannersAdmin, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } from '../../hooks/useBanners';
import { uploadImage } from '../../lib/api';

/* ─── Scroll-lock helpers ─────────────────────────────────────────────────── */
function lockScroll() { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = ''; }

export const AdminBanners: React.FC = () => {
 
  const { data: banners, isLoading, isError } = useBannersAdmin();

  const createMutation = useCreateBannerMutation();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  /* Form states */
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isFormOpen) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [isFormOpen]);

  const resetForm = () => {
    setImageUrl('');
    setActive(true);
    setEditingBanner(null);
    setIsFormOpen(false);
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl || '');
    setActive(banner.active);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (banner: any) => {
    try {
      await updateMutation.mutateAsync({
        id: banner.id,
        payload: { active: !banner.active },
      });
      showToast(`Banner ${!banner.active ? 'activated' : 'deactivated'} successfully`);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner image?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Banner deleted successfully');
    } catch {
      alert('Failed to delete banner');
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image first.');
      return;
    }

    const payload = {
      imageUrl,
      active,
    };

    try {
      if (editingBanner) {
        await updateMutation.mutateAsync({ id: editingBanner.id, payload });
        showToast('Banner updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        showToast('Banner created successfully');
      }
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadImage(file);
      setImageUrl(data.url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={28} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Loading Banners…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <p className="text-sm font-bold text-neutral-800">Unable to load banners</p>
        <p className="text-xs text-neutral-400 max-w-xs">
          The backend may be unreachable. Check your connection and try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 font-display">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8b1a2a]">Admin</span>
            <ChevronRight size={10} className="text-neutral-300" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Configuration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">
            Homepage Banners
          </h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            Manage the hero slideshow images on the storefront homepage. Upload, edit title, links, and toggle active status.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#6b1420] transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={14} />
          Add Banner
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-emerald-800">{successMsg}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Banners', value: banners?.length ?? 0, color: 'text-neutral-800' },
          { label: 'Active (Live)', value: banners?.filter((b: any) => b.active).length ?? 0, color: 'text-emerald-700' },
          { label: 'Inactive', value: banners?.filter((b: any) => !b.active).length ?? 0, color: 'text-neutral-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!banners?.length ? (
          <div className="col-span-full bg-white rounded-2xl border border-neutral-250 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <ImageIcon size={20} className="text-neutral-400" />
              </div>
              <p className="text-neutral-400 text-sm font-semibold">No banners uploaded yet</p>
              <p className="text-neutral-300 text-xs max-w-xs px-4">
                Click "Add Banner" to upload and display custom banner images in the homepage hero slider.
              </p>
            </div>
          </div>
        ) : (
          banners.map((banner: any) => (
            <div
              key={banner.id}
              className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-neutral-300 transition-all duration-300 flex flex-col"
            >
              {/* Image Container with Actions overlay */}
              <div className="relative aspect-[21/9] bg-neutral-100 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Active Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm ${banner.active
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-800/80 text-white'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${banner.active ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
                    {banner.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 truncate">
                    Banner Slide
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                    Image ID: {banner.id.slice(0, 8)}
                  </p>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between border-t border-neutral-100 mt-4 pt-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${banner.active
                      ? 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                      : 'text-[#8b1a2a] hover:bg-[#8b1a2a]/8 hover:text-[#8b1a2a]'
                      }`}
                  >
                    {banner.active ? (
                      <>
                        <EyeOff size={12} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye size={12} />
                        Activate
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(banner)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Banner"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-[#8b1a2a] hover:bg-red-50 transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal portal */}
      {isFormOpen && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-fade-in"
            onClick={resetForm}
          />

          {/* sheet */}
          <div className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh] overflow-hidden">
            {/* Signature banner accent line */}
            <div className="h-1 bg-gradient-to-r from-[#8b1a2a] via-[#c0364a] to-[#8b1a2a]" />

            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-neutral-900 uppercase tracking-tight">
                  {editingBanner ? 'Edit Banner Image' : 'Add New Banner'}
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {editingBanner ? 'Update link, text or toggle status' : 'Upload a high resolution banner for the hero carousel'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
                {/* Upload Image Section */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2">
                    Banner Image (Required)
                  </label>
                  {imageUrl ? (
                    <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-neutral-200 mb-3 group">
                      <img src={imageUrl} alt="Uploaded Banner" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#8b1a2a] hover:bg-[#8b1a2a]/3 transition-all">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-[#8b1a2a]" size={20} />
                      ) : (
                        <ImageIcon className="text-neutral-400" size={24} />
                      )}
                      <span className="text-xs font-semibold text-neutral-600">
                        {isUploading ? 'Uploading Image…' : 'Click to Upload Banner Image'}
                      </span>
                      <span className="text-[9px] text-neutral-400">Recommended size: 1920x820 pixels</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  )}
                </div>

                {/* Title & Link Inputs Removed */}

                {/* Toggle Active */}
                <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${active ? 'bg-[#8b1a2a]' : 'bg-neutral-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="sr-only" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Show immediately</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Activate banner and include in home hero slide rotations.</div>
                  </div>
                </label>
              </div>

              {/* footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors ml-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#8b1a2a] hover:bg-[#7a1725] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-[#8b1a2a]/30 active:scale-95"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="animate-spin" size={13} />
                  )}
                  {editingBanner ? 'Save changes' : 'Create banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ), document.body)}
    </div>
  );
};
