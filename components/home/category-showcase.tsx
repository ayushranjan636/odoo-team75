"use client"

import { ProductCard } from "@/components/product-card"
import { mockCategoryShowcaseProducts } from "@/lib/mock-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const categorySlugMap: { [key: string]: string } = {
  Furniture: "furniture",
  Electronics: "electronics",
  Appliances: "appliances",
  Fitness: "fitness",
  "Baby & Kids": "baby-kids",
  Packages: "packages",
}

export function CategoryShowcase() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container px-4 md:px-6">
        {mockCategoryShowcaseProducts.map((categorySection, index) => (
          <div key={index} className="mb-12 last:mb-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-sans">{categorySection.category}</h2>
              <Link
                href={`/browse?category=${categorySlugMap[categorySection.category] || categorySection.category.toLowerCase().replace(/\s/g, "-")}`}
                prefetch={false}
              >
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorySection.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.image,
                    pricePerTenure: Number.parseFloat(product.price),
                    tenure: product.tenure,
                    qtyOnHand: 10,
                    availabilityStatus: "green",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
