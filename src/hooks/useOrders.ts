import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrderCustomer,
} from '../lib/api';
import { useAdminAuth } from './useAdminAuth';

export const MY_ORDERS_KEY = ['orders', 'my'] as const;
export const ADMIN_ORDERS_KEY = ['orders', 'admin'] as const;

/** User orders — live updates via WebSocket (useOrderSocket in App) */
export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: MY_ORDERS_KEY,
    queryFn: getMyOrders,
    enabled,
    staleTime: 60_000,
  });
}

export function useOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAdminOrders() {
  const { isAdmin, authReady } = useAdminAuth();
  return useQuery({
    queryKey: ADMIN_ORDERS_KEY,
    queryFn: getAllOrdersAdmin,
    staleTime: 15_000,
    enabled: authReady && isAdmin,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) =>
      updateOrderStatusAdmin(id, { orderStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: MY_ORDERS_KEY });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelOrderCustomer(id),
    onSuccess: (updatedOrder) => {
      qc.invalidateQueries({ queryKey: MY_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['orders', updatedOrder.id] });
      qc.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
    },
  });
}

