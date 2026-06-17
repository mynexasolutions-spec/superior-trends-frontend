import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanners, getBannersAdmin, createBanner, updateBanner, deleteBanner } from '../lib/api';

export const BANNERS_KEY = ['banners'] as const;
export const BANNERS_ADMIN_KEY = ['banners', 'admin'] as const;

export function useBanners() {
  return useQuery({
    queryKey: BANNERS_KEY,
    queryFn: getBanners,
    staleTime: 5 * 60_000,
  });
}

export function useBannersAdmin() {
  return useQuery({
    queryKey: BANNERS_ADMIN_KEY,
    queryFn: getBannersAdmin,
    staleTime: 5 * 60_000,
  });
}

export function useCreateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY });
      qc.invalidateQueries({ queryKey: BANNERS_ADMIN_KEY });
    },
  });
}

export function useUpdateBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateBanner(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY });
      qc.invalidateQueries({ queryKey: BANNERS_ADMIN_KEY });
    },
  });
}

export function useDeleteBannerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY });
      qc.invalidateQueries({ queryKey: BANNERS_ADMIN_KEY });
    },
  });
}
