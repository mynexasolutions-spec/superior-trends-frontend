import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useProducts, useCategories, useCollections } from '../../hooks/useProducts';
import { createProduct, updateProduct, deleteProduct, uploadImage } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatINR } from '../../lib/formatCurrency';
import {
  getRootCategories,
  getCategoryPath,
  resolveSubCategoryId,
  splitCategoryForForm,
} from '../../lib/categoryHelpers';
import {
  buildProductImagesPayload,
  getFirstProductImageUrl,
} from '../../lib/productImage';

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Fetch products & categories
  const { data: products, isLoading } = useProducts({ admin: true });
  const { data: flatCategories } = useCategories({ flat: true });
  const rootCategories = getRootCategories(flatCategories);
  const { data: collections } = useCollections();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [mrp, setMrp] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [collectionId, setCollectionId] = useState('');
  const [brand, setBrand] = useState('Superior Trends');
  const [weight, setWeight] = useState<number | ''>('');
  const [status, setStatus] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [stock, setStock] = useState(10);
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sizes & Colors States
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L']);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([{ name: 'Default', hex: '#000000' }]);
  const [customSize, setCustomSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8b1a2a');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadImage(file);
      const url = data.url?.trim();
      if (!url) throw new Error('Upload succeeded but no image URL was returned');

      setImageUrl(url);
      setImageRemoved(false);

      // When editing, persist image immediately so it is not lost if Save is skipped
      if (editingProduct?.id) {
        const images = buildProductImagesPayload(url);
        await updateProduct(editingProduct.id, { images });
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setMrp(0);
    setSalePrice(0);
    setParentCategoryId('');
    setSubCategoryName('');
    setCollectionId('');
    setBrand('Superior Trends');
    setWeight('');
    setStatus(true);
    setSeoTitle('');
    setSeoDescription('');
    setShortDescription('');
    setLongDescription('');
    setStock(10);
    setFeatured(false);
    setTrending(false);
    setImageUrl('');
    setImageRemoved(false);
    setSizes(['S', 'M', 'L']);
    setColors([{ name: 'Default', hex: '#000000' }]);
    setCustomSize('');
    setNewColorName('');
    setNewColorHex('#8b1a2a');
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  // Add Mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create product');
    },
  });

  // Edit Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update product');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleEditClick = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku || '');
    setMrp(p.mrp || p.price);
    setSalePrice(p.salePrice || p.price);
    const { parentCategoryId: parentId, subCategoryName: subName } = splitCategoryForForm(
      p.categoryId,
      flatCategories,
    );
    setParentCategoryId(parentId);
    setSubCategoryName(subName);
    setCollectionId(p.collectionId || '');
    setBrand(p.brand || 'Superior Trends');
    setWeight(p.weight != null ? p.weight : '');
    setStatus(p.status !== undefined ? p.status : true);
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setShortDescription(p.shortDescription || p.description || '');
    setLongDescription(p.longDescription || p.details?.[0] || '');
    setStock(p.stock !== undefined ? p.stock : 10);
    setFeatured(p.isNew || false);
    setTrending(p.isBestSeller || false);
    setImageUrl(getFirstProductImageUrl(p.images));
    setImageRemoved(false);
    setSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L']);
    setColors(p.colors && p.colors.length > 0 ? p.colors : [{ name: 'Default', hex: '#000000' }]);
    setCustomSize('');
    setNewColorName('');
    setNewColorHex('#8b1a2a');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    if (!parentCategoryId) {
      alert('Please select a main category (create one under Admin → Categories first).');
      return;
    }
    if (!subCategoryName.trim()) {
      alert('Please enter a subcategory (e.g. Jeans, Tops, Kurtas).');
      return;
    }

    setIsSaving(true);
    let resolvedCategoryId: string;
    try {
      resolvedCategoryId = await resolveSubCategoryId(
        parentCategoryId,
        subCategoryName,
        flatCategories ?? [],
      );
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid category';
      alert(message);
      setIsSaving(false);
      return;
    }

    const imagesPayload = buildProductImagesPayload(imageUrl);

    const payload: any = {
      name,
      sku,
      mrp: Number(mrp),
      salePrice: Number(salePrice || mrp),
      categoryId: resolvedCategoryId,
      collectionId: collectionId || undefined,
      brand: brand.trim() || 'Superior Trends',
      weight: weight !== '' ? Number(weight) : undefined,
      status,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      shortDescription,
      longDescription,
      stock: Number(stock),
      featured,
      trending,
      sizes,
      colors,
    };

    if (imagesPayload) {
      payload.images = imagesPayload;
    } else if (editingProduct && imageRemoved) {
      payload.images = [];
    }

    const onDone = () => setIsSaving(false);

    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, payload },
        { onSettled: onDone }
      );
    } else {
      createMutation.mutate(payload, { onSettled: onDone });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase">Products Catalog</h1>
          <p className="text-xs text-neutral-500 mt-1">Manage, update, and deploy clothing items instantly.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#6b1420] transition-colors w-full sm:w-auto shrink-0"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Form Overlay Modal — rendered via portal so it escapes sidebar transform stacking context */}
      {isFormOpen && createPortal(
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden font-display">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[min(90vh,100dvh)] shadow-2xl overflow-hidden border border-neutral-100 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-display text-lg font-extrabold uppercase text-neutral-900 tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={resetForm} className="text-neutral-400 hover:text-neutral-600 font-bold text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div data-lenis-prevent className="p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Classic Trench Coat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="COAT-TRENCH-BLK"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">MRP (OMR)</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sale Price (OMR)</label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Main category
                  </label>
                  <select
                    required
                    value={parentCategoryId}
                    onChange={(e) => {
                      setParentCategoryId(e.target.value);
                      setSubCategoryName('');
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] bg-white font-display"
                  >
                    <option value="">— Select (e.g. Men, Women) —</option>
                    {rootCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-400">
                    Create main categories in Admin → Categories (leave parent empty).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    required
                    list="subcategory-suggestions"
                    placeholder="e.g. Jeans, Tops, Kurtas"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] font-display"
                  />
                  <datalist id="subcategory-suggestions">
                    {(flatCategories ?? [])
                      .filter((c) => c.parentId === parentCategoryId)
                      .map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                  </datalist>
                  <p className="text-[10px] text-neutral-400">
                    Type a subcategory under the main category — e.g. Men → Jeans. Created automatically if new.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Collection</label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] bg-white"
                  >
                    <option value="">Select a Collection</option>
                    {collections?.map((col: any) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Brand</label>
                  <input
                    type="text"
                    placeholder="Superior Trends"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Weight (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.25"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stock Count</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product Image</label>
                <div className="flex items-start gap-4">
                  {imageUrl ? (
                    <div className="relative size-24 rounded-lg overflow-hidden border border-neutral-200">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImageRemoved(true);
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:bg-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="size-24 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50">
                      <ImageIcon className="text-neutral-300" size={24} />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center justify-center px-4 py-2 border border-neutral-200 rounded-lg shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2" size={16} />
                          Upload Image
                        </>
                      )}
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF up to 10MB. 
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Short Description</label>
                <input
                  type="text"
                  placeholder="An iconic double-breasted trench coat..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Long details (split by newline)</label>
                <textarea
                  placeholder="Outer: 100% cotton gabardine&#10;Lining: 100% viscose"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                />
              </div>

              {/* Sizes and Colors Section */}
              <div className="border-t border-neutral-100 pt-4 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-[#8b1a2a] font-bold">Sizes & Colors</h4>
                
                {/* Sizes Management */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40', '42'].map((size) => {
                      const isSelected = sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSizes(sizes.filter((s) => s !== size));
                            } else {
                              setSizes([...sizes, size]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#8b1a2a] text-white border-[#8b1a2a] shadow-sm'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Custom Size Input */}
                  <div className="flex gap-2 max-w-xs mt-2">
                    <input
                      type="text"
                      placeholder="Custom e.g. OS, 44"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customSize.trim().toUpperCase();
                        if (val && !sizes.includes(val)) {
                          setSizes([...sizes, val]);
                          setCustomSize('');
                        }
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Add Custom
                    </button>
                  </div>
                </div>

                {/* Colors Management */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Available Colors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 shadow-sm text-xs font-medium text-neutral-800"
                      >
                        <span
                          className="size-3.5 rounded-full border border-black/10 inline-block shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                          className="text-neutral-400 hover:text-red-500 font-bold ml-1 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Color Form */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Picker:</span>
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="size-8 rounded-lg cursor-pointer border border-neutral-300 p-0"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Color name e.g. Navy Blue"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] min-w-[150px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nameVal = newColorName.trim();
                        if (nameVal) {
                          // Remove default color if adding a specific color
                          let cleanColors = [...colors];
                          if (cleanColors.length === 1 && cleanColors[0].name === 'Default') {
                            cleanColors = [];
                          }
                          setColors([...cleanColors, { name: nameVal, hex: newColorHex }]);
                          setNewColorName('');
                        } else {
                          alert('Please enter a color name');
                        }
                      }}
                      className="bg-[#8b1a2a] text-white hover:bg-[#6b1420] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="accent-[#8b1a2a]"
                  />
                  Product is Active / Visible to Public
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-[#8b1a2a]"
                  />
                  Mark as Featured
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={(e) => setTrending(e.target.checked)}
                    className="accent-[#8b1a2a]"
                  />
                  Mark as Trending / Bestseller
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">SEO Settings</h4>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">SEO Title</label>
                  <input
                    type="text"
                    placeholder="Premium Trench Coat | Superior Trends"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">SEO Description</label>
                  <textarea
                    placeholder="Shop our iconic double-breasted trench coat..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50 shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || createMutation.isPending || updateMutation.isPending}
                className="bg-[#8b1a2a] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#6b1420] transition-colors flex items-center gap-2 disabled:opacity-75"
              >
                {(isSaving || createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="animate-spin" size={14} />
                )}
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
      , document.body)}

      {/* Product List Table */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="animate-spin" size={20} /> Loading products...
        </div>
      ) : !products || products.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-300 bg-white rounded-2xl">
          <ImageIcon className="mx-auto text-neutral-300 mb-3" size={32} />
          <p className="text-sm font-medium text-neutral-600">No products found</p>
          <p className="text-xs text-neutral-400 mt-1">Upload premium clothes to present them to your customers.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">SKU</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-neutral-50/55 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {getFirstProductImageUrl(p.images) ? (
                      <img
                        src={getFirstProductImageUrl(p.images)}
                        alt={p.name}
                        className="size-10 rounded-lg object-cover border border-neutral-200"
                      />
                    ) : (
                      <div className="size-10 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-400">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{p.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {getCategoryPath(p.categoryId, flatCategories)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-neutral-500">{p.sku || '—'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-neutral-800">
                    {formatINR(p.salePrice ?? p.price)}
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-600">{p.stock !== undefined ? p.stock : 10}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-2 text-neutral-400 hover:text-neutral-800 transition-colors inline-block"
                      title="Edit Product"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete product "${p.name}"?`)) {
                          deleteMutation.mutate(p.id);
                        }
                      }}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors inline-block"
                      title="Delete Product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
