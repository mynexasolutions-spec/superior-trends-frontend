import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductReviews,
  createProductReview,
  getAllReviewsAdmin,
  updateReviewStatusAdmin,
  deleteReviewAdmin,
  getMyReviewStatus,
} from '../lib/api';
import type { CreateReviewPayload } from '../lib/api';
import { catalogQueryOptions } from '../lib/queryConfig';
import { useAuthStore } from '../store/useAuthStore';

export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId!),
    enabled: !!productId,
    ...catalogQueryOptions,
  });
};

export const useCreateReview = (productId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createProductReview(payload),
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
        queryClient.invalidateQueries({ queryKey: ['myReviewStatus', productId] });
      }
    },
  });
};

/** Check if the current user has already reviewed a product and whether they are eligible to */
export const useMyReviewStatus = (productId?: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['myReviewStatus', productId],
    queryFn: () => getMyReviewStatus(productId!),
    enabled: !!productId && isAuthenticated,
    staleTime: 30_000,
  });
};

export const useAllReviewsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => getAllReviewsAdmin(),
  });
};

export const useUpdateReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' | 'PENDING' }) =>
      updateReviewStatusAdmin(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReviewAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
