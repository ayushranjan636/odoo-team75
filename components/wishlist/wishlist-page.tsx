"use client"

import { useState, useEffect } from "react"
import { useWishlistStore } from "@/hooks/use-wishlist-store"
import { useCartStore } from "@/hooks/use-cart-store"
import { apiClient } from "@/lib/api"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { wishlistIds, removeFromWishlist } = useWishlistStore()
  const addItemToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch products by IDs
        const response = await apiClient.getProducts({ ids: wishlistIds.join(",") })

        if (response.error) {
          setError(response.error)
          setProducts([])
          return
        }

        setProducts(response.data?.items || [])
      } catch (error) {
        console.error("Error fetching wishlist products:", error)
        setError("Failed to fetch wishlist products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistProducts()
  }, [wishlistIds])

  const handleAddToCart = (product: Product) => {
    // Add with default settings - user can modify in cart
    const basePrice = product.salesPrice || 0
    const pricePerUnit = basePrice * 0.06 // Default to daily rate

    addItemToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] || "/placeholder.svg",
        pricePerUnit,
        qty: 1,
        tenureType: "day",
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        deposit: basePrice * 0.1,
      },
      { navigate: false, showToast: true },
    )
  }

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId)
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-4">
                <div className="w-full aspect-[4/3] bg-muted animate-pulse rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Wishlist</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-6">Save items you love to your wishlist and rent them later.</p>
          <Button asChild>
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          <span className="text-muted-foreground">({products.length} items)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden group">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-4 space-y-4">
                <div>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    From {formatCurrency((product.salesPrice || 0) * 0.06)}/day
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemove(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
