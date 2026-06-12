import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../lib/api';
import { useAdminAuth } from './useAdminAuth';

export const BLOGS_KEY = ['blogs', 'published'] as const;
export const BLOG_ADMIN_KEY = ['blogs', 'admin'] as const;

export function usePublishedBlogs() {
  return useQuery({
    queryKey: BLOGS_KEY,
    queryFn: getPublishedBlogs,
    staleTime: 60_000,
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blogs', 'slug', slug],
    queryFn: () => getBlogBySlug(slug!),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useAdminBlogs() {
  const { isAdmin, authReady } = useAdminAuth();
  return useQuery({
    queryKey: BLOG_ADMIN_KEY,
    queryFn: getAllBlogsAdmin,
    enabled: authReady && isAdmin,
  });
}

export function useBlogMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: BLOG_ADMIN_KEY });
    qc.invalidateQueries({ queryKey: BLOGS_KEY });
  };

  const create = useMutation({
    mutationFn: createBlogPost,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateBlogPost(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
