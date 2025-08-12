"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, LayoutGrid, List, Package, Sofa, Refrigerator, Monitor, Dumbbell, Baby } from "lucide-react"
import { mockQuickFilterCategories, mockPricelists } from "@/lib/mock-data"
import { useProductFilters } from "@/hooks/use-product-filters"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const IconMap: { [key: string]: React.ElementType } = {
  Package: Package,
  Sofa: Sofa,
  Refrigerator: Refrigerator,
  Monitor: Monitor,
  Dumbbell: Dumbbell,
  Baby: Baby,
}

interface CatalogTopBarProps {
  currentView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function CatalogTopBar({ currentView, onViewChange }: CatalogTopBarProps) {
  const { filters, updateFilters } = useProductFilters()
  const [searchTerm, setSearchTerm] = useState(filters.q || "")
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchTerm !== filters.q) {
        updateFilters({ q: searchTerm || undefined })
      }
    }, 300) // Debounce search input
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchTerm, filters.q])

  const handleCategoryClick = (slug: string) => {
    updateFilters({ category: slug === filters.category ? undefined : slug })
  }

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value as "popularity" | "price-asc" | "price-desc" | "newest" })
  }

  const handlePricelistChange = (value: string) => {
    updateFilters({ pricelist: value })
  }

  return (
    <div className="sticky top-16 z-30 bg-background border-b border-border py-4 shadow-sm">
      <div className="container px-4 md:px-6">
        {/* Category Scroller (Chips) */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide lg:scrollbar-default mb-4">
          <div className="flex gap-3 whitespace-nowrap">
            {mockQuickFilterCategories.map((category) => {
              const IconComponent = IconMap[category.icon]
              const isActive = filters.category === category.slug
              return (
                <Button
                  key={category.slug}
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-card text-foreground hover:bg-muted/10",
                  )}
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Search, Price List, Sort, View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full pl-10 pr-4 py-2 border border-border bg-input focus-visible:ring-primary focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>

          {/* Price List Dropdown */}
          <Select onValueChange={handlePricelistChange} value={filters.pricelist || "standard"}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-full">
              <SelectValue placeholder="Price List" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(mockPricelists).map((key) => (
                <SelectItem key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Select */}
          <Select onValueChange={handleSortChange} value={filters.sort || "popularity"}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-full">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="price-asc">Price: Low→High</SelectItem>
              <SelectItem value="price-desc">Price: High→Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-border rounded-full p-1 bg-card">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                currentView === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
              onClick={() => onViewChange("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                currentView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
              onClick={() => onViewChange("list")}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
