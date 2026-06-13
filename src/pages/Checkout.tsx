import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Smartphone,
  Banknote,
  CreditCard,
  ShoppingBag,
  Tag,
  Truck,
  Sparkles,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '../lib/optimizeImage';
import { formatINR } from '../lib/formatCurrency';
import { createCheckoutOrder, createRazorpayOrder, verifyRazorpayPayment } from '../lib/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../lib/razorpay';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../hooks/useSettings';
import { useApplyCouponMutation, useActiveCoupons } from '../hooks/useCoupons';
import type { OrderRow } from '../lib/orderTypes';
import { useLanguage } from '../context/LanguageContext';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
type PaymentMethod = 'RAZORPAY' | 'COD';

/* ── Tiny field wrapper ─────────────────────────────────────────── */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] uppercase tracking-[0.18em] font-extrabold text-neutral-400">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  'w-full border-2 border-brand-border/50 bg-white rounded-xl px-4 py-3 text-sm text-brand-charcoal placeholder:text-neutral-300 focus:outline-none focus:border-[#d4af37] transition-colors duration-200 font-medium';

/* ── Step dots ─────────────────────────────────────────────────── */
const STEPS: { key: CheckoutStep; label: string; num: string }[] = [
  { key: 'shipping', label: 'Shipping', num: '01' },
  { key: 'payment', label: 'Payment', num: '02' },
  { key: 'confirmation', label: 'Confirmed', num: '03' },
];

