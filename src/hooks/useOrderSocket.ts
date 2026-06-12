import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectOrderSocket, disconnectOrderSocket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';
import type { OrderRow } from '../lib/orderTypes';
import { ADMIN_ORDERS_KEY, MY_ORDERS_KEY } from './useOrders';

export function useOrderSocket() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !userId) {
      disconnectOrderSocket();
      return;
    }

    const socket = connectOrderSocket();
    if (!socket) return;

    const onOrderUpdated = (payload: { order: OrderRow }) => {
      const order = payload.order;
      if (!order?.id) return;

      queryClient.setQueryData<OrderRow[]>(MY_ORDERS_KEY, (prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((o) => o.id === order.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...order };
        return next;
      });

      queryClient.setQueryData<OrderRow[]>(ADMIN_ORDERS_KEY, (prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((o) => o.id === order.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...order };
        return next;
      });

      queryClient.setQueryData(['orders', order.id], order);

      // Invalidate admin stats on order updates to refresh dashboard counts and revenue
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    const onStockUpdated = (
      updates: {
        productId: string;
        stock: number;
        variantId?: string | null;
        variantStock?: number | null;
      }[]
    ) => {
      updates.forEach((update) => {
        // Update product cache list ['products']
        queryClient.setQueriesData<any>({ queryKey: ['products'] }, (prev: any) => {
          if (!prev) return prev;
          if (Array.isArray(prev)) {
            return prev.map((p) => {
              if (p.id === update.productId) {
                return { ...p, stock: update.stock };
              }
              return p;
            });
          }
          return prev;
        });

        // Update single product query cache by ID ['product', id]
        queryClient.setQueryData<any>(['product', update.productId], (prev: any) => {
          if (!prev) return prev;
          return { ...prev, stock: update.stock };
        });

        // Update single product query cache by Slug (matching product query keys)
        queryClient.setQueriesData<any>({ queryKey: ['product'] }, (prev: any) => {
          if (!prev) return prev;
          if (prev.id === update.productId) {
            return { ...prev, stock: update.stock };
          }
          return prev;
        });
      });

      // Trigger background queries refetch for products list & updated products to ensure absolute sync
      queryClient.invalidateQueries({ queryKey: ['products'] });
      updates.forEach((update) => {
        queryClient.invalidateQueries({ queryKey: ['product', update.productId] });
      });

      // Invalidate admin stats to update total stock and low stock card values
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };

    socket.on('order:updated', onOrderUpdated);
    socket.on('product:stock_updated', onStockUpdated);

    return () => {
      socket.off('order:updated', onOrderUpdated);
      socket.off('product:stock_updated', onStockUpdated);
    };
  }, [isAuthenticated, isLoading, userId, queryClient]);
}
