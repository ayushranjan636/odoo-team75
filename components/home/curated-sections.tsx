import Link from "next/link"
import Image from "next/image"
import { mockCuratedProducts } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CuratedSections() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        {mockCuratedProducts.map((section, index) => (
          <div key={index} className="mb-16 last:mb-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground font-inter">{section.section}</h2>
              <Link href="/browse" prefetch={false}>
                <Button variant="ghost" className="text-brand hover:text-brand/80">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide lg:scrollbar-default">
              <div className="flex gap-6">
                {section.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="group flex-shrink-0 w-64 rounded-xl border border-[#E2E8F0] bg-surface shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-brand/50"
                    prefetch={false}
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-brand font-inter">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From ₹{product.price}/{product.tenure}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
