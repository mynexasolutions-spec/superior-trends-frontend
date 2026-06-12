export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  price: number;
  mrp?: number;
  stock?: number;
  status?: boolean;
  category: 'men' | 'women' | 'accessories';
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  description: string;
  details: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
}
