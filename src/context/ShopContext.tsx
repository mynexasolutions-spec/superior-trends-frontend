import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../data/products';
import { useCartStore, type AddToCartMode } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (
    product: Product,
    quantity: number,
    size: string,
    color: { name: string; hex: string },
    options?: { mode?: AddToCartMode },
  ) => void;
  removeFromCart: (productId: string, size: string, colorName: string) => void;
  updateCartQuantity: (productId: string, size: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  promoCode: string;
  discount: number;
  applyPromo: (code: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    getCartTotal,
    getCartCount,
  } = useCartStore();

  const {
    wishlist,
    toggleWishlist,
    isInWishlist,
  } = useWishlistStore();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyPromo = (code: string) => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === 'AURA10') {
      setPromoCode('AURA10');
      setDiscount(0.1); // 10% off
      return true;
    } else if (uppercaseCode === 'WELCOME20') {
      setPromoCode('WELCOME20');
      setDiscount(0.2); // 20% off
      return true;
    }
    return false;
  };

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        promoCode,
        discount,
        applyPromo,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