function StepBar({ step }: { step: CheckoutStep }) {
  const { language } = useLanguage();
  const idx = STEPS.findIndex((s) => s.key === step);

  const getStepLabel = (key: CheckoutStep) => {
    if (language === 'ar') {
      if (key === 'shipping') return 'الشحن';
      if (key === 'payment') return 'الدفع';
      return 'تأكيد الطلب';
    }
    if (key === 'shipping') return 'Shipping';
    if (key === 'payment') return 'Payment';
    return 'Confirmed';
  };

  return (
    <div className="relative mb-14">
      {/* Background line */}
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-neutral-200 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-[#8b1a2a] via-[#b22234] to-[#d4af37] rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${(idx / (STEPS.length - 1)) * 100}%`,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative flex justify-between items-start">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;

          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center"
            >
              {/* Circle */}
              <motion.div
                animate={{
                  scale: active ? 1.12 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                }}
                className={`
                  relative
                  w-11
                  h-11
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  ${
                    active
                      ? 'bg-[#8b1a2a] border-[#8b1a2a] shadow-[0_0_25px_rgba(139,26,42,0.35)]'
                      : done
                      ? 'bg-gradient-to-br from-[#8b1a2a] to-[#b22234] border-[#8b1a2a]'
                      : 'bg-white border-neutral-300'
                  }
                `}
              >
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#8b1a2a]"
                    animate={{
                      scale: [1, 1.4],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                    }}
                  />
                )}

                {done ? (
                  <CheckCircle2
                    size={18}
                    className="text-white"
                  />
                ) : (
                  <span
                    className={`font-black text-sm ${
                      active
                        ? 'text-white'
                        : 'text-neutral-400'
                    }`}
                  >
                    {s.num}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-3 flex flex-col items-center">
                <span
                  className={`
                    text-[11px]
                    uppercase
                    tracking-[0.25em]
                    font-black
                    transition-all
                    duration-300
                    ${
                      active
                        ? 'text-[#8b1a2a]'
                        : done
                        ? 'text-brand-charcoal'
                        : 'text-neutral-400'
                    }
                  `}
                >
                  {getStepLabel(s.key)}
                </span>

                {active && (
                  <motion.div
                    layoutId="active-step-indicator"
                    className="mt-2 h-1 w-10 rounded-full bg-gradient-to-r from-[#8b1a2a] to-[#d4af37]"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { cart, cartTotal, discount, clearCart } = useShop();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { showToast } = useToast();

  const { data: settings } = useSettings();
  const { data: activeCoupons } = useActiveCoupons();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const applyCouponMutation = useApplyCouponMutation();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [payLoading, setPayLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRow | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: '',
    state: 'India',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?redirect=/checkout', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        firstName: user.name?.split(' ')[0] || prev.firstName,
        lastName: user.name?.split(' ').slice(1).join(' ') || prev.lastName,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateShipping = () => {
    const errors: Record<string, string> = {};
    const isAr = language === 'ar';
    if (!formData.email) errors.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (!formData.firstName) errors.firstName = isAr ? 'الاسم الأول مطلوب' : 'First name is required';
    if (!formData.lastName) errors.lastName = isAr ? 'الاسم الأخير مطلوب' : 'Last name is required';
    if (!formData.address) errors.address = isAr ? 'العنوان مطلوب' : 'Address is required';
    if (!formData.city) errors.city = isAr ? 'المدينة مطلوبة' : 'City is required';
    if (!formData.postalCode) errors.postalCode = isAr ? 'الرمز البريدي مطلوب' : 'Postal code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await applyCouponMutation.mutateAsync({ code: couponCode.trim(), subtotal: cartTotal });
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      showToast(language === 'ar' ? 'تم تطبيق القسيمة! 🎉' : 'Coupon applied! 🎉', 'success');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid coupon code';
      setCouponError(language === 'ar' ? 'كود القسيمة غير صالح' : msg);
      showToast(language === 'ar' ? 'كود القسيمة غير صالح' : msg, 'error');
    }
  };

  const codAllowed = settings?.cod_allowed !== 'false';
  const freeShippingThreshold = Number(settings?.free_shipping_threshold ?? '1500');
  const standardShippingCharge = Number(settings?.shipping_charge ?? '100');
  const shippingFee = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : standardShippingCharge;

  const systemDiscount = cartTotal * discount;
  const finalDiscount = systemDiscount + couponDiscount;
  const grandTotal = Math.round(cartTotal - finalDiscount + shippingFee);

  const buildOrderPayload = () => ({
    shippingAddress: { ...formData },
    items: cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0],
    })),
    subtotal: cartTotal,
    discount: finalDiscount,
    shipping: shippingFee,
    tax: 0,
    total: grandTotal,
  });

  const handlePayWithCod = async () => {
    if (!validateShipping()) { setStep('shipping'); showToast(language === 'ar' ? 'يرجى إكمال تفاصيل الشحن' : 'Please complete shipping details', 'error'); return; }
    setPayLoading(true);
    try {
      const order = await createCheckoutOrder({ ...buildOrderPayload(), paymentMethod: 'COD' });
      await clearCart();
      setConfirmedOrder(order);
      setStep('confirmation');
      showToast(language === 'ar' ? 'تم تسجيل طلبك! الدفع عند الاستلام.' : 'Order placed! Pay cash on delivery.', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not place order. Please try again.';
      showToast(language === 'ar' ? 'فشل تسجيل الطلب. يرجى المحاولة مرة أخرى.' : msg, 'error');
    } finally { setPayLoading(false); }
  };

  const handlePayWithRazorpay = async () => {
    if (!validateShipping()) { setStep('shipping'); showToast(language === 'ar' ? 'يرجى إكمال تفاصيل الشحن' : 'Please complete shipping details', 'error'); return; }
    setPayLoading(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) { showToast(language === 'ar' ? 'تعذر تحميل بوابة الدفع. تحقق من اتصالك.' : 'Could not load payment gateway. Check your connection.', 'error'); return; }
      const order = await createCheckoutOrder({ ...buildOrderPayload(), paymentMethod: 'RAZORPAY' });
      const { razorpayOrder, keyId } = await createRazorpayOrder(order.id);
      openRazorpayCheckout({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'OMR',
        name: language === 'ar' ? 'سوبريور تريندز' : 'Superior Trends',
        description: `${language === 'ar' ? 'الطلب رقم' : 'Order'} ${order.orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: { name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email, contact: formData.phone },
        theme: { color: '#8b1a2a' },
        handler: async (response) => {
          try {
            const { order: verified } = await verifyRazorpayPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            await clearCart();
            setConfirmedOrder(verified || order);
            setStep('confirmation');
            showToast(language === 'ar' ? 'تم الدفع بنجاح! شكراً لك ✦' : 'Payment successful! Thank you ✦', 'success');
          } catch {
            showToast(language === 'ar' ? 'تم استلام الدفعة ولكن فشل التحقق. اتصل بالدعم الفني.' : 'Payment received but verification failed. Contact support with your payment ID.', 'error');
          } finally { setPayLoading(false); }
        },
        modal: { ondismiss: () => { setPayLoading(false); showToast(language === 'ar' ? 'تم إلغاء عملية الدفع' : 'Payment cancelled', 'info'); } },
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not start payment. Please try again.';
      showToast(language === 'ar' ? 'تعذر بدء عملية الدفع. يرجى المحاولة مرة أخرى.' : msg, 'error');
      setPayLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping' && validateShipping()) setStep('payment');
  };

  /* ── Loading ── */
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 font-display">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={32} />
        <span className="text-xs uppercase tracking-widest text-brand-text-muted font-bold">
          {language === 'ar' ? 'جاري التحميل…' : 'Loading…'}
        </span>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 font-display">
        <div className="w-20 h-20 rounded-full bg-[#8b1a2a]/8 flex items-center justify-center">
          <ShoppingBag size={32} className="text-[#8b1a2a]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-display text-2xl font-extrabold uppercase text-brand-charcoal">
            {language === 'ar' ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
          </h2>
          <p className="text-sm text-brand-text-muted">
            {language === 'ar' ? 'أضف بعض المنتجات قبل إتمام الطلب.' : 'Add some items before checking out.'}
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#8b1a2a] text-white px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-full shadow-lg shadow-[#8b1a2a]/25 hover:bg-[#6b1420] transition-all"
        >
          {language === 'ar' ? 'تصفح التشكيلة' : 'Browse Collection'}
          <ArrowRight size={14} className="rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  /* ── Order Summary sidebar (shared) ── */
  const OrderSummary = () => (
    <div className="bg-white border border-brand-border/30 rounded-2xl shadow-sm overflow-hidden sticky top-24 text-left rtl:text-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8b1a2a] to-[#6b1420] px-5 py-4 flex items-center gap-2">
        <ShoppingBag size={16} className="text-white/80" />
        <h3 className="font-display font-extrabold uppercase tracking-wider text-sm text-white">
          {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
        </h3>
        <span className="ml-auto rtl:ml-0 rtl:mr-auto text-[10px] font-black text-white/70 bg-white/15 px-2 py-0.5 rounded-full">
          {cart.reduce((s, i) => s + i.quantity, 0)} {language === 'ar' ? 'منتجات' : 'items'}
        </span>
      </div>

      {/* Cart items */}
      <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
        {cart.map((item, idx) => {
          const imageUrl = getProductImageUrl(item.product.images, 120);
          return (
            <div key={idx} className="flex gap-3 p-4 text-left rtl:text-right">
              <div className="w-14 h-16 shrink-0 rounded-xl overflow-hidden bg-[#F3EFEA] border border-brand-border/20">
                {imageUrl && <img src={imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-[11px] uppercase text-brand-charcoal line-clamp-2 leading-snug">
                  {item.product.name}
                </p>
                <p className="text-[10px] text-brand-text-muted mt-0.5">
                  {item.selectedSize && <span>{language === 'ar' ? 'المقاس' : 'Size'} {item.selectedSize} · </span>}
                  {language === 'ar' ? 'الكمية' : 'Qty'} {item.quantity}
                </p>
              </div>
              <span className="font-black text-[#8b1a2a] text-sm shrink-0 self-center">
                {formatINR(item.product.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Coupon */}
      <div className="border-t border-neutral-100 p-4 space-y-3">
        <button
          type="button"
          onClick={() => setCouponOpen((p) => !p)}
          className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-extrabold text-brand-charcoal"
        >
          <span className="flex items-center gap-1.5 text-left rtl:text-right">
            <Tag size={12} className="text-[#d4af37]" />
            {language === 'ar' ? 'رمز ترويجي' : 'Promo Code'}
            {appliedCoupon && (
              <span className="text-emerald-600 text-[9px] font-black">({language === 'ar' ? 'مطبق!' : 'Applied!'})</span>
            )}
          </span>
          <motion.div animate={{ rotate: couponOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={13} className="text-neutral-400" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {couponOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden space-y-2"
            >
              {/* Available coupons dropdown */}
              {activeCoupons && activeCoupons.length > 0 && !appliedCoupon && (
                <select
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (!val) return;
                    setCouponCode(val);
                    setCouponError('');
                    try {
                      const res = await applyCouponMutation.mutateAsync({ code: val, subtotal: cartTotal });
                      setAppliedCoupon(res.coupon);
                      setCouponDiscount(res.discount);
                      showToast(language === 'ar' ? 'تم تطبيق القسيمة! 🎉' : 'Coupon applied! 🎉', 'success');
                    } catch (err: unknown) {
                      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid coupon';
                      setCouponError(language === 'ar' ? 'كود القسيمة غير صالح' : msg);
                    }
                  }}
                  className="w-full text-[10px] font-bold uppercase px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 focus:outline-none cursor-pointer tracking-wider"
                >
                  <option value="">{language === 'ar' ? '— العروض المتاحة —' : '— Available Offers —'}</option>
                  {activeCoupons.map((c) => {
                    const meetsMin = cartTotal >= c.minimumOrder;
                    const text =
                      c.type === 'PERCENTAGE'
                        ? `${c.code} · ${c.value}% OFF${Number(c.minimumOrder) > 0 ? ` (Min ₹${c.minimumOrder})` : ''}`
                        : `${c.code} · ₹${c.value} OFF${Number(c.minimumOrder) > 0 ? ` (Min ₹${c.minimumOrder})` : ''}`;
                    return (
                      <option key={c.id} value={c.code} className={meetsMin ? '' : 'text-neutral-300'}>
                        {text} {!meetsMin ? '🔒' : '✅'}
                      </option>
                    );
                  })}
                </select>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="FESTIVE150"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                  disabled={appliedCoupon != null}
                  className="flex-1 px-3 py-2.5 border-2 border-brand-border/40 rounded-xl text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#d4af37] disabled:bg-neutral-50 disabled:opacity-60 transition-colors"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(''); }}
                    className="bg-red-50 text-red-600 border-2 border-red-200 px-3 py-2 rounded-xl text-xs font-extrabold uppercase hover:bg-red-100 transition-colors"
                  >
                    {language === 'ar' ? 'إزالة' : 'Remove'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyCouponMutation.isPending || !couponCode.trim()}
                    className="bg-[#8b1a2a] text-white px-4 py-2 rounded-xl text-xs font-extrabold uppercase hover:bg-[#6b1420] disabled:opacity-50 transition-colors"
                  >
                    {applyCouponMutation.isPending ? '…' : (language === 'ar' ? 'تطبيق' : 'Apply')}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="text-[10px] text-emerald-600 font-black flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {language === 'ar' ? `تم تطبيق ${appliedCoupon.code} — توفير ` : `${appliedCoupon.code} applied — saving `} {formatINR(couponDiscount)}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pricing breakdown */}
      <div className="border-t border-neutral-100 p-4 space-y-2.5">
        <div className="flex justify-between text-sm text-brand-text-muted">
          <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span className="font-semibold text-brand-charcoal">{formatINR(cartTotal)}</span>
        </div>
        {finalDiscount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span className="font-semibold">{language === 'ar' ? 'الخصم' : 'Discount'}</span>
            <span className="font-extrabold">-{formatINR(finalDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-brand-text-muted">
          <span className="flex items-center gap-1">
            <Truck size={12} className="text-[#d4af37]" />
            {language === 'ar' ? 'الشحن' : 'Shipping'}
          </span>
          {shippingFee === 0 ? (
            <span className="text-emerald-600 font-extrabold text-xs uppercase">{language === 'ar' ? 'مجاني' : 'Free'}</span>
          ) : (
            <span className="font-semibold text-brand-charcoal">{formatINR(shippingFee)}</span>
          )}
        </div>
        {cartTotal < freeShippingThreshold && shippingFee > 0 && (
          <p className="text-[10px] text-[#8b1a2a] font-semibold bg-[#8b1a2a]/5 rounded-lg px-2 py-1.5">
            {language === 'ar' ? 'أضف ' : 'Add '} {formatINR(freeShippingThreshold - cartTotal)} {language === 'ar' ? ' إضافية للحصول على شحن مجاني' : ' more for free shipping'}
          </p>
        )}

        {/* Grand total */}
        <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-dashed border-[#d4af37]/30">
          <span className="font-extrabold uppercase tracking-wider text-brand-charcoal text-sm">{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
          <span className="font-black text-[#8b1a2a] text-2xl tracking-tight">{formatINR(grandTotal)}</span>
        </div>
      </div>

      {/* Secure badge */}
      <div className="border-t border-neutral-100 px-4 py-3 flex items-center justify-center gap-1.5">
        <Lock size={11} className="text-[#d4af37]" />
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-text-muted">
          {language === 'ar' ? 'دفع آمن ومشفّر بالكامل' : 'Secure · Encrypted Checkout'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-brand-cream font-display">
      {/* Top brand bar */}
      <div className="border-b border-brand-border/20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-base font-black uppercase tracking-widest text-brand-charcoal">
            {language === 'ar' ? 'سوبريور ' : 'Superior '}<span className="text-[#8b1a2a]">{language === 'ar' ? 'تريندز' : 'Trends'}</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-text-muted font-bold">
            <Lock size={11} className="text-[#d4af37]" />
            {language === 'ar' ? 'إتمام الدفع الآمن' : 'Secure Checkout'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step bar */}
        <StepBar step={step} />

        <AnimatePresence mode="wait">
          {/* ── Confirmation ── */}
          {step === 'confirmation' ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white border border-brand-border/30 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
                {/* Celebration header */}
                <div className="bg-gradient-to-br from-[#8b1a2a] via-[#6b1420] to-[#4a0e18] px-8 py-10 text-center relative overflow-hidden">
                  {/* decorative orbs */}
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#d4af37]/15 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4 relative z-10"
                  >
                    <CheckCircle2 size={40} className="text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="relative z-10 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-extrabold mb-1">
                      <Sparkles className="inline mr-1" size={10} />
                      {language === 'ar' ? 'شكراً لك' : 'Thank you'}
                    </p>
                    <h2 className="font-display text-3xl font-black text-white uppercase tracking-tight">
                      {language === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
                    </h2>
                  </motion.div>
                </div>

                {/* Order details body */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-8 space-y-5 text-left rtl:text-right"
                >
                  {confirmedOrder?.orderNumber && (
                    <div className="bg-[#d4af37]/8 border border-[#d4af37]/25 rounded-xl px-5 py-4 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mb-1">
                        {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                      </p>
                      <p className="font-mono font-black text-xl text-[#8b1a2a] tracking-wider">
                        {confirmedOrder.orderNumber}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-brand-text-muted text-center leading-relaxed">
                    {language === 'ar' ? 'تم إرسال تأكيد الطلب إلى ' : 'A confirmation has been sent to '}{' '}
                    <strong className="text-brand-charcoal">{formData.email}</strong>.
                  </p>

                  <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex items-start gap-3 text-left rtl:text-right">
                    {confirmedOrder?.payments?.[0]?.paymentMethod === 'COD' || paymentMethod === 'COD' ? (
                      <>
                        <Banknote size={18} className="text-[#d4af37] mt-0.5 shrink-0" />
                        <p className="text-sm text-brand-text-muted">
                          <strong className="text-brand-charcoal">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</strong> — {language === 'ar' ? 'ادفع ' : 'Pay '}{' '}
                          <strong className="text-[#8b1a2a]">
                            {formatINR(Number(confirmedOrder?.total ?? grandTotal))}
                          </strong>{' '}
                          {language === 'ar' ? ' عند وصول طلبك.' : ' when your order arrives.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} className="text-[#d4af37] mt-0.5 shrink-0" />
                        <p className="text-sm text-brand-text-muted">
                          <strong className="text-brand-charcoal">{language === 'ar' ? 'تم الدفع بنجاح' : 'Payment Successful'}</strong> — {language === 'ar' ? 'اكتمل الدفع بأمان عبر البوابة الإلكترونية.' : 'Completed securely via Razorpay.'}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <Package size={15} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 font-semibold">
                      {language === 'ar' ? 'التوصيل المتوقع خلال ٣-٥ أيام عمل' : 'Estimated delivery in 3–5 business days'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      to="/orders"
                      className="flex-1 bg-[#8b1a2a] text-white py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl text-center shadow-md shadow-[#8b1a2a]/25 hover:bg-[#6b1420] transition-all"
                    >
                      {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
                    </Link>
                    <Link
                      to="/shop"
                      className="flex-1 border-2 border-brand-border/50 text-brand-charcoal py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl text-center hover:border-[#d4af37] transition-all"
                    >
                      {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ── Funnel ── */
            <motion.div
              key="funnel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start"
            >
              {/* LEFT — form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleNextStep}>
                  <AnimatePresence mode="wait">
                    {/* ── Shipping Step ── */}
                    {step === 'shipping' && (
                      <motion.div
                        key="shipping-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-brand-border/30 rounded-2xl shadow-sm overflow-hidden"
                      >
                        {/* Form header */}
                        <div className="px-6 sm:px-8 py-5 border-b border-brand-border/20 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#8b1a2a] flex items-center justify-center">
                            <Truck size={15} className="text-white" />
                          </div>
                          <div className="text-left rtl:text-right">
                            <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-brand-charcoal">
                              {language === 'ar' ? 'تفاصيل الشحن' : 'Shipping Details'}
                            </h2>
                            <p className="text-[10px] text-brand-text-muted">{language === 'ar' ? 'أين ترغب في توصيل الطلب؟' : 'Where should we deliver?'}</p>
                          </div>
                        </div>

                        <div className="px-6 sm:px-8 py-6 space-y-4 text-left rtl:text-right">
                          <Field label={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} error={formErrors.email}>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="you@example.com"
                              className={inputCls}
                            />
                          </Field>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label={language === 'ar' ? 'الاسم الأول' : 'First Name'} error={formErrors.firstName}>
                              <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder={language === 'ar' ? 'الاسم' : 'Anjali'}
                                className={inputCls}
                              />
                            </Field>
                            <Field label={language === 'ar' ? 'الاسم الأخير' : 'Last Name'} error={formErrors.lastName}>
                              <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder={language === 'ar' ? 'الكنية' : 'Kapoor'}
                                className={inputCls}
                              />
                            </Field>
                          </div>

                          <Field label={language === 'ar' ? 'عنوان الشارع' : 'Street Address'} error={formErrors.address}>
                            <input
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="123 MG Road"
                              className={inputCls}
                            />
                          </Field>

                          <Field label={language === 'ar' ? 'الشقة / الجناح (اختياري)' : 'Apartment / Suite (optional)'}>
                            <input
                              name="apartment"
                              value={formData.apartment}
                              onChange={handleInputChange}
                              placeholder="Apt 4B, Floor 2…"
                              className={inputCls}
                            />
                          </Field>

                          <div className="grid grid-cols-2 gap-4">
                            <Field label={language === 'ar' ? 'المدينة' : 'City'} error={formErrors.city}>
                              <input
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Mumbai"
                                className={inputCls}
                              />
                            </Field>
                            <Field label={language === 'ar' ? 'الرمز البريدي' : 'PIN Code'} error={formErrors.postalCode}>
                              <input
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                placeholder="400001"
                                className={inputCls}
                              />
                            </Field>
                          </div>

                          <Field label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}>
                            <input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+968 9000 0000"
                              className={inputCls}
                            />
                          </Field>
                        </div>

                        {/* Actions */}
                        <div className="px-6 sm:px-8 py-5 border-t border-brand-border/20 flex items-center justify-between">
                          <Link
                            to="/shop"
                            className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-extrabold text-brand-text-muted hover:text-brand-charcoal transition-colors"
                          >
                            <ArrowLeft size={13} className="rtl:rotate-180" />
                            {language === 'ar' ? 'العودة إلى المتجر' : 'Back to Shop'}
                          </Link>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 bg-[#8b1a2a] text-white px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-md shadow-[#8b1a2a]/25 hover:bg-[#6b1420] transition-all"
                          >
                            {language === 'ar' ? 'الانتقال إلى الدفع' : 'Continue to Payment'}
                            <ArrowRight size={14} className="rtl:rotate-180" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Payment Step ── */}
                    {step === 'payment' && (
                      <motion.div
                        key="payment-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-brand-border/30 rounded-2xl shadow-sm overflow-hidden"
                      >
                        {/* Header */}
                        <div className="px-6 sm:px-8 py-5 border-b border-brand-border/20 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#8b1a2a] flex items-center justify-center">
                            <Lock size={14} className="text-white" />
                          </div>
                          <div className="text-left rtl:text-right">
                            <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-brand-charcoal">
                              {language === 'ar' ? 'الدفع' : 'Payment'}
                            </h2>
                            <p className="text-[10px] text-brand-text-muted">{language === 'ar' ? 'اختر طريقة الدفع المفضلة' : 'Choose your payment method'}</p>
                          </div>
                        </div>

                        <div className="px-6 sm:px-8 py-6 space-y-5 text-left rtl:text-right">
                          {/* Shipping summary pill */}
                          <div className="flex items-start gap-3 bg-[#f9f7f4] border border-brand-border/20 rounded-xl px-4 py-3 text-left rtl:text-right">
                            <Truck size={14} className="text-[#d4af37] mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-widest font-extrabold text-brand-text-muted mb-0.5">
                                {language === 'ar' ? 'جاري التوصيل إلى' : 'Delivering to'}
                              </p>
                              <p className="text-sm font-bold text-brand-charcoal truncate">
                                {formData.firstName} {formData.lastName} — {formData.address}, {formData.city}{' '}
                                {formData.postalCode}
                              </p>
                            </div>
                          </div>

                          {/* Payment method cards */}
                          <div className={`grid gap-3 ${codAllowed ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {/* Razorpay */}
                            <motion.button
                              type="button"
                              onClick={() => setPaymentMethod('RAZORPAY')}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`text-left rtl:text-right p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                                paymentMethod === 'RAZORPAY'
                                  ? 'border-[#8b1a2a] bg-[#8b1a2a]/4 shadow-lg shadow-[#8b1a2a]/10'
                                  : 'border-brand-border/40 hover:border-[#8b1a2a]/40 bg-white'
                              }`}
                            >
                              {paymentMethod === 'RAZORPAY' && (
                                <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-4 h-4 rounded-full bg-[#8b1a2a] flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                              )}
                              <div className="w-10 h-10 rounded-xl bg-[#8b1a2a]/10 flex items-center justify-center mb-3">
                                <CreditCard size={20} className={paymentMethod === 'RAZORPAY' ? 'text-[#8b1a2a]' : 'text-neutral-400'} />
                              </div>
                              <p className="font-extrabold text-sm uppercase text-brand-charcoal tracking-wide">Razorpay</p>
                              <p className="text-[11px] text-brand-text-muted mt-1">{language === 'ar' ? 'البطاقات والتحويل الرقمي' : 'UPI · Cards · Net Banking'}</p>
                            </motion.button>

                            {/* COD */}
                            {codAllowed && (
                              <motion.button
                                type="button"
                                onClick={() => setPaymentMethod('COD')}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`text-left rtl:text-right p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                                  paymentMethod === 'COD'
                                    ? 'border-[#8b1a2a] bg-[#8b1a2a]/4 shadow-lg shadow-[#8b1a2a]/10'
                                    : 'border-brand-border/40 hover:border-[#8b1a2a]/40 bg-white'
                                }`}
                              >
                                {paymentMethod === 'COD' && (
                                  <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-4 h-4 rounded-full bg-[#8b1a2a] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                )}
                                <div className="w-10 h-10 rounded-xl bg-[#8b1a2a]/10 flex items-center justify-center mb-3">
                                  <Banknote size={20} className={paymentMethod === 'COD' ? 'text-[#8b1a2a]' : 'text-neutral-400'} />
                                </div>
                                <p className="font-extrabold text-sm uppercase text-brand-charcoal tracking-wide">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</p>
                                <p className="text-[11px] text-brand-text-muted mt-1">{language === 'ar' ? 'الدفع عند الاستلام' : 'Pay when you receive'}</p>
                              </motion.button>
                            )}
                          </div>

                          {/* Info callout */}
                          {paymentMethod === 'RAZORPAY' ? (
                            <div className="flex gap-3 bg-[#faf8f5] border border-brand-border/30 rounded-xl p-4 text-left rtl:text-right">
                              <Smartphone size={18} className="text-[#8b1a2a] shrink-0 mt-0.5" />
                              <p className="text-xs text-brand-text-muted leading-relaxed">
                                {language === 'ar' ? `سيتم توجيهك بأمان لإتمام عملية دفع بقيمة ` : `You'll be securely redirected to Razorpay to complete payment of `}
                                <strong className="text-brand-charcoal">{formatINR(grandTotal)}</strong>.
                              </p>
                            </div>
                          ) : (
                            <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-left rtl:text-right">
                              <Banknote size={18} className="text-blue-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-800 leading-relaxed">
                                {language === 'ar' ? 'أرسل طلبك الآن. يرجى تجهيز مبلغ ' : 'Place your order now. Pay '}
                                <strong>{formatINR(grandTotal)}</strong> {language === 'ar' ? ' نقداً عند استلام طلبك.' : ' in cash when the order arrives at your door.'}
                              </p>
                            </div>
                          )}

                          {/* Pay CTA */}
                          <div className="flex justify-center w-full pt-2">
                            <motion.button
                              type="button"
                              onClick={paymentMethod === 'COD' ? handlePayWithCod : handlePayWithRazorpay}
                              disabled={payLoading}
                              whileHover={payLoading ? {} : { scale: 1.02, y: -1 }}
                              whileTap={payLoading ? {} : { scale: 0.97 }}
                              className="w-full max-w-[320px] h-11 flex items-center justify-center relative overflow-hidden bg-[#8b1a2a] text-white text-xs font-extrabold uppercase tracking-widest gap-2 shadow-md shadow-[#8b1a2a]/25 rounded-xl hover:bg-[#6b1420] disabled:opacity-60 transition-all"
                            >
                              {payLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  {language === 'ar' ? 'جاري المعالجة…' : 'Processing…'}
                                </>
                              ) : paymentMethod === 'COD' ? (
                                <>{language === 'ar' ? 'تأكيد الطلب · الدفع عند الاستلام' : 'Place Order · COD'}</>
                              ) : (
                                <>{language === 'ar' ? `دفع ${formatINR(grandTotal)}` : `Pay ${formatINR(grandTotal)}`}</>
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Back */}
                        <div className="px-6 sm:px-8 py-4 border-t border-brand-border/20 text-left rtl:text-right">
                          <button
                            type="button"
                            onClick={() => setStep('shipping')}
                            className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-extrabold text-brand-text-muted hover:text-brand-charcoal transition-colors"
                          >
                            <ArrowLeft size={13} className="rtl:rotate-180" />
                            {language === 'ar' ? 'تعديل الشحن' : 'Edit Shipping'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* RIGHT — summary */}
              <div className="lg:col-span-5">
                <OrderSummary />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
