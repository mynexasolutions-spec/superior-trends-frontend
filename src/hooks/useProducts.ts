import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getSections, getAllSections, getCollections, getProductById, getProductBySlug } from '../lib/api';
import { useAdminAuth } from './useAdminAuth';
import { catalogQueryOptions, STOREFRONT_PRODUCT_LIMIT } from '../lib/queryConfig';
import type { Product } from '../data/products';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseColors(raw: DbProductRaw['colors']): Product['colors'] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ name: 'Default', hex: '#000000' }];
  }
  return raw as Product['colors'];
}

export const mapDbProduct = (dbProduct: DbProductRaw): Product => {
  const images = dbProduct.images ?? [];
  const imgList = images
    .map((img) => {
      if (typeof img === 'string') return img.trim();
      return img?.imageUrl?.trim() ?? '';
    })
    .filter((url): url is string => Boolean(url));

  // Compute real avg rating from approved reviews
  const approvedReviews = dbProduct.reviews ?? [];
  const reviewCount = approvedReviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round((approvedReviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    price: Number(dbProduct.salePrice || dbProduct.mrp),
    category: (dbProduct.category?.slug || 'women') as Product['category'],
    images: imgList,
    sizes: dbProduct.sizes && dbProduct.sizes.length > 0 ? dbProduct.sizes : ['S', 'M', 'L'],
    colors: parseColors(dbProduct.colors),
    description: dbProduct.shortDescription || dbProduct.name,
    details: dbProduct.longDescription ? [dbProduct.longDescription] : [''],
    rating: avgRating,
    reviews: reviewCount,
    isNew: dbProduct.featured || false,
    isBestSeller: dbProduct.trending || false,
    sku: dbProduct.sku,
    mrp: Number(dbProduct.mrp),
    salePrice: Number(dbProduct.salePrice),
    categoryId: dbProduct.categoryId || dbProduct.category?.id || '',
    collectionId: dbProduct.collectionId || dbProduct.collection?.id || '',
    brand: dbProduct.brand,
    weight: dbProduct.weight != null ? Number(dbProduct.weight) : undefined,
    status: dbProduct.status,
    seoTitle: dbProduct.seoTitle || '',
    seoDescription: dbProduct.seoDescription || '',
    stock: dbProduct.stock,
    shortDescription: dbProduct.shortDescription,
    longDescription: dbProduct.longDescription,
  } as Product;
};

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: string | null;
  children?: DBCategory[];
}

export interface DBCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  status?: boolean;
}

/** Raw product shape from API before mapDbProduct */
export type DbProductRaw = {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  salePrice?: number | string;
  mrp?: number | string;
  shortDescription?: string | null;
  longDescription?: string | null;
  images?: Array<string | { imageUrl: string; sortOrder?: number; isMain?: boolean }>;
  category?: { slug?: string; id?: string; name?: string };
  categoryId?: string;
  collection?: { id?: string; slug?: string };
  collectionId?: string;
  brand?: string;
  weight?: number | string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sizes?: string[];
  colors?: Product['colors'] | unknown;
  featured?: boolean;
  trending?: boolean;
  status?: boolean;
  stock?: number;
  /** Approved reviews returned by storefrontProductSelect */
  reviews?: Array<{ rating: number }>;
};

export interface HomepageSection {
  id: string;
  title: string;
  slug: string;
  type?: string;
  sortOrder?: number;
  isActive?: boolean;
  linkUrl?: string | null;
  subtitle?: string | null;
  description?: string | null;
  subtitleRight?: string | null;
  titleRight?: string | null;
  descriptionRight?: string | null;
  buttonText?: string | null;
  buttonTextRight?: string | null;
  linkUrlRight?: string | null;
  bannerImage?: string | null;
  bannerImageRight?: string | null;
  backgroundColor?: string | null;
  backgroundColorRight?: string | null;
  products?: DbProductRaw[];
  orderedProductIds?: string[];
}

export const useProducts = (params?: {
  category?: string;
  search?: string;
  section?: string;
  limit?: number;
  admin?: boolean;
}) => {
  const isAdmin = params?.admin === true;
  const queryParams = isAdmin
    ? { ...params, admin: 'true', limit: params?.limit ?? 500 }
    : {
        ...params,
        limit: params?.limit ?? STOREFRONT_PRODUCT_LIMIT,
      };

  return useQuery<Product[]>({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const dbProducts = await getProducts(queryParams);
      return dbProducts.map(mapDbProduct);
    },
    ...catalogQueryOptions,
  });
};

export const useCategories = (params?: { flat?: boolean }) => {
  return useQuery<DBCategory[]>({
    queryKey: ['categories', params],
    queryFn: async () => {
      return await getCategories(params);
    },
    ...catalogQueryOptions,
  });
};

export const useSections = () => {
  return useQuery<HomepageSection[]>({
    queryKey: ['sections'],
    queryFn: async () => {
      return await getSections();
    },
    ...catalogQueryOptions,
  });
};

export const useAdminSections = () => {
  const { isAdmin, authReady } = useAdminAuth();
  return useQuery<HomepageSection[]>({
    queryKey: ['sections', 'admin'],
    queryFn: async () => {
      return await getAllSections();
    },
    enabled: authReady && isAdmin,
  });
};

export const useCollections = () => {
  return useQuery<DBCollection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      return await getCollections();
    },
    ...catalogQueryOptions,
  });
};

export const useProduct = (idOrSlug?: string) => {
  return useQuery<Product>({
    queryKey: ['product', idOrSlug],
    enabled: !!idOrSlug,
    queryFn: async () => {
      const dbProduct = UUID_RE.test(idOrSlug!)
        ? await getProductById(idOrSlug!)
        : await getProductBySlug(idOrSlug!);
      return mapDbProduct(dbProduct);
    },
    ...catalogQueryOptions,
  });
};

