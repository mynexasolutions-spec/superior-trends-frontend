import React, { useState } from 'react';
import { Loader2, Star, Trash2, ChevronRight, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useAllReviewsAdmin, useUpdateReviewStatus, useDeleteReview } from '../../hooks/useReviews';
import { useToast } from '../../hooks/useToast';
import type { ProductReview } from '../../lib/api';

type AdminReviewItem = ProductReview & {
  user: { id: string; name: string; email: string; avatar?: string | null };
  product: { id: string; name: string; slug: string };
};

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const { data: reviews, isLoading, isError } = useAllReviewsAdmin();
  const updateStatusMutation = useUpdateReviewStatus();
  const deleteMutation = useDeleteReview();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedReview = reviews?.find((r) => r.id === selectedId) as AdminReviewItem | undefined;

  // Filter reviews
  const filteredReviews = (reviews ?? []).filter((r) => {
    const item = r as AdminReviewItem;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.review ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      showToast(`Review status updated to ${newStatus} ✦`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Review deleted successfully ✦', 'success');
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete review.', 'error');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 border border-emerald-100 rounded-md">
            <CheckCircle size={10} /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 border border-red-100 rounded-md">
            <XCircle size={10} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 border border-amber-100 rounded-md animate-pulse">
            <AlertCircle size={10} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl font-display">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8b1a2a]">Admin</span>
          <ChevronRight size={10} className="text-neutral-300" />
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Reviews</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">
          Product Reviews
        </h1>
        <p className="text-xs text-brand-text-muted mt-2">
          Moderate, audit, and approve customer reviews and star ratings.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#8b1a2a]" size={24} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Loading reviews…</p>
        </div>
      ) : isError ? (
        <div className="text-center py-24 border border-red-100 bg-red-50/50 rounded-2xl p-6">
          <p className="text-sm font-bold text-red-600">Failed to load reviews</p>
          <p className="text-xs text-red-500/80 mt-1">Please try refreshing the page or check server logs.</p>
        </div>
      ) : !reviews?.length ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-200 rounded-2xl bg-white gap-3">
          <div className="size-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <MessageSquare size={22} className="text-neutral-300" />
          </div>
          <p className="text-sm font-bold text-neutral-500">No reviews yet</p>
          <p className="text-xs text-neutral-400">Customer product reviews will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          
          {/* ── Left panel: Reviews List ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col max-h-[75vh]">
            <div className="h-1 bg-gradient-to-r from-[#8b1a2a] via-[#c0364a] to-[#8b1a2a] shrink-0" />
            
            {/* Search and filter controls */}
            <div className="p-4 border-b border-neutral-100 space-y-3 shrink-0">
              <input
                type="text"
                placeholder="Search reviewer, product, review..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#8b1a2a] focus:ring-2 focus:ring-[#8b1a2a]/10"
              />
              <div className="flex flex-wrap gap-1.5">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors border ${
                      statusFilter === filter
                        ? 'bg-[#8b1a2a] border-[#8b1a2a] text-white shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List entries scrollable */}
            <div className="divide-y divide-neutral-100 overflow-y-auto">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
                  No matching reviews found
                </div>
              ) : (
                filteredReviews.map((r) => {
                  const item = r as AdminReviewItem;
                  const isActive = selectedId === item.id;
                  const isPending = item.status === 'PENDING';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-4 py-4 transition-colors relative flex flex-col gap-1.5
                        ${isActive ? 'bg-[#8b1a2a]/5' : 'hover:bg-neutral-50/80'}
                      `}
                    >
                      {isPending && (
                        <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-amber-500 rounded-r-full" />
                      )}
                      
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs truncate ${isActive ? 'text-[#8b1a2a] font-extrabold' : 'font-semibold text-neutral-800'}`}>
                          {item.user?.name || 'Customer'}
                        </p>
                        <div className="shrink-0">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate">
                        Product: {item.product?.name || 'Unknown Item'}
                      </p>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-brand-charcoal flex items-center gap-0.5 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {item.rating} <Star size={9} className="fill-[#d4af37] text-[#d4af37]" />
                        </span>
                        {item.title && (
                          <span className="text-[10px] text-neutral-500 font-black truncate max-w-[140px] italic">
                            "{item.title}"
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.review || 'No review comment text.'}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock size={9} className="text-neutral-300" />
                        <p className="text-[9px] text-neutral-400">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right panel: Selected Review Detail ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] sticky top-6">
            <div
              className="h-1 shrink-0 bg-neutral-200"
              style={selectedReview ? { backgroundImage: 'linear-gradient(to right, #8b1a2a, #c0364a, #8b1a2a)' } : {}}
            />

            {selectedReview ? (
              <div className="p-6 space-y-6">
                
                {/* Header reviewer info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-[#8b1a2a]/10 flex items-center justify-center shrink-0 text-[#8b1a2a] font-extrabold text-sm uppercase">
                      {selectedReview.user?.name.slice(0, 2) || 'CU'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight truncate">
                        {selectedReview.user?.name}
                      </h2>
                      <p className="text-xs text-neutral-400 truncate">
                        {selectedReview.user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedReview.id)}
                    className="shrink-0 size-9 flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-neutral-200 hover:border-red-200"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <hr className="border-neutral-100" />

                {/* Target product info */}
                <div className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-1">Reviewed Product</p>
                    <h4 className="text-sm font-extrabold text-brand-charcoal truncate">
                      {selectedReview.product?.name}
                    </h4>
                  </div>
                  <a
                    href={`/product/${selectedReview.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-[#8b1a2a] hover:underline shrink-0"
                  >
                    View Product <ExternalLink size={10} />
                  </a>
                </div>

                {/* Star rating and timestamp */}
                <div className="flex flex-wrap items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">Rating Given</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < selectedReview.rating ? 'fill-[#d4af37] text-[#d4af37]' : 'text-neutral-200'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-brand-charcoal">
                        {selectedReview.rating} / 5 Stars
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-left lg:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">Submitted On</p>
                    <p className="text-xs font-bold text-neutral-700">
                      {new Date(selectedReview.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Review message text */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">Review Message</p>
                  <div className="bg-[#fcfcfa] border border-neutral-100 rounded-2xl p-4">
                    {selectedReview.title && (
                      <h5 className="text-sm font-black text-brand-charcoal mb-2">
                        "{selectedReview.title}"
                      </h5>
                    )}
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap italic">
                      {selectedReview.review || 'No review explanation message was written.'}
                    </p>
                  </div>
                </div>

                {/* Review Images if any */}
                {selectedReview.images && Array.isArray(selectedReview.images) && selectedReview.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">Uploaded Review Photos</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {selectedReview.images.map((imgUrl: string, idx: number) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group block shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`Review upload ${idx + 1}`}
                            className="size-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ExternalLink size={14} className="text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-neutral-100" />

                {/* Action buttons (Approve / Reject) */}
                <div className="flex flex-wrap gap-3 items-center justify-end">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mr-auto">
                    Status: {selectedReview.status}
                  </span>

                  {selectedReview.status !== 'REJECTED' && (
                    <button
                      type="button"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleStatusUpdate(selectedReview.id, 'REJECTED')}
                      className="px-4 py-2 border-2 border-red-100 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                    >
                      Reject Review
                    </button>
                  )}

                  {selectedReview.status !== 'APPROVED' && (
                    <button
                      type="button"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleStatusUpdate(selectedReview.id, 'APPROVED')}
                      className="px-5 py-2.5 bg-[#2d9e6b] text-white hover:bg-[#238156] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                    >
                      Approve & Publish
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[420px] gap-3 text-neutral-300">
                <MessageSquare size={36} className="opacity-40" />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]">Select a review to inspect</p>
                <p className="text-xs text-neutral-400 max-w-[200px] text-center">Click any entry on the left to moderate or audit details.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminReviews;
