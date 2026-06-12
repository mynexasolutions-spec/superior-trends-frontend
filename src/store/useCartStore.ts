import { create } from 'zustand';
import { api } from '../lib/api';
import type { Product } from '../data/products';
import { mapDbProduct, type DbProductRaw } from '../hooks/useProducts';
import { useAuthStore } from './useAuthStore';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export type AddToCartMode = 'add' | 'set';

interface CartState {
  cart: CartItem[];
  sessionId: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  initializeSession: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (
    product: Product,
    quantity: number,
    size: string,
    color: { name: string; hex: string },
    options?: { mode?: AddToCartMode },
  ) => Promise<void>;
  removeFromCart: (productId: string, size: string, colorName: string, cartItemId?: string) => Promise<void>;
  updateCartQuantity: (productId: string, size: string, colorName: string, quantity: number, cartItemId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncLocalCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartCount: () => number;
}

type ApiCartItem = {
  id: string;
  quantity: number;
  product: DbProductRaw;
  variant?: { attributesJson?: { size?: string; color?: string; colorHex?: string } };
};

type ApiCart = {
  items?: ApiCartItem[];
};

const getOrGenerateSessionId = () => {
  let id = localStorage.getItem('aura_session_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('aura_session_id', id);
  }
  return id;
};

const mapApiCartItems = (items: ApiCartItem[]): CartItem[] =>
  items.map((item) => {
    const mappedProduct = mapDbProduct(item.product);
    let size = 'M';
    let color = { name: 'Default', hex: '#000000' };
    if (item.variant?.attributesJson) {
      const attrs = item.variant.attributesJson;
      if (attrs.size) size = attrs.size;
      if (attrs.color) color = { name: attrs.color, hex: attrs.colorHex || '#000000' };
    }
    return {
      id: item.id,
      product: mappedProduct,
      quantity: item.quantity,
      selectedSize: size,
      selectedColor: color,
    };
  });

const applyCartItems = (items: CartItem[]) => {
  localStorage.setItem('aura_cart', JSON.stringify(items));
  return items;
};

const findLineIndex = (
  cart: CartItem[],
  productId: string,
  size: string,
  colorName: string,
) =>
  cart.findIndex(
    (item) =>
      item.product.id === productId &&
      item.selectedSize === size &&
      item.selectedColor.name === colorName,
  );

export const useCartStore = create<CartState>((set, get) => ({
  cart: (() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  sessionId: '',
  isCartOpen: false,

  setIsCartOpen: (open) => set({ isCartOpen: open }),

  initializeSession: () => {
    const sId = getOrGenerateSessionId();
    set({ sessionId: sId });
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  fetchCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const sId = get().sessionId || getOrGenerateSessionId();

    if (!isAuthenticated) return;

    try {
      const { data } = await api.get(`/cart?sessionId=${sId}`);
      const apiCart = data.data?.cart as ApiCart | undefined;
      if (apiCart?.items) {
        const mappedItems = mapApiCartItems(apiCart.items);
        set({ cart: mappedItems });
        applyCartItems(mappedItems);
      } else {
        set({ cart: [] });
        localStorage.removeItem('aura_cart');
      }
    } catch (err) {
      console.error('Error fetching cart from API:', err);
    }
  },

  addToCart: async (product, quantity, size, color, options) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const sId = get().sessionId || getOrGenerateSessionId();
    const mode = options?.mode ?? 'add';
    const qty = Math.max(1, Number(quantity) || 1);

    if (isAuthenticated) {
      try {
        const { data } = await api.post('/cart/add', {
          sessionId: sId,
          productId: product.id,
          quantity: qty,
          mode,
        });
        const apiCart = data.data?.cart as ApiCart | undefined;
        if (apiCart?.items) {
          const mappedItems = mapApiCartItems(apiCart.items);
          set({ cart: mappedItems, isCartOpen: true });
          applyCartItems(mappedItems);
        }
      } catch (err) {
        console.error('Failed to add to database cart:', err);
      }
      return;
    }

    const currentCart = [...get().cart];
    const existingIndex = findLineIndex(currentCart, product.id, size, color.name);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity =
        mode === 'set' ? qty : currentCart[existingIndex].quantity + qty;
    } else {
      currentCart.push({ product, quantity: qty, selectedSize: size, selectedColor: color });
    }

    set({ cart: currentCart, isCartOpen: true });
    applyCartItems(currentCart);
  },

  removeFromCart: async (productId, size, colorName, cartItemId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      try {
        const idToDelete =
          cartItemId ||
          get().cart.find(
            (item) =>
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor.name === colorName,
          )?.id;

        if (idToDelete) {
          const { data } = await api.post('/cart/remove', { cartItemId: idToDelete });
          const apiCart = data.data?.cart as ApiCart | undefined;
          if (apiCart?.items) {
            const mappedItems = mapApiCartItems(apiCart.items);
            set({ cart: mappedItems });
            applyCartItems(mappedItems);
          } else {
            set({ cart: [] });
            localStorage.removeItem('aura_cart');
          }
        }
      } catch (err) {
        console.error('Failed to remove from database cart:', err);
      }
      return;
    }

    const updatedCart = get().cart.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor.name === colorName
        ),
    );
    set({ cart: updatedCart });
    applyCartItems(updatedCart);
  },

  updateCartQuantity: async (productId, size, colorName, quantity, cartItemId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (quantity <= 0) {
      await get().removeFromCart(productId, size, colorName, cartItemId);
      return;
    }

    if (isAuthenticated) {
      try {
        const idToUpdate =
          cartItemId ||
          get().cart.find(
            (item) =>
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedColor.name === colorName,
          )?.id;

        if (idToUpdate) {
          const { data } = await api.put('/cart/update', { cartItemId: idToUpdate, quantity });
          const apiCart = data.data?.cart as ApiCart | undefined;
          if (apiCart?.items) {
            const mappedItems = mapApiCartItems(apiCart.items);
            set({ cart: mappedItems });
            applyCartItems(mappedItems);
          }
        }
      } catch (err) {
        console.error('Failed to update database cart quantity:', err);
      }
      return;
    }

    const updatedCart = get().cart.map((item) =>
      item.product.id === productId &&
      item.selectedSize === size &&
      item.selectedColor.name === colorName
        ? { ...item, quantity }
        : item,
    );
    set({ cart: updatedCart });
    applyCartItems(updatedCart);
  },

  clearCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    set({ cart: [] });
    localStorage.removeItem('aura_cart');

    if (isAuthenticated) {
      try {
        await api.post('/cart/clear');
      } catch (err) {
        console.error('Failed to clear database cart:', err);
      }
    }
  },

  syncLocalCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return;

    await get().fetchCart();
  },
}));
