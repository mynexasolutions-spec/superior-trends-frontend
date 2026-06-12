/** Product image from API (object) or mapped storefront (string URL). */
export type ProductImageLike = string | { imageUrl?: string | null };

export function getFirstProductImageUrl(
  images?: ProductImageLike[] | null,
): string {
  if (!images?.length) return '';
  const first = images[0];
  if (typeof first === 'string') return first.trim();
  return (first?.imageUrl ?? '').trim();
}

export function buildProductImagesPayload(imageUrl: string) {
  const url = imageUrl.trim();
  if (!url) return undefined;
  return [{ imageUrl: url, isMain: true, sortOrder: 0 }];
}
