import type { QueryClient } from '@tanstack/react-query';
import { getProducts, getSections, getCategories } from './api';
import { mapDbProduct } from '../hooks/useProducts';
import { STOREFRONT_PRODUCT_LIMIT, catalogQueryOptions } from './queryConfig';

/** Warm cache on first storefront visit — faster home + shop */
export function prefetchStorefrontCatalog(queryClient: QueryClient) {
  queryClient.prefetchQuery({
    queryKey: ['products', { limit: STOREFRONT_PRODUCT_LIMIT }],
    queryFn: async () => {
      const dbProducts = await getProducts({ limit: STOREFRONT_PRODUCT_LIMIT });
      return dbProducts.map(mapDbProduct);
    },
    ...catalogQueryOptions,
  });

  queryClient.prefetchQuery({
    queryKey: ['sections'],
    queryFn: getSections,
    ...catalogQueryOptions,
  });

  queryClient.prefetchQuery({
    queryKey: ['categories', undefined],
    queryFn: () => getCategories(),
    ...catalogQueryOptions,
  });
}
