import type { Color, Material, Product, ProductVariant, Size } from '~/types/models';

export interface DisplayPrice {
  price: number;
  /** Regular price when a discount applies, else `null`. */
  compareAt: number | null;
  discountPercent: number | null;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Mirrors the API pricing rules (`products/pricing.ts`) for display:
 * a variant with its own price uses only its own discount.
 */
export function displayPrice(
  product: Pick<Product, 'basePrice' | 'baseDiscountPrice'>,
  variant?: Pick<ProductVariant, 'price' | 'discountPrice'> | null,
): DisplayPrice {
  const variantPrice = num(variant?.price);
  const regular = variantPrice ?? num(product.basePrice) ?? 0;
  const variantDiscount = num(variant?.discountPrice);
  const discount = variantPrice !== null ? variantDiscount : (variantDiscount ?? num(product.baseDiscountPrice));
  const valid = discount !== null && discount > 0 && discount < regular ? discount : null;

  return {
    price: valid ?? regular,
    compareAt: valid !== null ? regular : null,
    discountPercent: valid !== null ? Math.round(((regular - valid) / regular) * 100) : null,
  };
}

/** Lowest display price across variants, for "from X" labels on cards. */
export function startingPrice(product: Product): DisplayPrice {
  if (!product.variants?.length) return displayPrice(product);
  return product.variants
    .map((v) => displayPrice(product, v))
    .reduce((best, p) => (p.price < best.price ? p : best));
}

export function availableStock(product: Pick<Product, 'baseStock'>, variant?: Pick<ProductVariant, 'stock'> | null): number {
  return Math.max(0, num(variant?.stock) ?? num(product.baseStock) ?? 0);
}

export function isInStock(product: Product): boolean {
  if (!product.variants?.length) return availableStock(product) > 0;
  return product.variants.some((v) => availableStock(product, v) > 0);
}

export function hasOptions(product: Pick<Product, 'variants'>): boolean {
  return (product.variants?.length ?? 0) > 0;
}

/** Product images: main first, then the gallery, de-duplicated. */
export function productImages(product: Pick<Product, 'mainImage' | 'defaultGallery'>, variant?: ProductVariant | null): string[] {
  const list = [...(variant?.variantImages ?? []), product.mainImage, ...(product.defaultGallery ?? [])];
  return [...new Set(list.filter(Boolean))];
}

export type Attribute = 'color' | 'size' | 'material';
type AttributeValue = Color | Size | Material;
export const VARIANT_ATTRIBUTES: readonly Attribute[] = ['color', 'size', 'material'];

/** Distinct attribute values present on the variants, in first-seen order. */
export function variantAttributeValues<T extends AttributeValue>(variants: ProductVariant[], attribute: Attribute): T[] {
  const seen = new Map<string, T>();
  for (const v of variants) {
    const value = v[attribute] as T | null;
    if (value && !seen.has(value.id)) seen.set(value.id, value);
  }
  return [...seen.values()];
}

export type VariantSelection = Partial<Record<Attribute, string | null>>;

const matches = (variant: ProductVariant, selection: VariantSelection) =>
  (Object.entries(selection) as [Attribute, string | null | undefined][]).every(
    ([attr, id]) => !id || variant[attr]?.id === id,
  );

/** Exact variant for a full selection (unused attributes are `null` on both sides). */
export function findVariant(variants: ProductVariant[], selection: VariantSelection): ProductVariant | null {
  return (
    variants.find((v) => VARIANT_ATTRIBUTES.every((a) => (v[a]?.id ?? null) === (selection[a] ?? null))) ??
    null
  );
}

/** Whether picking `valueId` for `attribute` (keeping other picks) leads to an in-stock variant. */
export function isOptionAvailable(
  product: Product,
  attribute: Attribute,
  valueId: string,
  selection: VariantSelection,
): boolean {
  const next = { ...selection, [attribute]: valueId };
  return product.variants.some((v) => v[attribute]?.id === valueId && matches(v, next) && availableStock(product, v) > 0);
}
