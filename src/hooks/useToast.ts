import { useContext } from 'react';
import { ToastContext } from '../components/ui/Toast';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (msg: string) => console.warn('[toast]', msg),
    };
  }
  return ctx;
}
