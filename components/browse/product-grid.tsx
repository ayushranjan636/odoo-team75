import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/mock-data"

interface ProductGridProps {
  products: Product[]
  onQuickView?: (slug: string) => void // Added onQuickView prop
}

export function ProductGrid({ products, onQuickView }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-semibold mb-4">No products found matching your filters.</p>
        <p>Try adjusting your search or clearing some filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            pricePerTenure: product.pricePerTenure as number,
            tenure: product.tenure as string,
            qtyOnHand: product.qtyOnHand,
            availabilityStatus: product.availabilityStatus as any,
          }}
          onQuickView={onQuickView} // Pass onQuickView prop
        />
      ))}
    </div>
  )
}
