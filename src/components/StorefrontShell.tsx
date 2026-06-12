import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { prefetchStorefrontCatalog } from '../lib/prefetchCatalog';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

/** Storefront chrome only — hidden on /admin routes */
export const StorefrontShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const isAdmin = pathname.startsWith('/admin');

  const initializeSession = useCartStore((s) => s.initializeSession);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (!isAdmin && isAuthenticated) {
      fetchCart();
    }
  }, [isAdmin, isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!isAdmin) {
      prefetchStorefrontCatalog(queryClient);
    }
  }, [isAdmin, queryClient]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="pt-[92px] sm:pt-[116px] pb-[76px] md:pb-0">
        {children}
      </div>
      <Footer />
    </>
  );
};

