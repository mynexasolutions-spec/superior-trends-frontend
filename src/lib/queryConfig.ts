/** Shared React Query settings for fast repeat visits */
export const CATALOG_STALE_MS = 5 * 60 * 1000;
export const CATALOG_GC_MS = 30 * 60 * 1000;
export const STOREFRONT_PRODUCT_LIMIT = 200;

export const catalogQueryOptions = {
  staleTime: CATALOG_STALE_MS,
  gcTime: CATALOG_GC_MS,
  refetchOnMount: false as const,
};
