import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
  applyCoupon,
  getActiveCoupons,
} from '../lib/api';
import type { Coupon } from '../lib/api';
import { useAdminAuth } from './useAdminAuth';

export const COUPONS_ADMIN_KEY = ['coupons', 'admin'] as const;

export function useCouponsAdmin() {
  const { isAdmin, authReady } = useAdminAuth();
  return useQuery({
    queryKey: COUPONS_ADMIN_KEY,
    queryFn: getCouponsAdmin,
    enabled: authReady && isAdmin,
  });
}

export function useCouponMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: COUPONS_ADMIN_KEY });
  };

  const create = useMutation({
    mutationFn: (payload: Partial<Coupon>) => createCouponAdmin(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Coupon> }) =>
      updateCouponAdmin(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCouponAdmin(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export function useApplyCouponMutation() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      applyCoupon(code, subtotal),
  });
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: getActiveCoupons,
    staleTime: 60_000,
  });
}
