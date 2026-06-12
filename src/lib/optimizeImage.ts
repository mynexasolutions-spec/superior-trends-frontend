/** Turn relative upload paths into absolute URLs */
export function resolveImageUrl(src: string | undefined): string | undefined {
  if (!src || !src.trim()) return undefined;
  const trimmed = src.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
  const origin = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

import { getFirstProductImageUrl, type ProductImageLike } from './productImage';

/** First product image from API or mapped product — no fallback */
export function getProductImageUrl(
  images: ProductImageLike[] | string[] | undefined,
  width = 480,
): string | undefined {
  const raw = getFirstProductImageUrl(images as ProductImageLike[] | undefined);
  if (!raw) return undefined;
  return optimizeImageUrl(resolveImageUrl(raw) ?? raw, width);
}

/** Smaller image URLs for list cards — faster first paint */
export function optimizeImageUrl(src: string | undefined, width = 480): string | undefined {
  if (!src) return undefined;
  const absolute = resolveImageUrl(src) ?? src;
  try {
    const url = new URL(absolute);
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '80');
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }
    if (url.hostname.includes('cloudinary.com') && url.pathname.includes('/upload/')) {
      if (/\/upload\/[^/]*w_\d+/.test(url.pathname)) {
        return absolute;
      }
      return absolute.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }
    return absolute;
  } catch {
    return absolute;
  }
}
