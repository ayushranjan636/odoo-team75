"use client"

import { useState, useEffect } from "react"
import { useProductFilters } from "@/hooks/use-product-filters"
import { CatalogTopBar } from "@/components/browse/catalog-top-bar"
import { FilterRail } from "@/components/browse/filter-rail"
import { ProductGrid } from "@/components/browse/product-grid"
import { ProductList } from "@/components/browse/product-list"
import { Pagination } from "@/components/browse/pagination"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter, SlidersHorizontal } from "lucide-react"
import { ApiStatusBanner } from "@/components/ui/api-status-banner"
import { apiClient } from "@/lib/api"
import type { Product } from "@/lib/types"
import { QuickViewModal } from "@/components/browse/quick-view-modal"

export default function BrowsePage() {
  const { filters, updateFilters } = useProductFilters()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null) // Added quick view state

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.getProducts({
          q: filters.q,
          category: filters.category,
          page: filters.page || 1,
          limit: filters.limit || 12,
          sort: filters.sort,
          tenure: filters.tenure,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          availableFrom: filters.availableFrom?.toISOString(),
          availableTo: filters.availableTo?.toISOString(),
          pricelist: filters.pricelist,
          ...(filters.attributes &&
            Object.keys(filters.attributes).reduce(
              (acc, key) => {
                acc[`attrs[${key}]`] = filters.attributes![key].join(",")
                return acc
              },
              {} as Record<string, string>,
            )),
        })

        if (response.error) {
          setError(response.error)
          setProducts([])
          setTotalProducts(0)
          return
        }

        if (response.data) {
          setProducts(response.data.items)
          setTotalProducts(response.data.total)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Failed to fetch products")
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  const handleQuickView = (slug: string) => {
    setQuickViewSlug(slug)
  }

  const renderProductContent = () => {
    const itemsPerPage = filters.limit || 12

    if (loading) {
      const skeletons = Array.from({ length: itemsPerPage }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden flex flex-col animate-pulse"
        >
          <div className="relative w-full aspect-[4/3] bg-muted/20 rounded-t-xl" />
          <div className="p-4 space-y-3 flex-grow">
            <div className="h-5 bg-muted/20 rounded w-3/4" />
            <div className="h-4 bg-muted/20 rounded w-1/2" />
            <div className="h-4 bg-muted/20 rounded w-full" />
            <div className="h-10 bg-muted/20 rounded-lg w-full" />
          </div>
        </div>
      ))
      return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">{skeletons}</div>
    }

    if (error) {
      return (
        <div className="p-6 space-y-4">
          {error.includes("Network error") || error.includes("Failed to fetch") ? (
            <ApiStatusBanner endpoint="/api/products" method="GET" samplePayload={filters} />
          ) : null}

          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Products</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      )
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-12 px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Products Found</h2>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => updateFilters({})}>
              Clear Filters
            </Button>
            <Button asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      )
    }

    if (view === "grid") {
      return <ProductGrid products={products} onQuickView={handleQuickView} /> // Pass onQuickView prop
    } else {
      return <ProductList products={products} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <CatalogTopBar currentView={view} onViewChange={setView} />

      <div className="flex flex-1">
        {/* Desktop Filter Rail */}
        <aside className="hidden md:block w-72 flex-shrink-0 border-r border-border">
          <FilterRail />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {renderProductContent()}
          {!loading && !error && products.length > 0 && (
            <Pagination totalItems={totalProducts} itemsPerPage={filters.limit || 12} />
          )}
        </main>
      </div>

      {/* Mobile Filter/Sort Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg md:hidden z-40">
        <div className="flex justify-around py-3">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-foreground">
                <Filter className="h-5 w-5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md p-0">
              <FilterRail onClose={() => setIsFilterSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" className="flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="h-5 w-5" />
            Sort
          </Button>
        </div>
      </div>

      <QuickViewModal productSlug={quickViewSlug} isOpen={!!quickViewSlug} onClose={() => setQuickViewSlug(null)} />
    </div>
  )
}
