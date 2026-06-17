import React, { useState, useEffect } from 'react';
import { useCouponsAdmin, useCouponMutations } from '../../hooks/useCoupons';
import { Plus, Trash2, Edit2, Loader2, Ticket, Calendar, X, Percent, IndianRupee } from 'lucide-react';
import type { Coupon } from '../../lib/api';

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
  lockedElements.forEach(({ el, prevOverflowY }) => { el.style.overflowY = prevOverflowY; });
  lockedElements.length = 0;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const emptyForm = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minimumOrder: '0',
  maximumDiscount: '',
  usageLimit: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: true,
};

function formatDate(dateStr: string, includeYear = false): string {
  if (!dateStr) return '—';
  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = datePart.split('-');
  if (parts.length < 3) return '—';
  const [year, month, day] = parts;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mLabel = months[parseInt(month, 10) - 1] || month;
  const dayNum = parseInt(day, 10);
  if (includeYear) {
    const yrShort = year.slice(-2);
    return `${dayNum} ${mLabel} '${yrShort}`;
  }
  return `${dayNum} ${mLabel}`;
}

function couponStatus(coupon: Coupon): { label: string; cls: string; dot: string } {
  const expired = new Date() > new Date(coupon.endDate);
  if (expired)          return { label: 'Expired',  cls: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' };
  if (!coupon.status)   return { label: 'Disabled', cls: 'bg-neutral-100 text-neutral-500 border-neutral-200', dot: 'bg-neutral-400' };
  return                       { label: 'Active',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export const AdminCoupons: React.FC = () => {
  const { data: coupons, isLoading } = useCouponsAdmin();
  const { create, update, remove }   = useCouponMutations();

  const [isFormOpen,    setIsFormOpen]    = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form,          setForm]          = useState(emptyForm);

  /* scroll lock */
  useEffect(() => {
    if (isFormOpen) lockScroll();
    else            unlockScroll();
    return ()      => unlockScroll();
  }, [isFormOpen]);

  const set = (patch: Partial<typeof emptyForm>) => setForm(f => ({ ...f, ...patch }));

  const resetForm = () => { setForm(emptyForm); setEditingCoupon(null); setIsFormOpen(false); };

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code:            coupon.code,
      type:            coupon.type,
      value:           String(coupon.value),
      minimumOrder:    String(coupon.minimumOrder),
      maximumDiscount: coupon.maximumDiscount != null ? String(coupon.maximumDiscount) : '',
      usageLimit:      coupon.usageLimit      != null ? String(coupon.usageLimit)      : '',
      startDate:       new Date(coupon.startDate).toISOString().split('T')[0],
      endDate:         new Date(coupon.endDate).toISOString().split('T')[0],
      status:          coupon.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value || !form.startDate || !form.endDate) return;
    const payload = {
      code:            form.code.trim().toUpperCase(),
      type:            form.type as 'PERCENTAGE' | 'FIXED',
      value:           Number(form.value),
      minimumOrder:    Number(form.minimumOrder) || 0,
      maximumDiscount: form.maximumDiscount.trim() ? Number(form.maximumDiscount) : null,
      usageLimit:      form.usageLimit.trim()      ? Number(form.usageLimit)      : null,
      startDate:       new Date(form.startDate).toISOString(),
      endDate:         new Date(form.endDate).toISOString(),
      status:          form.status,
    };
    try {
      if (editingCoupon) await update.mutateAsync({ id: editingCoupon.id, payload });
      else               await create.mutateAsync(payload);
      resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to save coupon';
      alert(message || 'Failed to save coupon');
    }
  };

  const pending = create.isPending || update.isPending;

  /* stats */
  const total   = coupons?.length ?? 0;
  const active  = coupons?.filter(c => c.status && new Date() <= new Date(c.endDate)).length ?? 0;
  const expired = coupons?.filter(c => new Date() > new Date(c.endDate)).length ?? 0;

  const inputCls =
    'w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/20 focus:border-[#8b1a2a] ' +
    'transition-all placeholder:text-neutral-300';

  const Label = ({ children, dim }: { children: React.ReactNode; dim?: boolean }) => (
    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${dim ? 'text-neutral-300' : 'text-neutral-400'}`}>
      {children}
    </label>
  );

  return (
    <>
      <div className="space-y-6 px-1">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Ticket size={20} className="text-[#8b1a2a]" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Coupons</h1>
            </div>
            <p className="text-sm text-neutral-500">Configure promo codes with discounts, spend limits, caps, and validity dates.</p>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#8b1a2a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7a1725] active:scale-95 transition-all shadow-sm shadow-[#8b1a2a]/30 whitespace-nowrap"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total coupons', value: total,   color: 'text-neutral-800' },
            { label: 'Active',        value: active,  color: 'text-emerald-700' },
            { label: 'Expired',       value: expired, color: 'text-orange-600'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-neutral-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-[#8b1a2a]" size={22} />
            <span className="text-sm">Loading coupons…</span>
          </div>
        ) : !coupons?.length ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 bg-white rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <Ticket size={22} className="text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-600">No coupons yet</p>
            <p className="text-xs text-neutral-400 mt-1">Create your first promo code to boost sales.</p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    {['Code', 'Discount', 'Min spend', 'Usage', 'Validity', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {coupons.map((coupon) => {
                    const sc = couponStatus(coupon);
                    return (
                      <tr key={coupon.id} className="hover:bg-neutral-50/60 transition-colors group">

                        {/* Code */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#8b1a2a]/8 flex items-center justify-center shrink-0">
                              <Ticket size={12} className="text-[#8b1a2a]" />
                            </div>
                            <span className="text-xs font-mono font-bold text-neutral-800 tracking-wider">
                              {coupon.code}
                            </span>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-[#8b1a2a]">
                            {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`}
                          </span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {coupon.type === 'PERCENTAGE' ? 'off' : 'flat off'}
                            {coupon.maximumDiscount ? ` · cap ₹${coupon.maximumDiscount}` : ''}
                          </span>
                        </td>

                        {/* Min spend */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-neutral-700">
                            ₹{Number(coupon.minimumOrder).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Usage */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-neutral-500">
                            {coupon.usageCount ?? 0}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                          </span>
                        </td>

                        {/* Validity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 whitespace-nowrap">
                            <Calendar size={12} className="text-neutral-400 shrink-0" />
                            <span>
                              {formatDate(coupon.startDate)}
                              {' — '}
                              {formatDate(coupon.endDate, true)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEditClick(coupon)}
                              className="p-2 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete coupon "${coupon.code}"?`)) {
                                  try { await remove.mutateAsync(coupon.id); }
                                  catch { alert('Failed to delete coupon'); }
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={resetForm} />

          {/* sheet */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90dvh] overflow-hidden">

            {/* header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editingCoupon ? `Editing "${editingCoupon.code}"` : 'Create a new promotional discount code'}
                </p>
              </div>
              <button onClick={resetForm} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div data-modal-scroll className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-5">

                {/* Live preview */}
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="w-12 h-12 rounded-xl bg-[#8b1a2a]/8 border border-[#8b1a2a]/15 flex items-center justify-center shrink-0">
                    {form.type === 'PERCENTAGE'
                      ? <Percent size={20} className="text-[#8b1a2a]" />
                      : <IndianRupee size={20} className="text-[#8b1a2a]" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-mono font-bold text-neutral-900 tracking-widest uppercase">
                      {form.code.trim() || 'COUPON_CODE'}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      {form.type === 'PERCENTAGE'
                        ? `${form.value || '0'}% off`
                        : `₹${form.value || '0'} flat off`}
                      {Number(form.minimumOrder) > 0 && ` · min order ₹${form.minimumOrder}`}
                      {form.type === 'PERCENTAGE' && form.maximumDiscount && ` · max cap ₹${form.maximumDiscount}`}
                      {form.usageLimit && ` · limit ${form.usageLimit} uses`}
                    </div>
                  </div>
                  <span className={`ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${form.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-400 border-neutral-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${form.status ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    {form.status ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Code */}
                <div>
                  <Label>Coupon code *</Label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME10, SAVE150"
                    value={form.code}
                    onChange={e => set({ code: e.target.value.toUpperCase() })}
                    className={inputCls + ' font-mono tracking-widest'}
                    autoFocus
                  />
                </div>

                {/* Type toggle */}
                <div>
                  <Label>Discount type *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([['PERCENTAGE', 'Percentage (%)', Percent], ['FIXED', 'Fixed amount (₹)', IndianRupee]] as const).map(([val, label, Icon]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => set({ type: val, maximumDiscount: val === 'FIXED' ? '' : form.maximumDiscount })}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          form.type === val
                            ? 'border-[#8b1a2a] bg-[#8b1a2a]/5 text-[#8b1a2a]'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value + Min order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount value *</Label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder={form.type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 100'}
                      value={form.value}
                      onChange={e => set({ value: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>Min order (₹)</Label>
                    <input
                      type="number"
                      min={0}
                      value={form.minimumOrder}
                      onChange={e => set({ minimumOrder: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Max discount cap + Usage limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label dim={form.type === 'FIXED'}>Max discount cap (₹)</Label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 500"
                      disabled={form.type === 'FIXED'}
                      value={form.maximumDiscount}
                      onChange={e => set({ maximumDiscount: e.target.value })}
                      className={inputCls + ' disabled:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed'}
                    />
                    {form.type === 'FIXED' && (
                      <p className="text-[10px] text-neutral-400 mt-1">N/A for fixed discounts</p>
                    )}
                  </div>
                  <div>
                    <Label>Usage limit</Label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      value={form.usageLimit}
                      onChange={e => set({ usageLimit: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start date *</Label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={e => set({ startDate: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label>End date *</Label>
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      onChange={e => set({ endDate: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${form.status ? 'bg-[#8b1a2a]' : 'bg-neutral-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.status ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    <input type="checkbox" checked={form.status} onChange={e => set({ status: e.target.checked })} className="sr-only" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-800">Enable coupon</div>
                    <div className="text-[11px] text-neutral-400">{form.status ? 'Coupon is active and redeemable' : 'Coupon is disabled — cannot be used'}</div>
                  </div>
                </label>
              </div>

              {/* footer */}
              <div className="shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t border-neutral-100 bg-white">
                <div className="text-xs text-neutral-400 hidden sm:block">
                  {editingCoupon ? `ID: ${editingCoupon.id.slice(0, 8)}…` : 'New coupon'}
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
                    {editingCoupon ? 'Save changes' : 'Create coupon'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};