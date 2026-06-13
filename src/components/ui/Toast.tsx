import React, { createContext, useCallback, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TRANSLATIONS: Record<string, { ar: string }> = {
  'Added to your basket ✦': { ar: 'تمت إضافة المنتج إلى السلة بنجاح ✦' },
  'Please sign in to write a review.': { ar: 'يرجى تسجيل الدخول لتتمكن من كتابة تقييم.' },
  'Please select a rating.': { ar: 'يرجى تحديد تقييم بالنجوم.' },
  'Please write a review comment.': { ar: 'يرجى كتابة تعليق على التقييم.' },
  'Review submitted successfully for moderation ✦': { ar: 'تم إرسال التقييم بنجاح للمراجعة والاعتماد ✦' },
  'Failed to submit review.': { ar: 'فشل إرسال التقييم.' },
  'Order cancelled successfully': { ar: 'تم إلغاء الطلب بنجاح.' },
  'Failed to cancel order': { ar: 'فشل إلغاء الطلب.' },
  'Message sent successfully!': { ar: 'تم إرسال رسالتك بنجاح!' },
  'Coupon applied! 🎉': { ar: 'تم تطبيق الكوبون بنجاح! 🎉' },
  'Please complete shipping details': { ar: 'يرجى إكمال وتعبئة تفاصيل الشحن.' },
  'Order placed! Pay cash on delivery.': { ar: 'تم تقديم طلبك بنجاح! الدفع نقداً عند الاستلام.' },
  'Could not load payment gateway. Check your connection.': { ar: 'تعذر تحميل بوابة الدفع الإلكتروني. يرجى التحقق من الاتصال بالإنترنت.' },
  'Payment successful! Thank you ✦': { ar: 'تمت عملية الدفع بنجاح! شكراً لك ✦' },
  'Payment received but verification failed. Contact support with your payment ID.': { ar: 'تم استلام المبلغ ولكن فشل تأكيد العملية. يرجى التواصل مع الدعم الفني وتزويدهم برقم العملية.' },
  'Payment cancelled': { ar: 'تم إلغاء عملية الدفع.' },
  'Image(s) uploaded successfully ✦': { ar: 'تم رفع الصور بنجاح ✦' },
  'Failed to upload image.': { ar: 'فشل رفع الصور.' }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { language, isRtl } = useLanguage();

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Intercept and auto-translate message if active language is Arabic
    let translatedMessage = message;
    if (language === 'ar') {
      const match = TOAST_TRANSLATIONS[message];
      if (match) {
        translatedMessage = match.ar;
      }
    }

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message: translatedMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, [language]);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className={`fixed top-20 z-[200] flex flex-col gap-2.5 max-w-sm w-[min(100%,20rem)] pointer-events-none font-display ${
          isRtl ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: isRtl ? -24 : 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRtl ? -24 : 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3.5 rounded-xl shadow-lg border text-sm backdrop-blur-sm ${
                t.type === 'success'
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                  : t.type === 'error'
                    ? 'bg-red-50/95 border-red-200 text-red-900'
                    : 'bg-white/95 border-brand-border/40 text-brand-charcoal'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle
                  size={18}
                  className={`shrink-0 mt-0.5 ${t.type === 'error' ? 'text-red-600' : 'text-[#8b1a2a]'}`}
                />
              )}
              <span className="flex-1 font-medium leading-snug text-left rtl:text-right">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
