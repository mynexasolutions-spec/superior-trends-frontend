import React, { createContext, useCallback, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-3 sm:right-6 z-[200] flex flex-col gap-2.5 max-w-sm w-[min(100%,20rem)] pointer-events-none font-display">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
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
              <span className="flex-1 font-medium leading-snug">{t.message}</span>
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
