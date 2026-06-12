import { useAuthStore } from '../store/useAuthStore';

/** True when session is restored and user is an admin (safe to call protected admin APIs). */
export function useAdminAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const authReady = !isLoading;
  const isAdmin = authReady && isAuthenticated && user?.role === 'ADMIN';

  return { user, isLoading, authReady, isAdmin, isAuthenticated };
}
