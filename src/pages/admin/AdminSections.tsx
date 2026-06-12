import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, GripVertical, LayoutGrid, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAdminSections, useProducts } from '../../hooks/useProducts';
import { createSection, updateSection, deleteSection, uploadImage } from '../../lib/api';

export const SECTION_LAYOUT_TYPES = [
  { value: 'COLLECTIONS', label: 'Collections scroll', desc: 'Small cards · Our Collections style' },
  { value: 'CAROUSEL',    label: 'Product carousel',   desc: 'Horizontal · Accessories style' },
  { value: 'SPLIT',       label: 'Two split boxes',     desc: 'Left + right promo banners' },
  { value: 'DEPARTMENTS', label: 'Department cards',    desc: 'Large tiles · Shop by Department' },
] as const;

/* ─── Scroll-lock helpers ─────────────────────────────────────────────────── */
function lockScroll()   { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = '';        }

export const AdminSections: React.FC = () => {
  const queryClient  = useQueryClient();
  const { data: sections,    isLoading: isLoadingSections  } = useAdminSections();
  const { data: allProducts, isLoading: isLoadingProducts  } = useProducts({ admin: true });

  const [isFormOpen,      setIsFormOpen]      = useState(false);
  const [editingSection,  setEditingSection]  = useState<any | null>(null);

  /* form fields */
  const [title,                setTitle]                = useState('');
  const [type,                 setType]                 = useState('CAROUSEL');
  const [isActive,             setIsActive]             = useState(true);
  const [sortOrder,            setSortOrder]            = useState(0);
  const [selectedProductIds,   setSelectedProductIds]   = useState<string[]>([]);
  const [subtitle,             setSubtitle]             = useState('');
  const [description,          setDescription]          = useState('');
  const [bannerImage,          setBannerImage]          = useState('');
  const [buttonText,           setButtonText]           = useState('Shop Now');
  const [linkUrl,              setLinkUrl]              = useState('');
  const [backgroundColor,      setBackgroundColor]      = useState('#8b1a2a');
  const [splitAlign,           setSplitAlign]           = useState('IMAGE_LEFT');
  const [isUploadingBanner,    setIsUploadingBanner]    = useState(false);
  const [titleRight,           setTitleRight]           = useState('');
  const [subtitleRight,        setSubtitleRight]        = useState('');
  const [descriptionRight,     setDescriptionRight]     = useState('');
  const [bannerImageRight,     setBannerImageRight]     = useState('');
  const [buttonTextRight,      setButtonTextRight]      = useState('Shop Now');
  const [linkUrlRight,         setLinkUrlRight]         = useState('');
  const [backgroundColorRight, setBackgroundColorRight] = useState('#9c8485');
  const [isUploadingBannerRight, setIsUploadingBannerRight] = useState(false);

  /* lock / unlock body scroll whenever modal opens or closes */
  useEffect(() => {
    if (isFormOpen) lockScroll();
    else            unlockScroll();
    return ()      => unlockScroll();
  }, [isFormOpen]);

  const resetForm = () => {
    setTitle(''); setType('CAROUSEL'); setIsActive(true); setSortOrder(0);
    setSelectedProductIds([]); setSubtitle(''); setDescription('');
    setBannerImage(''); setButtonText('Shop Now'); setLinkUrl('');
    setBackgroundColor('#8b1a2a'); setSplitAlign('IMAGE_LEFT');
    setTitleRight(''); setSubtitleRight(''); setDescriptionRight('');
    setBannerImageRight(''); setButtonTextRight('Shop Now'); setLinkUrlRight('');
    setBackgroundColorRight('#9c8485'); setEditingSection(null); setIsFormOpen(false);
  };

  const handleEdit = (section: any) => {
    setEditingSection(section);
    setTitle(section.title);
    setType(section.type === 'GRID' ? 'CAROUSEL' : section.type);
    setIsActive(section.isActive);
    setSortOrder(section.sortOrder);
    setSubtitle(section.subtitle || '');
    setDescription(section.description || '');
    setBannerImage(section.bannerImage || '');
    setButtonText(section.buttonText || 'Shop Now');
    setLinkUrl(section.linkUrl || '');
    setBackgroundColor(section.backgroundColor || '#8b1a2a');
    setSplitAlign(section.splitAlign || 'IMAGE_LEFT');
    setTitleRight(section.titleRight || '');
    setSubtitleRight(section.subtitleRight || '');
    setDescriptionRight(section.descriptionRight || '');
    setBannerImageRight(section.bannerImageRight || '');
    setButtonTextRight(section.buttonTextRight || 'Shop Now');
    setLinkUrlRight(section.linkUrlRight || '');
    setBackgroundColorRight(section.backgroundColorRight || '#9c8485');
    const ordered =
      section.orderedProductIds?.length > 0
        ? section.orderedProductIds
        : section.products?.map((p: any) => p.id) || [];
    setSelectedProductIds(ordered);
    setIsFormOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createSection,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); queryClient.invalidateQueries({ queryKey: ['sections', 'admin'] }); resetForm(); },
    onError: (error: any) => { alert(error.response?.data?.message || 'Failed to create section'); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) => updateSection(data.id, data.payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); queryClient.invalidateQueries({ queryKey: ['sections', 'admin'] }); resetForm(); },
    onError: (error: any) => { alert(error.response?.data?.message || 'Failed to update section'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sections'] }); queryClient.invalidateQueries({ queryKey: ['sections', 'admin'] }); },
    onError: (error: any) => { alert(error.response?.data?.message || 'Failed to delete section'); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title, type, isActive, sortOrder: Number(sortOrder),
      productIds: selectedProductIds,
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      bannerImage: bannerImage.trim() || undefined,
      buttonText: buttonText.trim() || 'Shop Now',
      linkUrl: linkUrl.trim() || undefined,
      backgroundColor: backgroundColor || '#8b1a2a',
      splitAlign,
      titleRight: titleRight.trim() || undefined,
      subtitleRight: subtitleRight.trim() || undefined,
      descriptionRight: descriptionRight.trim() || undefined,
      bannerImageRight: bannerImageRight.trim() || undefined,
      buttonTextRight: buttonTextRight.trim() || 'Shop Now',
      linkUrlRight: linkUrlRight.trim() || undefined,
      backgroundColorRight: backgroundColorRight || '#9c8485',
    };
    if (editingSection) updateMutation.mutate({ id: editingSection.id, payload });
    else createMutation.mutate(payload);
  };

  const handleProductSelection = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProductIds(prev => {
        const next = [...prev, productId];
        if (type === 'SPLIT' && next.length > 2) {
          alert('Split layout: max 2 products (left + right box)');
          return prev;
        }
        return next;
      });
    }
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    setSelectedProductIds(prev => {
      const idx  = prev.indexOf(productId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const typeLabel = (t: string) =>
    SECTION_LAYOUT_TYPES.find(o => o.value === t)?.label ?? t;

  const typeColor: Record<string, string> = {
    COLLECTIONS: 'bg-violet-50 text-violet-700 border-violet-100',
    CAROUSEL:    'bg-blue-50   text-blue-700   border-blue-100',
    SPLIT:       'bg-amber-50  text-amber-700  border-amber-100',
    DEPARTMENTS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  if (isLoadingSections || isLoadingProducts) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={28} />
        <p className="text-sm text-neutral-400">Loading sections…</p>
      </div>
    );
  }

  /* ── input / label helpers ──────────────────────────────────────────────── */
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
      {children}
    </label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/20 focus:border-[#8b1a2a] transition-all placeholder:text-neutral-300 ${props.className ?? ''}`}
    />
  );

  const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/20 focus:border-[#8b1a2a] transition-all placeholder:text-neutral-300 resize-none ${props.className ?? ''}`}
    />
  );

  return (
    <>
      {/* ── Page ──────────────────────────────────────────────────────────── */}
      <div className="space-y-6 px-1">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-[#8b1a2a]" />
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Homepage Sections</h2>
            </div>
            <p className="text-sm text-neutral-500">Control which sections appear on the storefront and in what order.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7a1725] active:scale-95 transition-all shadow-sm shadow-[#8b1a2a]/30 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: sections?.length ?? 0, color: 'text-neutral-800' },
            { label: 'Active',  value: sections?.filter((s: any) => s.isActive).length  ?? 0, color: 'text-emerald-700' },
            { label: 'Hidden',  value: sections?.filter((s: any) => !s.isActive).length ?? 0, color: 'text-neutral-400' },
            { label: 'Products', value: allProducts?.length ?? 0, color: 'text-blue-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-neutral-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-20">Order</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Section</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:table-cell">Layout</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hidden md:table-cell">Items</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {!sections?.length ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                          <LayoutGrid size={20} className="text-neutral-400" />
                        </div>
                        <p className="text-neutral-400 text-sm font-medium">No sections yet</p>
                        <p className="text-neutral-300 text-xs">Click "Add Section" to create your first homepage section.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sections?.map((section: any) => (
                    <tr key={section.id} className="hover:bg-neutral-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <GripVertical size={14} className="text-neutral-300 cursor-grab group-hover:text-neutral-500 transition-colors" />
                          <span className="text-xs font-bold text-neutral-500 tabular-nums">{String(section.sortOrder).padStart(2, '0')}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-800 text-sm">{section.title}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">/{section.slug}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${typeColor[section.type] || 'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                          {typeLabel(section.type)}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                          {section.products?.length ?? 0} items
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${section.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${section.isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          {section.isActive ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(section)}
                            className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Delete this section?')) deleteMutation.mutate(section.id); }}
                            className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal — portal so it escapes sidebar transform stacking context ── */}
      {isFormOpen && createPortal((
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop — click to close */}
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={resetForm}
          />

          {/* sheet */}
          <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh] overflow-hidden">

            {/* sticky header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {editingSection ? 'Edit Section' : 'New Section'}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editingSection ? `Editing "${editingSection.title}"` : 'Add a section to the homepage'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* scrollable body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-6">

                {/* Basic info */}
                <section className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>{type === 'SPLIT' ? 'Left box headline' : 'Section title'}</Label>
                      <Input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={type === 'SPLIT' ? 'Bridal Lehenga & Designer Sarees' : 'e.g. Accessories'}
                      />
                    </div>
                    <div>
                      <Label>Display order</Label>
                      <Input
                        type="number"
                        min={0}
                        value={sortOrder}
                        onChange={e => setSortOrder(Number(e.target.value))}
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">0 = first after Hero</p>
                    </div>
                  </div>

                  <div>
                    <Label>Layout type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SECTION_LAYOUT_TYPES.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className={`text-left px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${
                            type === opt.value
                              ? 'border-[#8b1a2a] bg-[#8b1a2a]/5 text-[#8b1a2a]'
                              : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="font-bold text-[11px]">{opt.label}</div>
                          <div className={`text-[10px] mt-0.5 font-normal ${type === opt.value ? 'text-[#8b1a2a]/70' : 'text-neutral-400'}`}>
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-[#8b1a2a]' : 'bg-neutral-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                      <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-800">Show on homepage</div>
                      <div className="text-[11px] text-neutral-400">{isActive ? 'Section is live and visible to customers' : 'Section is hidden from the storefront'}</div>
                    </div>
                  </label>
                </section>

                {/* Split box fields */}
                {type === 'SPLIT' && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <span className="text-xs font-bold text-neutral-800">Split Layout Configuration</span>
                      <span className="text-[10px] text-neutral-400">Two promo boxes side by side</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left */}
                      <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8b1a2a]" />
                          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Left box</h4>
                        </div>
                        <div><Label>Subtitle / tagline</Label><Input type="text" placeholder="Ethnic Collection" value={subtitle} onChange={e => setSubtitle(e.target.value)} /></div>
                        <div><Label>Description</Label><Textarea placeholder="Short description…" value={description} onChange={e => setDescription(e.target.value)} rows={2} /></div>
                        <div><Label>Button text</Label><Input type="text" placeholder="Shop Ethnic" value={buttonText} onChange={e => setButtonText(e.target.value)} /></div>
                        <div><Label>Link URL</Label><Input type="text" placeholder="/shop?category=women" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} /></div>
                        <div><Label>Panel colour</Label><div className="flex gap-2"><input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-1" /><Input type="text" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} /></div></div>
                        <div>
                          <Label>Banner image</Label>
                          {bannerImage && <img src={bannerImage} alt="" className="w-full h-28 object-cover rounded-lg mb-2 border border-neutral-200" />}
                          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#8b1a2a] bg-white transition-colors">
                            {isUploadingBanner ? <Loader2 className="animate-spin text-[#8b1a2a]" size={16} /> : null}
                            <span className="text-xs font-semibold text-neutral-600">{isUploadingBanner ? 'Uploading…' : bannerImage ? 'Change image' : 'Upload left banner'}</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={async e => {
                              const file = e.target.files?.[0]; if (!file) return;
                              setIsUploadingBanner(true);
                              try { const d = await uploadImage(file); setBannerImage(d.url); }
                              catch (err: any) { alert(err.response?.data?.message || 'Upload failed'); }
                              finally { setIsUploadingBanner(false); e.target.value = ''; }
                            }} />
                          </label>
                        </div>
                      </div>
                      {/* Right */}
                      <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#9c8485]" />
                          <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Right box</h4>
                        </div>
                        <div><Label>Subtitle / tagline</Label><Input type="text" placeholder="Western Trend" value={subtitleRight} onChange={e => setSubtitleRight(e.target.value)} /></div>
                        <div><Label>Headline</Label><Input type="text" placeholder="Cord Sets & Dresses" value={titleRight} onChange={e => setTitleRight(e.target.value)} /></div>
                        <div><Label>Description</Label><Textarea placeholder="Short description…" value={descriptionRight} onChange={e => setDescriptionRight(e.target.value)} rows={2} /></div>
                        <div><Label>Button text</Label><Input type="text" placeholder="Shop Western" value={buttonTextRight} onChange={e => setButtonTextRight(e.target.value)} /></div>
                        <div><Label>Link URL</Label><Input type="text" placeholder="/shop?category=women" value={linkUrlRight} onChange={e => setLinkUrlRight(e.target.value)} /></div>
                        <div><Label>Panel colour</Label><div className="flex gap-2"><input type="color" value={backgroundColorRight} onChange={e => setBackgroundColorRight(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-200 cursor-pointer p-1" /><Input type="text" value={backgroundColorRight} onChange={e => setBackgroundColorRight(e.target.value)} /></div></div>
                        <div>
                          <Label>Banner image</Label>
                          {bannerImageRight && <img src={bannerImageRight} alt="" className="w-full h-28 object-cover rounded-lg mb-2 border border-neutral-200" />}
                          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#8b1a2a] bg-white transition-colors">
                            {isUploadingBannerRight ? <Loader2 className="animate-spin text-[#8b1a2a]" size={16} /> : null}
                            <span className="text-xs font-semibold text-neutral-600">{isUploadingBannerRight ? 'Uploading…' : bannerImageRight ? 'Change image' : 'Upload right banner'}</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={async e => {
                              const file = e.target.files?.[0]; if (!file) return;
                              setIsUploadingBannerRight(true);
                              try { const d = await uploadImage(file); setBannerImageRight(d.url); }
                              catch (err: any) { alert(err.response?.data?.message || 'Upload failed'); }
                              finally { setIsUploadingBannerRight(false); e.target.value = ''; }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Product picker */}
                <section className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <Label>
                        {type === 'SPLIT' ? 'Products (optional, max 2)' : 'Select products'}
                        {type === 'DEPARTMENTS' && ' — pick 3 for best layout'}
                      </Label>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Selection order = left-to-right display order.</p>
                    </div>
                    {selectedProductIds.length > 0 && (
                      <span className="text-[10px] font-bold text-[#8b1a2a] bg-[#8b1a2a]/10 px-2 py-1 rounded-md">
                        {selectedProductIds.length} selected
                      </span>
                    )}
                  </div>

                  <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
                    <div data-lenis-prevent className="max-h-52 overflow-y-auto overscroll-contain p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allProducts?.map((product: any) => {
                        const isSelected = selectedProductIds.includes(product.id);
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductSelection(product.id)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                              isSelected ? 'bg-[#8b1a2a]/5 border-[#8b1a2a]/30' : 'bg-white border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#8b1a2a] border-[#8b1a2a]' : 'border-neutral-300'}`}>
                              {isSelected && <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-neutral-800 truncate">{product.name}</p>
                              <p className="text-[10px] text-neutral-400 truncate capitalize">{product.category}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedProductIds.length > 0 && (
                      <div className="border-t border-neutral-200 p-3 space-y-1.5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Display order</p>
                        {selectedProductIds.map((pid, index) => {
                          const product = allProducts?.find((p: any) => p.id === pid);
                          if (!product) return null;
                          return (
                            <div key={pid} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 group/row">
                              <span className="text-[10px] font-bold text-neutral-400 tabular-nums w-5">{index + 1}</span>
                              <span className="text-xs font-medium text-neutral-800 flex-1 truncate">{product.name}</span>
                              <div className="flex gap-0.5 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <button type="button" onClick={() => moveProduct(pid, 'up')} disabled={index === 0} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition-colors"><ChevronUp size={13} /></button>
                                <button type="button" onClick={() => moveProduct(pid, 'down')} disabled={index === selectedProductIds.length - 1} className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition-colors"><ChevronDown size={13} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* sticky footer */}
              <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-neutral-100 bg-white shrink-0">
                <div className="text-xs text-neutral-400 hidden sm:block">
                  {editingSection ? `ID: ${editingSection.id.slice(0, 8)}…` : 'New section'}
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8b1a2a] hover:bg-[#7a1725] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm shadow-[#8b1a2a]/30 active:scale-95"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="animate-spin" size={15} />
                    )}
                    {editingSection ? 'Save changes' : 'Create section'}
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