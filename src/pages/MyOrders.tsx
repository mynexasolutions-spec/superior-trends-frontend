import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, RotateCw, ArrowRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PageHeader } from '../components/PageHeader';
import { useMyOrders, useCancelOrder } from '../hooks/useOrders';
import { ORDER_STATUS_LABELS, type OrderRow } from '../lib/orderTypes';
import { getProductImageUrl } from '../lib/optimizeImage';
import { formatINR } from '../lib/formatCurrency';
import { OrdersSkeleton } from '../components/ui/skeleton';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { pill: string; dot: string; label?: string }> = {
  PENDING: { pill: 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-sm shadow-amber-500/5', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
  PROCESSING: { pill: 'bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm shadow-blue-500/5', dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  SHIPPED: { pill: 'bg-violet-50 text-violet-700 border-violet-200/60 shadow-sm shadow-violet-500/5', dot: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' },
  DELIVERED: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm shadow-emerald-500/5', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  CANCELLED: { pill: 'bg-red-50 text-red-700 border-red-200/60 shadow-sm shadow-red-500/5', dot: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
  SUCCESS: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm shadow-emerald-500/5', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
  FAILED: { pill: 'bg-red-50 text-red-700 border-red-200/60 shadow-sm shadow-red-500/5', dot: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
};

function StatusPill({ status, label }: { status: string; label?: string }) {
  const { language } = useLanguage();
  const cfg = STATUS_CONFIG[status] || { pill: 'bg-neutral-50 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' };

  const getStatusLabel = (st: string) => {
    if (language === 'ar') {
      if (st === 'PENDING') return 'قيد الانتظار';
      if (st === 'PROCESSING') return 'قيد المعالجة';
      if (st === 'SHIPPED') return 'تم الشحن';
      if (st === 'DELIVERED') return 'تم التوصيل';
      if (st === 'CANCELLED') return 'ملغي';
      if (st === 'SUCCESS') return 'ناجح';
      if (st === 'FAILED') return 'فاشل';
      return st;
    }
    return ORDER_STATUS_LABELS[st as keyof typeof ORDER_STATUS_LABELS] || st;
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label ?? getStatusLabel(status)}
    </span>
  );
}

// ─── Order timeline strip ─────────────────────────────────────────────────────
const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;
type Step = typeof STEPS[number];

function OrderTimeline({ status }: { status: string }) {
  const { language } = useLanguage();
  if (status === 'CANCELLED') {
    return (
      <p className="text-[10px] uppercase tracking-widest text-red-500 font-extrabold inline-flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
        {language === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled'}
      </p>
    );
  }
  const currentIdx = STEPS.indexOf(status as Step);

  const getStepLabel = (st: string) => {
    if (language === 'ar') {
      if (st === 'PENDING') return 'قيد الانتظار';
      if (st === 'PROCESSING') return 'قيد المعالجة';
      if (st === 'SHIPPED') return 'تم الشحن';
      if (st === 'DELIVERED') return 'تم التوصيل';
      return st;
    }
    return ORDER_STATUS_LABELS[st as keyof typeof ORDER_STATUS_LABELS] || st;
  };

  return (
    <div className="flex items-center gap-0 py-2">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${active ? 'bg-[#8b1a2a] border-[#8b1a2a] ring-4 ring-[#8b1a2a]/15 scale-110 shadow-sm' :
                  done ? 'bg-[#8b1a2a] border-[#8b1a2a]' :
                    'bg-white border-neutral-300'
                }`} />
              <span className={`text-[10px] uppercase tracking-widest font-extrabold transition-colors ${done ? 'text-[#8b1a2a]' : 'text-neutral-400'
                }`}>
                {getStepLabel(step)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] w-10 sm:w-16 mb-4 transition-all duration-300 rounded-full ${i < currentIdx ? 'bg-gradient-to-r from-[#8b1a2a] to-[#8b1a2a]' : 'bg-neutral-200'
                }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const addr = order.shippingAddress as Record<string, string>;
  const cancelOrder = useCancelOrder();
  const { showToast } = useToast();
  const { language } = useLanguage();

  const handleCancel = async () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        await cancelOrder.mutateAsync(order.id);
        showToast(language === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully', 'success');
        onClose();
      } catch (err: any) {
        showToast(language === 'ar' ? 'فشل إلغاء الطلب' : (err.response?.data?.message || 'Failed to cancel order'), 'error');
      }
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-brand-border/20 bg-gradient-to-b from-[#faf8f5]/60 to-white overflow-hidden shadow-sm text-left rtl:text-right">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border/25 bg-[#faf7f3]">
        <p className="text-[10px] uppercase tracking-widest font-black text-[#8b1a2a]">{language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] uppercase tracking-widest font-black text-neutral-400 hover:text-[#8b1a2a] transition-colors"
        >
          {language === 'ar' ? 'إغلاق ✕' : 'Close ✕'}
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Status row */}
        <div className="flex flex-wrap gap-6 text-left rtl:text-right">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold mb-1.5">{language === 'ar' ? 'حالة الدفع' : 'Payment'}</p>
            <StatusPill status={order.paymentStatus} label={language === 'ar' ? `دفع: ${order.paymentStatus === 'SUCCESS' ? 'ناجح' : order.paymentStatus === 'PENDING' ? 'قيد الانتظار' : order.paymentStatus}` : undefined} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold mb-1.5">{language === 'ar' ? 'حالة التوصيل' : 'Delivery'}</p>
            <StatusPill
              status={order.orderStatus}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-brand-border/20" />

        {/* Shipping address */}
        <div className="text-left rtl:text-right">
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold mb-2.5">{language === 'ar' ? 'عنوان التوصيل' : 'Ships to'}</p>
          <address className="not-italic text-sm text-brand-text-muted leading-relaxed font-medium">
            <span className="font-extrabold text-brand-charcoal text-base">
              {addr.firstName || addr.fullName} {addr.lastName || ''}
            </span>
            <br />
            {addr.addressLine1 || addr.address}
            {(addr.addressLine2 || addr.apartment) ? `, ${addr.addressLine2 || addr.apartment}` : ''}
            <br />
            {addr.city}, {addr.pincode || addr.postalCode}
            <br />
            <span className="text-neutral-400 text-xs font-normal">{addr.email}</span>
          </address>
        </div>

        {/* Divider */}
        <div className="h-px bg-brand-border/20" />

        {/* Items */}
        <div className="text-left rtl:text-right">
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold mb-3.5">{language === 'ar' ? 'المنتجات في هذا الطلب' : 'Items in this order'}</p>
          <ul className="space-y-3.5">
            {order.items.map((item) => {
              const img = getProductImageUrl(item.image ? [item.image] : []);
              return (
                <li key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-brand-border/15 shadow-sm text-left rtl:text-right">
                  <div className="w-14 h-16 shrink-0 rounded-xl border border-brand-border/20 bg-brand-cream overflow-hidden shadow-inner">
                    {img
                      ? <img src={img} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">—</div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-brand-charcoal text-sm leading-snug line-clamp-2">
                      {item.productName}
                    </p>
                    <p className="text-brand-text-muted text-xs mt-1 font-semibold flex items-center gap-2">
                      <span>{language === 'ar' ? 'الكمية' : 'Qty'} {item.quantity}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-[#8b1a2a] font-extrabold">{formatINR(Number(item.price))}</span>
                    </p>
                  </div>
                  {order.orderStatus === 'DELIVERED' && (
                    item.reviewRating != null ? (
                      <span className="shrink-0 bg-[#d4af37]/8 border border-[#d4af37]/25 text-[#d4af37] font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-sm">
                        {language === 'ar' ? `التقييم ★${item.reviewRating}` : `Rated ★${item.reviewRating}`}
                      </span>
                    ) : (
                      <Link
                        to={`/product/${item.productId}?writeReview=true`}
                        className="shrink-0 inline-flex items-center justify-center border-2 border-[#8b1a2a] hover:bg-[#8b1a2a] hover:text-white text-[#8b1a2a] font-black text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        {language === 'ar' ? 'تقييم المنتج' : 'Write Review'}
                      </Link>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cancel */}
        {order.orderStatus === 'PENDING' && (
          <div className="pt-1 flex justify-end rtl:justify-start">
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelOrder.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-700 font-extrabold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {cancelOrder.isPending ? (language === 'ar' ? 'جاري الإلغاء…' : 'Cancelling…') : (language === 'ar' ? 'إلغاء الطلب' : 'Cancel Order')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const MyOrders: React.FC = () => {
  const { language } = useLanguage();
  const { data: orders, isLoading, isError, refetch, isFetching } = useMyOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('ALL');

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (statusFilter === 'ALL') return orders;
    if (statusFilter === 'PENDING') {
      return orders.filter(
        (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING'
      );
    }
    return orders.filter((o) => o.orderStatus === statusFilter);
  }, [orders, statusFilter]);

  return (
    <PageShell className="bg-brand-cream min-h-screen text-left rtl:text-right">
      {/* Page header */}
      <PageHeader
        eyebrow={language === 'ar' ? 'حسابك الشخصي' : 'Your Account'}
        title={language === 'ar' ? 'طلباتي' : 'My Orders'}
        subtitle={language === 'ar' ? 'تتبع حالة الدفع والتوصيل لكل طلبية قمت بها.' : 'Track payment and delivery status for every purchase.'}
        trailing={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8b1a2a] border border-[#8b1a2a]/25 px-4 py-2.5 rounded-full bg-white hover:bg-[#8b1a2a]/5 disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCw size={11} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? (language === 'ar' ? 'جاري التحديث' : 'Refreshing') : (language === 'ar' ? 'تحديث' : 'Refresh')}
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* States */}
        {isLoading ? (
          <OrdersSkeleton />
        ) : isError ? (
          <div className="text-center py-20 bg-white border border-brand-border/20 rounded-3xl p-8 shadow-sm">
            <p className="text-sm text-red-600 font-extrabold uppercase tracking-wider">{language === 'ar' ? 'تعذر تحميل قائمة طلباتك.' : "Couldn't load your orders."}</p>
            <p className="text-xs text-brand-text-muted mt-1 font-medium">{language === 'ar' ? 'يرجى تسجيل الدخول والمحاولة مرة أخرى.' : 'Please sign in and try again.'}</p>
          </div>
        ) : !orders?.length ? (
          <div className="relative text-center py-20 px-8 bg-white border border-brand-border/20 rounded-3xl max-w-md mx-auto shadow-lg shadow-black/5 overflow-hidden isolate">
            <div className="absolute top-0 left-1/2 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#8b1a2a]/6 border border-[#8b1a2a]/10 flex items-center justify-center mx-auto shadow-sm">
                <Package size={28} className="text-[#8b1a2a]" />
              </div>
              <div className="space-y-1.5 text-center">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-widest text-brand-charcoal">{language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</h2>
                <p className="text-sm text-brand-text-muted leading-relaxed font-medium">
                  {language === 'ar' ? 'قم بإكمال عملية شراء لتظهر طلباتك في هذه الصفحة.' : 'Complete a purchase and your orders will appear here.'}
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-[#7a1624] transition-colors shadow-md shadow-[#8b1a2a]/20"
              >
                {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'} <ArrowRight size={12} className="rtl:rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2 pb-4 justify-start">
              {([
                { key: 'ALL', label: language === 'ar' ? 'الكل' : 'All' },
                { key: 'PENDING', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
                { key: 'SHIPPED', label: language === 'ar' ? 'تم الشحن' : 'Shipped' },
                { key: 'DELIVERED', label: language === 'ar' ? 'تم التوصيل' : 'Delivered' },
                { key: 'CANCELLED', label: language === 'ar' ? 'ملغي' : 'Cancelled' },
              ] as const).map((tab) => {
                const count = orders.filter((o) => {
                  if (tab.key === 'ALL') return true;
                  if (tab.key === 'PENDING')
                    return (
                      o.orderStatus === 'PENDING' ||
                      o.orderStatus === 'PROCESSING'
                    );
                  return o.orderStatus === tab.key;
                }).length;

                const active = statusFilter === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setExpandedId(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm ${active
                        ? 'bg-[#8b1a2a] border-[#8b1a2a] text-white shadow-md shadow-[#8b1a2a]/20'
                        : 'bg-white border-brand-border/30 text-brand-charcoal hover:border-[#8b1a2a]/60'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 text-neutral-500'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white border border-brand-border/20 rounded-3xl p-8 shadow-sm">
                <p className="text-sm text-brand-charcoal font-extrabold uppercase tracking-wider">{language === 'ar' ? 'لم يتم العثور على طلبات.' : `No ${statusFilter.toLowerCase()} orders found.`}</p>
                <p className="text-xs text-brand-text-muted mt-1 font-medium">{language === 'ar' ? 'حاول تغيير الفلتر للحالة أعلاه.' : 'Try choosing a different status filter above.'}</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isOpen = expandedId === order.id;
                const date = new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                });

                return (
                  <article
                    key={order.id}
                    className="bg-white border border-brand-border/20 rounded-3xl shadow-[0_12px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_36px_rgba(139,26,42,0.05)] border-l-4 border-l-[#d4af37] text-left rtl:text-right"
                  >
                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Top row: order meta + total */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-neutral-100/60 pb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-widest text-[#d4af37] font-black bg-[#d4af37]/8 px-2 py-0.5 rounded">{language === 'ar' ? 'طلب' : 'Order'}</span>
                          <p className="font-display font-extrabold text-brand-charcoal text-base tracking-tight">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-brand-text-muted font-semibold">{date}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                          <StatusPill status={order.paymentStatus} label={language === 'ar' ? `دفع: ${order.paymentStatus === 'SUCCESS' ? 'ناجح' : order.paymentStatus === 'PENDING' ? 'قيد الانتظار' : order.paymentStatus}` : `Pay: ${order.paymentStatus}`} />
                          <StatusPill
                            status={order.orderStatus}
                          />
                          <span className="font-display font-black text-[#8b1a2a] text-xl sm:ml-2 tracking-tight">
                            {formatINR(Number(order.total))}
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="overflow-x-auto pb-1.5 w-full max-w-full min-w-0 scrollbar-none">
                        <OrderTimeline status={order.orderStatus} />
                      </div>

                      {/* Product thumbnails */}
                      <div className="flex gap-4 overflow-x-auto pb-2 w-full max-w-full min-w-0 scrollbar-none border-t border-neutral-100/60 pt-4">
                        {order.items.map((item) => {
                          const img = getProductImageUrl(item.image ? [item.image] : []);
                          const targetUrl = order.orderStatus === 'DELIVERED'
                            ? `/product/${item.productId}?writeReview=true`
                            : `/product/${item.productId}`;
                          return (
                            <Link
                              key={item.id}
                              to={targetUrl}
                              className="shrink-0 flex gap-3 items-center w-48 sm:w-56 hover:bg-neutral-50/60 p-2 rounded-2xl border border-brand-border/15 bg-[#fafaf8]/40 transition-all shadow-sm text-left rtl:text-right"
                            >
                              <div className="w-12 h-14 rounded-xl border border-brand-border/20 bg-brand-cream overflow-hidden shadow-inner shrink-0">
                                {img
                                  ? <img src={img} alt={item.productName} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300">—</div>
                                }
                              </div>
                              <div className="min-w-0 flex-grow">
                                <p className="font-extrabold text-[11px] uppercase tracking-wide text-brand-charcoal line-clamp-2 leading-snug">
                                  {item.productName}
                                </p>
                                <div className="flex items-center justify-between gap-1 mt-1 flex-wrap">
                                  <span className="text-brand-text-muted text-[10px] font-semibold">{language === 'ar' ? 'الكمية' : 'Qty'} {item.quantity}</span>
                                  {order.orderStatus === 'DELIVERED' && (
                                    item.reviewRating != null ? (
                                      <span className="text-[9px] font-bold text-[#d4af37] flex items-center gap-0.5 whitespace-nowrap bg-[#d4af37]/8 px-1.5 py-0.5 rounded">
                                        ★{item.reviewRating}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-black uppercase text-[#8b1a2a] hover:text-[#b22234] underline whitespace-nowrap">
                                        {language === 'ar' ? 'تقييم' : 'Rate'}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Expand toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : order.id)}
                        className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#8b1a2a] hover:text-[#6e1522] transition-colors group cursor-pointer"
                      >
                        {isOpen ? (language === 'ar' ? 'إخفاء التفاصيل' : 'Hide Details') : (language === 'ar' ? 'عرض التفاصيل' : 'View Details')}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:translate-y-0.5`}
                        />
                      </button>

                      {/* Expanded panel */}
                      {isOpen && <OrderDetailPanel order={order} onClose={() => setExpandedId(null)} />}
                    </div>
                  </article>
                );
              }))}
          </div>
        )}
      </div>
    </PageShell>
  );
};