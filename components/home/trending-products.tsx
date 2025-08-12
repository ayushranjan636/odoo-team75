"use client"

import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

interface Product {
  id: string
  slug: string
  name: string
  image?: string
  pricePerTenure: number
  tenure: string
  qtyOnHand: number
  availabilityStatus: string
  images: string[]
  salesPrice: number
  category: string
}

export function TrendingProducts() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        console.log('Fetching trending products...')
        const response = await fetch('/api/products?limit=8&sort=popularity')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        console.log('API response:', data)
        
        // Prioritize popular categories like Electronics and Furniture for trending
        const allProducts = data.products || []
        console.log('All products:', allProducts.length)
        
        if (allProducts.length === 0) {
          // Fallback with hardcoded popular products for demo
          const fallbackProducts = [
            {
              id: "mock-1",
              name: "4K Smart TV - 55 inch",
              slug: "4k-smart-tv-55-inch",
              images: ["/tv.jpeg"],
              salesPrice: 500,
              pricePerTenure: 500,
              tenure: "month",
              category: "Electronics",
              qtyOnHand: 5,
              availabilityStatus: "green"
            },
            {
              id: "mock-2", 
              name: "MacBook Pro - M3 Chip",
              slug: "macbook-pro-m3-chip",
              images: ["/mac.png"],
              salesPrice: 800,
              pricePerTenure: 800,
              tenure: "month",
              category: "Electronics",
              qtyOnHand: 3,
              availabilityStatus: "green"
            },
            {
              id: "mock-3",
              name: "Ergonomic Office Chair - Premium",
              slug: "ergonomic-office-chair-premium", 
              images: ["/chair.png"],
              salesPrice: 250,
              pricePerTenure: 250,
              tenure: "month",
              category: "Furniture",
              qtyOnHand: 10,
              availabilityStatus: "green"
            },
            {
              id: "mock-4",
              name: "Gaming Console - Latest Gen",
              slug: "gaming-console-latest-gen",
              images: ["/rc.png"],
              salesPrice: 400,
              pricePerTenure: 400,
              tenure: "month",
              category: "Electronics", 
              qtyOnHand: 6,
              availabilityStatus: "green"
            },
            {
              id: "mock-5",
              name: "Air Conditioner - Split AC 1.5 Ton",
              slug: "air-conditioner-split-ac-15-ton",
              images: ["/ac.jpg"],
              salesPrice: 400,
              pricePerTenure: 400,
              tenure: "month",
              category: "Appliances",
              qtyOnHand: 12,
              availabilityStatus: "green"
            },
            {
              id: "mock-6",
              name: "Luxury Sofa Set - 3+2",
              slug: "luxury-sofa-set-3-2",
              images: ["/sofa.jpg"],
              salesPrice: 700,
              pricePerTenure: 700,
              tenure: "month",
              category: "Furniture",
              qtyOnHand: 4,
              availabilityStatus: "green"
            }
          ]
          setTrendingProducts(fallbackProducts)
          console.log('Using fallback products:', fallbackProducts.length)
          return
        }
        
        const popularCategories = ['Electronics', 'Furniture', 'Appliances']
        
        // First get products from popular categories, then fill with others
        const categorizedProducts = popularCategories.flatMap(category => 
          allProducts.filter((p: Product) => p.category === category)
        )
        const otherProducts = allProducts.filter((p: Product) => 
          !popularCategories.includes(p.category)
        )
        
        const trendingSelection = [...categorizedProducts, ...otherProducts].slice(0, 6)
        console.log('Selected trending products:', trendingSelection.length)
        setTrendingProducts(trendingSelection)
      } catch (error) {
        console.error('Failed to fetch trending products:', error)
        // Set fallback products on error too
        setTrendingProducts([
          {
            id: "error-1",
            name: "4K Smart TV - 55 inch",
            slug: "4k-smart-tv-55-inch",
            images: ["/tv.jpeg"],
            salesPrice: 500,
            pricePerTenure: 500,
            tenure: "month",
            category: "Electronics",
            qtyOnHand: 5,
            availabilityStatus: "green"
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-sans mb-6">Trending Products</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-80 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-sans">Trending Products</h2>
          <Link href="/browse?sort=popularity" prefetch={false}>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide lg:scrollbar-default">
          <div className="flex gap-6">
            {trendingProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-72">
                <ProductCard
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.images?.[0] || "/placeholder.jpg",
                    pricePerTenure: product.salesPrice,
                    tenure: "month",
                    qtyOnHand: product.qtyOnHand,
                    availabilityStatus: product.availabilityStatus as "green" | "yellow" | "red",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {trendingProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No trending products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
