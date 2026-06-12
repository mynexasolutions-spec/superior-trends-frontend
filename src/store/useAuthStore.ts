import { create } from 'zustand';
import { api } from '../lib/api';
import { clearAuthToken, setAuthToken } from '../lib/authToken';
import { connectOrderSocket, disconnectOrderSocket } from '../lib/socket';
import { useCartStore } from './useCartStore';

function pickUserAndToken(data: Record<string, unknown>) {
  const user =
    (data.user as User | undefined) ||
    ((data.data as { user?: User })?.user) ||
    (data.data as User | undefined);
  const token = (data.token as string | undefined) || undefined;
  return { user, token };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<User>;
  signup: (formData: any) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      const { user, token } = pickUserAndToken(data);
      if (token) setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      connectOrderSocket();
      useCartStore.getState().initializeSession();
      await useCartStore.getState().fetchCart();
      return user as User;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  signup: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/signup', formData);
      const { user, token } = pickUserAndToken(data);
      if (token) setAuthToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      connectOrderSocket();
      useCartStore.getState().initializeSession();
      await useCartStore.getState().fetchCart();
      return user as User;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      clearAuthToken();
      disconnectOrderSocket();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/auth/me');
      const { user, token } = pickUserAndToken(data);
      if (token) setAuthToken(token);
      set({ user, isAuthenticated: !!user, isLoading: false });
      if (user) {
        connectOrderSocket();
        useCartStore.getState().initializeSession();
        await useCartStore.getState().fetchCart();
      } else {
        disconnectOrderSocket();
      }
      return (user || null) as User | null;
    } catch {
      clearAuthToken();
      disconnectOrderSocket();
      try {
        await api.post('/auth/logout');
      } catch {
        /* clear stale cookie */
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },
}));
