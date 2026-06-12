import React, { useEffect } from 'react';
import { Loader2, Package, X, Mail, Phone, MapPin, CreditCard, Calendar, Truck, User, ShoppingBag } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { ORDER_STATUS_LABELS, type OrderRow, type OrderStatus } from '../../lib/orderTypes';
import { useToast } from '../../hooks/useToast';
import { formatINR } from '../../lib/formatCurrency';

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

/* ─── Scroll-lock helpers ─────────────────────────────────────────────────── */
const lockedElements: { el: HTMLElement; prev: string }[] = [];
function lockScroll() {
  document.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const style = window.getComputedStyle(el);
    const isScrollable =
      ['auto', 'scroll', 'overlay'].includes(style.overflowY) ||
      ['auto', 'scroll', 'overlay'].includes(style.overflow);
    if (isScrollable && el.scrollHeight > el.clientHeight) {
      lockedElements.push({ el, prev: el.style.overflow });
      el.style.overflow = 'hidden';
    }
  });
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}
function unlockScroll() {
  lockedElements.forEach(({ el, prev }) => { el.style.overflow = prev; });
  lockedElements.length = 0;
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function getPaymentMethod(order: OrderRow): string {
  const method = order.payments?.[0]?.paymentMethod?.toUpperCase();
  if (method === 'COD') return 'COD';
  if (method === 'RAZORPAY') return 'Razorpay';
  return method || '—';
}
function paymentMethodLabel(method: string) {
  if (method === 'COD') return 'Cash on Delivery';
  if (method === 'RAZORPAY') return 'Razorpay';
  return method;
}
function paymentStatusClass(status: string, method: string) {
  if (status === 'SUCCESS') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (method === 'COD')     return 'bg-blue-50   text-blue-700   border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}
function paymentStatusLabel(status: string, method: string) {
  if (status === 'SUCCESS') return 'Paid';
  if (method === 'COD')     return 'Pay on delivery';
  return status;
}
function orderStatusConfig(status: string): { cls: string; dot: string; label: string } {
  switch (status) {
    case 'PENDING':    return { cls: 'bg-neutral-100 text-neutral-600 border-neutral-200',   dot: 'bg-neutral-400',  label: 'Pending' };
    case 'PROCESSING': return { cls: 'bg-indigo-50  text-indigo-700  border-indigo-200',    dot: 'bg-indigo-500',   label: 'Processing' };
    case 'SHIPPED':    return { cls: 'bg-violet-50  text-violet-700  border-violet-200',    dot: 'bg-violet-500',   label: 'Shipped' };
    case 'DELIVERED':  return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',   dot: 'bg-emerald-500',  label: 'Delivered' };
    case 'CANCELLED':  return { cls: 'bg-red-50     text-red-700     border-red-200',       dot: 'bg-red-500',      label: 'Cancelled' };
    default:           return { cls: 'bg-neutral-100 text-neutral-600 border-neutral-200',  dot: 'bg-neutral-400',  label: status };
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export const AdminOrders: React.FC = () => {
  const { data: orders, isLoading, isError } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);

  /* scroll lock */
  useEffect(() => {
    if (selectedOrder) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [selectedOrder]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, orderStatus: newStatus });
      showToast(`Order updated to ${ORDER_STATUS_LABELS[newStatus as OrderStatus] || newStatus}`, 'success');
      if (selectedOrder?.id === orderId)
        setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus as OrderStatus } : null);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || 'Failed to update status';
      showToast(msg, 'error');
    }
  };

  /* stats */
  const total     = orders?.length ?? 0;
  const pending   = orders?.filter(o => o.orderStatus === 'PENDING').length   ?? 0;
  const shipped   = orders?.filter(o => o.orderStatus === 'SHIPPED').length   ?? 0;
  const delivered = orders?.filter(o => o.orderStatus === 'DELIVERED').length ?? 0;

  return (
    <>
      <div className="space-y-6 px-1">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={20} className="text-[#8b1a2a]" />
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Orders</h1>
            </div>
            <p className="text-sm text-neutral-500">Manage fulfillment for Razorpay and COD orders.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-[#8b1a2a]/8 text-[#8b1a2a] border border-[#8b1a2a]/20 text-[10px] font-bold uppercase tracking-wider">Razorpay</span>
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">COD</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total orders',  value: total,     color: 'text-neutral-800' },
            { label: 'Pending',       value: pending,   color: 'text-amber-600'   },
            { label: 'Shipped',       value: shipped,   color: 'text-violet-700'  },
            { label: 'Delivered',     value: delivered, color: 'text-emerald-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-neutral-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-[#8b1a2a]" size={22} />
            <span className="text-sm">Loading orders…</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center border border-dashed border-red-200 bg-red-50 rounded-2xl">
            <p className="text-red-600 text-sm font-semibold">Failed to load orders.</p>
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-20 border border-dashed border-neutral-200 bg-white rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <Package size={22} className="text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-600">No orders yet</p>
            <p className="text-xs text-neutral-400 mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80">
                    {['Order', 'Customer', 'Total', 'Method', 'Payment', 'Status', 'Date', 'Update', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order) => {
                    const payMethod = getPaymentMethod(order);
                    const sc = orderStatusConfig(order.orderStatus);
                    const isTerminal = order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED';
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-neutral-900">{order.orderNumber}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-neutral-800">{order.user?.name || 'Guest'}</p>
                          <p className="text-[10px] text-neutral-400 truncate max-w-[160px] mt-0.5">
                            {order.user?.email || (order.shippingAddress as any)?.email || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-[#8b1a2a]">{formatINR(Number(order.total))}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${payMethod === 'COD' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#8b1a2a]/8 text-[#8b1a2a] border-[#8b1a2a]/20'}`}>
                            {payMethod === 'COD' ? 'COD' : 'Razorpay'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${paymentStatusClass(order.paymentStatus, payMethod)}`}>
                            {paymentStatusLabel(order.paymentStatus, payMethod)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-neutral-500 whitespace-nowrap">
                          {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          {isTerminal ? (
                            <span className={`text-[10px] font-bold ${order.orderStatus === 'DELIVERED' ? 'text-emerald-600' : 'text-red-500'}`}>
                              {order.orderStatus === 'DELIVERED' ? '✓ Delivered' : '✕ Cancelled'}
                            </span>
                          ) : (
                            <select
                              value={order.orderStatus}
                              onChange={e => e.target.value !== order.orderStatus && handleStatusChange(order.id, e.target.value)}
                              disabled={updateStatus.isPending}
                              className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 text-[10px] font-semibold focus:outline-none focus:border-[#8b1a2a] hover:border-neutral-300 transition-colors cursor-pointer"
                            >
                              {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{ORDER_STATUS_LABELS[s] || s}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[10px] font-bold text-[#8b1a2a] hover:text-white bg-[#8b1a2a]/6 hover:bg-[#8b1a2a] px-3 py-1.5 rounded-lg border border-[#8b1a2a]/15 hover:border-[#8b1a2a] transition-all uppercase tracking-wider opacity-0 group-hover:opacity-100"
                          >
                            Details
                          </button>
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

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      {selectedOrder && (() => {
        const payMethod = getPaymentMethod(selectedOrder);
        const sc = orderStatusConfig(selectedOrder.orderStatus);
        return (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />

            {/* panel */}
            <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl pointer-events-none">
              <div className="pointer-events-auto w-full flex flex-col bg-white shadow-2xl border-l border-neutral-200 h-full">

                {/* Drawer header */}
                <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-neutral-900">Order Details</h2>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Drawer body — only THIS scrolls */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <div className="px-6 py-6 space-y-6">

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-neutral-50 rounded-xl border border-neutral-100 px-4 py-3">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Grand Total</div>
                        <div className="text-base font-bold text-[#8b1a2a]">{formatINR(Number(selectedOrder.total))}</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl border border-neutral-100 px-4 py-3">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Items</div>
                        <div className="text-base font-bold text-neutral-800">{selectedOrder.items?.length ?? 0}</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl border border-neutral-100 px-4 py-3">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Placed</div>
                        <div className="text-xs font-semibold text-neutral-700">
                          {new Date(selectedOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <SectionTitle icon={<User size={13} />}>Customer</SectionTitle>
                      <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InfoItem label="Name">{selectedOrder.user?.name || 'Guest'}</InfoItem>
                        <InfoItem label="Email">
                          <a
                            href={`mailto:${selectedOrder.user?.email || (selectedOrder.shippingAddress as any)?.email}`}
                            className="text-[#8b1a2a] hover:underline flex items-center gap-1"
                          >
                            <Mail size={11} />
                            <span className="truncate max-w-[140px]">
                              {selectedOrder.user?.email || (selectedOrder.shippingAddress as any)?.email || '—'}
                            </span>
                          </a>
                        </InfoItem>
                        <InfoItem label="Phone">
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-neutral-400" />
                            {selectedOrder.user?.phone || (selectedOrder.shippingAddress as any)?.phone || '—'}
                          </span>
                        </InfoItem>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <SectionTitle icon={<MapPin size={13} />}>Shipping Address</SectionTitle>
                        <AddressCard addr={selectedOrder.shippingAddress as any} />
                      </div>
                      <div>
                        <SectionTitle icon={<CreditCard size={13} />}>Billing Address</SectionTitle>
                        <AddressCard addr={(selectedOrder.billingAddress || selectedOrder.shippingAddress) as any} />
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <SectionTitle icon={<Package size={13} />}>
                        Items &nbsp;<span className="text-neutral-400 font-normal normal-case">({selectedOrder.items?.length ?? 0})</span>
                      </SectionTitle>
                      <div className="space-y-2">
                        {selectedOrder.items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                            <div className="w-14 h-14 shrink-0 rounded-lg border border-neutral-200 bg-white overflow-hidden">
                              {item.image
                                ? <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package size={18} /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-neutral-900 truncate">{item.productName}</p>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{item.sku}</p>
                              <span className="inline-block mt-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[9px] font-bold">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-neutral-900">{formatINR(Number(item.price))}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">= {formatINR(Number(item.price) * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment + Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <SectionTitle icon={<Truck size={13} />}>Payment</SectionTitle>
                        <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 space-y-3">
                          <Row label="Method">{paymentMethodLabel(payMethod)}</Row>
                          <Row label="Status">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${paymentStatusClass(selectedOrder.paymentStatus, payMethod)}`}>
                              {paymentStatusLabel(selectedOrder.paymentStatus, payMethod)}
                            </span>
                          </Row>
                          {selectedOrder.payments?.[0]?.razorpayOrderId && (
                            <div className="pt-2 border-t border-neutral-100">
                              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Razorpay Order ID</div>
                              <div className="text-[10px] font-mono text-neutral-600 break-all">{selectedOrder.payments[0].razorpayOrderId}</div>
                            </div>
                          )}
                          {selectedOrder.payments?.[0]?.razorpayPaymentId && (
                            <div>
                              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Razorpay Payment ID</div>
                              <div className="text-[10px] font-mono text-neutral-600 break-all">{selectedOrder.payments[0].razorpayPaymentId}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <SectionTitle icon={<Calendar size={13} />}>Amount Breakdown</SectionTitle>
                        <div className="bg-[#8b1a2a]/4 rounded-xl border border-[#8b1a2a]/10 p-4 space-y-2">
                          <Row label="Subtotal">{formatINR(Number(selectedOrder.subtotal))}</Row>
                          {Number(selectedOrder.discount) > 0 && (
                            <Row label="Discount" className="text-emerald-600">
                              <span className="text-emerald-600">−{formatINR(Number(selectedOrder.discount))}</span>
                            </Row>
                          )}
                          <Row label="Delivery">
                            {Number(selectedOrder.shipping) === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(Number(selectedOrder.shipping))}
                          </Row>
                          {Number(selectedOrder.tax) > 0 && (
                            <Row label="GST / Tax">{formatINR(Number(selectedOrder.tax))}</Row>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-[#8b1a2a]/15">
                            <span className="text-sm font-bold text-neutral-900">Grand Total</span>
                            <span className="text-base font-bold text-[#8b1a2a]">{formatINR(Number(selectedOrder.total))}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedOrder.notes && (
                      <div>
                        <SectionTitle>Customer Note</SectionTitle>
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 text-xs text-amber-900 italic leading-relaxed">
                          "{selectedOrder.notes}"
                        </div>
                      </div>
                    )}

                    {/* Status updater in drawer */}
                    {selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED' && (
                      <div className="pb-2">
                        <SectionTitle>Update Status</SectionTitle>
                        <div className="flex flex-wrap gap-2">
                          {ALL_STATUSES.filter(s => s !== selectedOrder.orderStatus).map(s => {
                            const cfg = orderStatusConfig(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleStatusChange(selectedOrder.id, s)}
                                disabled={updateStatus.isPending}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider transition-all hover:shadow-sm active:scale-95 disabled:opacity-50 ${cfg.cls}`}
                              >
                                {updateStatus.isPending ? <Loader2 size={10} className="animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

/* ─── Small sub-components ────────────────────────────────────────────────── */
function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon && <span className="text-[#8b1a2a]">{icon}</span>}
      <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{children}</h3>
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs font-semibold text-neutral-800">{children}</div>
    </div>
  );
}

function Row({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between items-center text-xs ${className ?? ''}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-800">{children}</span>
    </div>
  );
}

function AddressCard({ addr }: { addr: any }) {
  if (!addr) return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 text-xs text-neutral-400 min-h-[100px] flex items-center">
      No address provided
    </div>
  );
  return (
    <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4 text-xs text-neutral-700 leading-relaxed space-y-0.5">
      <p className="font-bold text-neutral-900">{addr.firstName} {addr.lastName || addr.fullName}</p>
      <p>{addr.addressLine1 || addr.address}</p>
      {(addr.addressLine2 || addr.apartment) && <p>{addr.addressLine2 || addr.apartment}</p>}
      <p>{addr.city}, {addr.state} — {addr.pincode || addr.postalCode}</p>
      <p className="text-[10px] font-bold text-neutral-400 uppercase">{addr.country || 'India'}</p>
      {addr.phone && <p className="text-[10px] text-neutral-500 flex items-center gap-1 pt-1"><Phone size={10} />{addr.phone}</p>}
    </div>
  );
}