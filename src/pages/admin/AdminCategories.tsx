import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCategories } from '../../hooks/useProducts';
import { createCategory, updateCategory, deleteCategory } from '../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, FolderTree } from 'lucide-react';
import { getRootCategories } from '../../lib/categoryHelpers';

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: flatCategories, isLoading } = useCategories({ flat: true });
  const rootCategories = getRootCategories(flatCategories);

  const sortedForTable = [...(flatCategories ?? [])].sort((a, b) => {
    const aRoot = a.parentId ? 1 : 0;
    const bRoot = b.parentId ? 1 : 0;
    if (aRoot !== bRoot) return aRoot - bRoot;
    return a.name.localeCompare(b.name);
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    description?: string;
    parentId?: string | null;
  } | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setParentId('');
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to create category';
      alert(message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update category';
      alert(message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to delete category';
      alert(message || 'Failed to delete category');
    },
  });

  const handleEditClick = (cat: {
    id: string;
    name: string;
    description?: string;
    parentId?: string | null;
  }) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left font-display">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-tight">
            Manage Categories
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Step 1: Create a <strong>main category</strong> (e.g. Men, Women) — leave parent empty.
            Step 2: Add products with main + subcategory (e.g. Men → Jeans).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#8b1a2a] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#6b1420] transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* Form Overlay Modal — portal so it escapes sidebar transform stacking context */}
      {isFormOpen && createPortal(
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-hidden font-display">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[min(85vh,100dvh)] shadow-2xl border border-neutral-100 flex flex-col min-h-0">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <h3 className="font-display text-lg font-extrabold uppercase text-neutral-900 tracking-tight">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div
                data-lenis-prevent
                className="p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Men, Women, Accessories"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] font-display"
                  />
                </div>

                {rootCategories.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Parent (optional)
                    </label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] bg-white font-display"
                    >
                      <option value="">— Main category (no parent) —</option>
                      {rootCategories
                        .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-neutral-400">
                      Leave empty for Men/Women. Only pick a parent if this is a subcategory (e.g. Jeans under Men).
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Description (optional)
                  </label>
                  <textarea
                    placeholder="Brief summary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:border-[#8b1a2a] font-display resize-y min-h-[100px]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 shrink-0 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-[#8b1a2a] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#6b1420] transition-colors flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="animate-spin" size={14} />
                  )}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}

      {isLoading ? (
        <div className="py-20 flex items-center justify-center text-neutral-400 gap-2">
          <Loader2 className="animate-spin" size={20} /> Loading categories...
        </div>
      ) : !flatCategories || flatCategories.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-300 bg-white rounded-2xl">
          <FolderTree className="mx-auto text-neutral-300 mb-3" size={32} />
          <p className="text-sm font-medium text-neutral-600">No categories yet</p>
          <p className="text-xs text-neutral-400 mt-1">Create &quot;Men&quot; or &quot;Women&quot; first (no parent).</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[480px] text-left border-collapse font-display">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Category
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Parent
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Slug
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Description
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedForTable.map((cat) => {
                const parentCat = cat.parentId
                  ? flatCategories?.find((c) => c.id === cat.parentId)
                  : null;
                return (
                <tr key={cat.id} className="hover:bg-neutral-50/55 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold text-neutral-800 ${cat.parentId ? 'pl-3' : ''}`}>
                      {cat.parentId && <span className="text-neutral-300 mr-2">└</span>}
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {parentCat ? (
                      <span className="text-[10px] font-medium bg-[#8b1a2a]/10 text-[#8b1a2a] px-2 py-0.5 rounded">
                        {parentCat.name}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">Main</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-neutral-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-xs text-neutral-500 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(cat)}
                      className="p-2 text-neutral-400 hover:text-neutral-800 transition-colors inline-block"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors inline-block"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
