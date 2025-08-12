/**
 * Slugify utility for generating stable product slugs
 * Rules: lowercase, replace spaces/"/"/"&" with -, collapse --, trim -
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s/&]+/g, "-") // Replace spaces, slashes, ampersands with hyphens
    .replace(/[^\w-]+/g, "") // Remove all non-word chars except hyphens
    .replace(/--+/g, "-") // Collapse multiple hyphens
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, "") // Trim hyphens from end
}

/**
 * Generate a stable product slug using name + internal reference
 */
export function generateProductSlug(name: string, internalRef: string): string {
  return slugify(`${name}-${internalRef}`)
}

/**
 * Backfill slugs for existing products that might have empty slugs
 */
export function backfillProductSlugs<T extends { slug?: string; name: string; internalRef: string }>(
  products: T[],
): T[] {
  return products.map((product) => ({
    ...product,
    slug: product.slug || generateProductSlug(product.name, product.internalRef),
  }))
}
