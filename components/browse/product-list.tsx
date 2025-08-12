"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { formatCurrency, getAvailabilityColor, getProductAvailability } from "@/lib/utils"
import { type Product, mockReservations } from "@/lib/mock-data"
import { useWishlistStore } from "@/hooks/use-wishlist-store"

interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()

  const handleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-semibold mb-4">No products found matching your filters.</p>
        <p>Try adjusting your search or clearing some filters.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {products.map((product) => {
        const { status: availabilityStatus, text: availabilityText } = getProductAvailability(
          { id: product.id, qtyOnHand: product.qtyOnHand },
          mockReservations,
        )
        const isWishlisted = isInWishlist(product.id)

        return (
          <div
            key={product.id}
            className="group flex flex-col sm:flex-row items-center rounded-xl border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
          >
            <Link
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-full sm:w-48 h-48 relative"
              prefetch={false}
            >
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none"
              />
            </Link>
            <div className="p-4 flex-grow flex flex-col justify-between w-full">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/product/${product.slug}`} prefetch={false}>
                  <h3 className="text-xl font-semibold text-foreground leading-tight group-hover:text-primary line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary ml-auto"
                  onClick={(e) => handleWishlist(e, product.id)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current text-primary")} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(product.pricePerTenure as number)}
                  <span className="text-base font-normal text-muted-foreground">/{product.tenure as string}</span>
                </span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={cn("h-2.5 w-2.5 rounded-full", getAvailabilityColor(availabilityStatus))} />
                  <span>{availabilityText}</span>
                  <span className="ml-2 text-xs">On Hand: {product.qtyOnHand}</span>
                </div>
              </div>
              <div className="mt-auto">
                <Link href={`/product/${product.slug}`} className="w-full block" prefetch={false}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Rent Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
