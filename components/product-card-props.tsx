// Type definitions for ProductCard component

export interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    image?: string
    pricePerTenure?: number
    tenure?: string
    qtyOnHand: number
  }
  onQuickView: (slug: string) => void
}
