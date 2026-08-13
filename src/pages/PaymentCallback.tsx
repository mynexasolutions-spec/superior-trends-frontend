import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { verifyThawaniPayment } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { formatINR } from '../lib/formatCurrency';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { clearCart } = useShop();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);

  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!orderId) {
        setLoading(false);
        setSuccess(false);
        setErrorMessage(language === 'ar' ? 'معرف الطلب غير موجود' : 'Order ID is missing');
        return;
      }

      if (status === 'cancel') {
        setLoading(false);
        setSuccess(false);
        setErrorMessage(language === 'ar' ? 'تم إلغاء عملية الدفع من قبل المستخدم.' : 'Payment was cancelled by the user.');
        return;
      }

      try {
        const result = await verifyThawaniPayment(orderId);
        if (result && result.order) {
          await clearCart();
          setVerifiedOrder(result.order);
          setSuccess(true);
          showToast(language === 'ar' ? 'تمت عملية الدفع بنجاح!' : 'Payment completed successfully!', 'success');
        } else {
          setSuccess(false);
          setErrorMessage(language === 'ar' ? 'فشل التحقق من الدفع.' : 'Payment verification failed.');
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Could not verify payment.';
        setSuccess(false);
        setErrorMessage(language === 'ar' ? 'فشل التحقق من الدفع. يرجى الاتصال بالدعم الفني.' : msg);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [status, orderId, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center gap-4 font-display">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={40} />
        <p className="text-sm uppercase tracking-widest text-brand-text-muted font-bold animate-pulse">
          {language === 'ar' ? 'جاري التحقق من عملية الدفع…' : 'Verifying your payment…'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-brand-cream font-display py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-brand-border/30 rounded-3xl shadow-xl overflow-hidden">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Success */}
            <div className="bg-gradient-to-br from-[#8b1a2a] via-[#6b1420] to-[#4a0e18] py-10 text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#d4af37]/15 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4 z-10">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {language === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold mt-1">
                {language === 'ar' ? 'تم الدفع بنجاح عبر ثواني' : 'Paid via Thawani Pay'}
              </p>
            </div>

            {/* Details Success */}
            <div className="p-6 space-y-6 text-left rtl:text-right">
              {verifiedOrder?.orderNumber && (
                <div className="bg-[#d4af37]/8 border border-[#d4af37]/25 rounded-xl px-5 py-4 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mb-1">
                    {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                  </p>
                  <p className="font-mono font-black text-xl text-[#8b1a2a] tracking-wider">
                    {verifiedOrder.orderNumber}
                  </p>
                </div>
              )}

              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-xs font-bold text-brand-text-muted">
                  {language === 'ar' ? 'المبلغ الإجمالي المدفوع' : 'Total Amount Paid'}
                </span>
                <span className="text-lg font-black text-[#8b1a2a]">
                  {formatINR(verifiedOrder?.total)}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/orders"
                  className="w-full bg-[#8b1a2a] text-white py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl text-center shadow-md shadow-[#8b1a2a]/25 hover:bg-[#6b1420] transition-all"
                >
                  {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
                </Link>
                <Link
                  to="/shop"
                  className="w-full border-2 border-brand-border/50 text-brand-charcoal py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl text-center hover:border-[#d4af37] transition-all"
                >
                  {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-8 text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-brand-charcoal uppercase tracking-tight">
                {language === 'ar' ? 'فشل عملية الدفع' : 'Payment Failed'}
              </h2>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                {errorMessage || (language === 'ar' ? 'حدث خطأ أثناء معالجة دفعتك. يرجى المحاولة مرة أخرى.' : 'An error occurred while processing your payment. Please try again.')}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link
                to="/checkout"
                className="w-full bg-[#8b1a2a] text-white py-3.5 text-xs font-extrabold uppercase tracking-widest rounded-xl text-center shadow-md shadow-[#8b1a2a]/25 hover:bg-[#6b1420] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} className="rtl:rotate-180" />
                {language === 'ar' ? 'الرجوع إلى الدفع' : 'Back to Checkout'}
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
