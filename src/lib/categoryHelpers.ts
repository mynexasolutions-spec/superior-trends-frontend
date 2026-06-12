import type { DBCategory } from '../hooks/useProducts';
import { createCategory, getCategories } from './api';

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-');
}

/** Top-level categories (no parent) — e.g. Men, Women you created */
export function getRootCategories(categories: DBCategory[] | undefined): DBCategory[] {
  if (!categories) return [];
  return categories.filter((c) => !c.parentId);
}

/**
 * Find or create subcategory under parent from manual name (e.g. Women + "Jeans").
 */
export async function resolveSubCategoryId(
  parentCategoryId: string,
  subCategoryName: string,
  flatCategories: DBCategory[]
): Promise<string> {
  const trimmed = subCategoryName.trim();
  if (!parentCategoryId) {
    throw new Error('Please select a main category (e.g. Men, Women).');
  }
  if (!trimmed) {
    throw new Error('Please enter a subcategory name (e.g. Jeans, Tops, Dresses).');
  }

  const parent = flatCategories.find((c) => c.id === parentCategoryId);
  if (!parent) {
    throw new Error('Invalid parent category.');
  }

  const slug = `${parent.slug}-${slugifyCategory(trimmed)}`;

  const existing = flatCategories.find(
    (c) =>
      c.parentId === parentCategoryId &&
      (c.name.toLowerCase() === trimmed.toLowerCase() || c.slug === slug)
  );
  if (existing) return existing.id;

  try {
    const created = await createCategory({
      name: trimmed,
      slug,
      parentId: parentCategoryId,
      status: true,
    });
    return created.id;
  } catch {
    const fresh = await getCategories({ flat: true });
    const again = fresh.find(
      (c: DBCategory) =>
        c.parentId === parentCategoryId &&
        (c.name.toLowerCase() === trimmed.toLowerCase() || c.slug === slug)
    );
    if (again) return again.id;
    throw new Error(`Could not create subcategory "${trimmed}". Try a different name.`);
  }
}

/** Split stored categoryId into parent dropdown + manual subcategory label for edit form */
export function splitCategoryForForm(
  categoryId: string | undefined,
  flatCategories: DBCategory[] | undefined
): { parentCategoryId: string; subCategoryName: string } {
  if (!categoryId || !flatCategories) {
    return { parentCategoryId: '', subCategoryName: '' };
  }
  const cat = flatCategories.find((c) => c.id === categoryId);
  if (!cat) return { parentCategoryId: '', subCategoryName: '' };
  if (cat.parentId) {
    return { parentCategoryId: cat.parentId, subCategoryName: cat.name };
  }
  return { parentCategoryId: cat.id, subCategoryName: '' };
}

/** Full path label e.g. "Women → Kurtas" */
export function getCategoryPath(
  categoryId: string | undefined,
  flatCategories: DBCategory[] | undefined
): string {
  if (!categoryId || !flatCategories) return '—';
  const cat = flatCategories.find((c) => c.id === categoryId);
  if (!cat) return '—';
  if (!cat.parentId) return cat.name;
  const parent = flatCategories.find((c) => c.id === cat.parentId);
  return parent ? `${parent.name} → ${cat.name}` : cat.name;
}

/** Nested tree from API (useCategories without flat) */
export function getCategoryTree(categories: DBCategory[] | undefined): DBCategory[] {
  if (!categories) return [];
  const hasChildren = categories.some((c) => c.children && c.children.length > 0);
  if (hasChildren) return categories.filter((c) => !c.parentId);
  return getRootCategories(categories);
}
