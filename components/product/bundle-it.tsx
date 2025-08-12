import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface BundleItProps {
  products: Product[] // These are already pre-formatted by the API
}

export function BundleIt({ products }: BundleItProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-sans">Bundle It! Related Items</h2>
          <Link href="/browse" prefetch={false}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide lg:scrollbar-default">
          <div className="flex gap-6">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-72">
                <ProductCard
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.images[0], // Fixed to use images array
                    pricePerTenure: product.salesPrice * 0.06, // Calculate daily price from salesPrice
                    tenure: "day", // Set default tenure for related products
                    qtyOnHand: product.qtyOnHand,
                    salesPrice: product.salesPrice, // Added salesPrice for price calculations
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
