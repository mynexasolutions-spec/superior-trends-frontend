import { create } from 'zustand';
import { api } from '../lib/api';
import { useAuthStore } from './useAuthStore';

interface WishlistState {
  wishlist: string[];
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: (() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),

  isInWishlist: (productId) => {
    return get().wishlist.includes(productId);
  },

  fetchWishlist: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return;

    try {
      const { data } = await api.get('/wishlist');
      const apiWishlist = data.data?.wishlist || [];
      const productIds = apiWishlist.map((item: any) => item.productId || item.product?.id);
      set({ wishlist: productIds });
      localStorage.setItem('aura_wishlist', JSON.stringify(productIds));
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  },

  toggleWishlist: async (productId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const current = [...get().wishlist];
    const exists = current.includes(productId);

    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== productId);
    } else {
      updated = [...current, productId];
    }

    set({ wishlist: updated });
    localStorage.setItem('aura_wishlist', JSON.stringify(updated));

    if (isAuthenticated) {
      try {
        if (exists) {
          await api.delete(`/wishlist/${productId}`);
        } else {
          await api.post('/wishlist', { productId });
        }
        await get().fetchWishlist();
      } catch (err) {
        console.error('Error toggling wishlist on backend:', err);
      }
    }
  },
}));
