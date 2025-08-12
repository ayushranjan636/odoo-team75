"use client"

import type React from "react"
import { Heart, Plus, Eye, CalendarIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatCurrency, getAvailabilityColor, getProductAvailability } from "@/lib/utils"
import { mockReservations } from "@/lib/mock-data"
import { useCartStore } from "@/hooks/use-cart-store"
import { useWishlistStore } from "@/hooks/use-wishlist-store"
import { toast } from "sonner"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    image?: string
    pricePerTenure?: number
    tenure?: string
    qtyOnHand: number
    salesPrice?: number
    availabilityStatus?: "green" | "yellow" | "red"
  }
  onQuickView?: (slug: string) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedTenure, setSelectedTenure] = useState<"hour" | "day" | "week" | "month">("day")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const addItemToCart = useCartStore((state) => state.addItem)

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)

  const { status: availabilityStatus, text: availabilityText } = getProductAvailability(
    { id: product.id, qtyOnHand: product.qtyOnHand },
    mockReservations,
  )

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!dateRange.from || !dateRange.to) {
      setShowQuickAdd(true)
      return
    }

    if (availabilityStatus === "red") {
      toast.error("Product not available for selected dates.")
      return
    }

    const basePrice = product.salesPrice || product.pricePerTenure || 0
    const priceMultipliers = { hour: 0.01, day: 0.06, week: 0.28, month: 0.9 }
    const pricePerUnit = basePrice * priceMultipliers[selectedTenure]

    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image || "/placeholder.svg",
      pricePerUnit,
      qty: 1,
      tenureType: selectedTenure,
      startDate: dateRange.from,
      endDate: dateRange.to,
      deposit: basePrice * 0.1,
    })

    setShowQuickAdd(false)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product.id)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product.slug)
  }

  return (
    <div className="group block rounded-xl border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex flex-col">
      <Link href={`/product/${product.slug}`} prefetch={false}>
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {onQuickView && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/30 hover:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={handleQuickView}
                aria-label="Quick view"
              >
                <Eye className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-black/30 hover:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
            </Button>
          </div>
        </div>
      </Link>
      <div className="p-4 space-y-2 flex-grow flex flex-col">
        <Link href={`/product/${product.slug}`} prefetch={false}>
          <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(product.pricePerTenure ?? 0)}
            <span className="text-sm font-normal text-muted-foreground">/{product.tenure}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", getAvailabilityColor(availabilityStatus))} />
          <span>{availabilityText}</span>
          <span className="ml-auto text-xs">On Hand: {product.qtyOnHand}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link href={`/product/${product.slug}`} className="flex-1" prefetch={false}>
            <Button variant="outline" className="w-full transition-colors bg-transparent">
              Rent Now
            </Button>
          </Link>

          <Popover open={showQuickAdd} onOpenChange={setShowQuickAdd}>
            <PopoverTrigger asChild>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={handleQuickAddToCart}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold">Quick Add to Cart</h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rental Period</label>
                  <Tabs value={selectedTenure} onValueChange={(value) => setSelectedTenure(value as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="hour">Hour</TabsTrigger>
                      <TabsTrigger value="day">Day</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Dates</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from && dateRange.to
                          ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                          : "Pick dates"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button className="w-full" onClick={handleQuickAddToCart} disabled={!dateRange.from || !dateRange.to}>
                  Add to Cart
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
