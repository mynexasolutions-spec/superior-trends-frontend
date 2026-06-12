import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from '../lib/api';

export const BLOG_CATEGORIES_KEY = ['blogCategories'] as const;

export function useBlogCategories() {
  return useQuery({
    queryKey: BLOG_CATEGORIES_KEY,
    queryFn: getBlogCategories,
    staleTime: 60_000,
  });
}

export function useBlogCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY });
  };

  const create = useMutation({
    mutationFn: createBlogCategory,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; slug?: string } }) =>
      updateBlogCategory(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteBlogCategory,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
