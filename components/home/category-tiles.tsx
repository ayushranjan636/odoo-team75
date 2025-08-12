import Link from "next/link"
import Image from "next/image"
import { mockCategories } from "@/lib/mock-data"

export function CategoryTiles() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center font-inter">
          Explore Our Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {mockCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/browse?category=${category.slug}`}
              className="group block rounded-xl border border-[#E2E8F0] bg-surface shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-brand/50"
              prefetch={false}
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-brand font-inter">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">From ₹{category.priceFrom}/day</p>
                <p className="text-xs text-muted-foreground">{category.itemsAvailable} items available</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
