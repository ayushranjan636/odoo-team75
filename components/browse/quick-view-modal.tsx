"use client"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Minus, Plus, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn, formatCurrency, formatDateRange, getAvailabilityColor, getProductAvailability } from "@/lib/utils"
import { isBefore, isAfter, isEqual } from "date-fns"
import { useCartStore } from "@/hooks/use-cart-store"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { mockReservations } from "@/lib/mock-data"
import { calculateRentalPrice } from "@/lib/pricing"

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  productSlug: string | null
}

export function QuickViewModal({ isOpen, onClose, productSlug }: QuickViewModalProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTenure, setSelectedTenure] = useState<"hour" | "day" | "week" | "month">("month")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [quantity, setQuantity] = useState(1)
  const addItemToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (!productSlug) {
      setProduct(null)
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products/${productSlug}`)
        if (!response.ok) throw new Error("Failed to fetch product")
        const data = await response.json()
        setProduct(data)
        // Reset state for new product
        setSelectedTenure("month")
        setDateRange({})
        setQuantity(1)
      } catch (error) {
        console.error("Error fetching product for quick view:", error)
        setProduct(null)
        showComingSoonToast() // "Failed to load product details."
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productSlug])

  const { currentPrice, currentDeposit, availabilityStatus } = useMemo(() => {
    if (!product) return { currentPrice: 0, currentDeposit: 0, availabilityStatus: "red" }

    const { price, deposit } = calculateRentalPrice(
      product,
      selectedTenure,
      dateRange.from || new Date(),
      dateRange.to || new Date(),
    )

    const status = getProductAvailability(
      { id: product.id, qtyOnHand: product.qtyOnHand },
      mockReservations,
      dateRange.from,
      dateRange.to,
    ).status

    return { currentPrice: price, currentDeposit: deposit, availabilityStatus: status }
  }, [product, selectedTenure, dateRange])

  const handleAddToCart = () => {
    if (!product || !dateRange.from || !dateRange.to) {
      showComingSoonToast() // "Please select dates for rental."
      return
    }

    if (availabilityStatus === "red") {
      showComingSoonToast() // "Product not available for selected dates."
      return
    }

    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      pricePerUnit: currentPrice,
      qty: quantity,
      tenureType: selectedTenure,
      startDate: dateRange.from,
      endDate: dateRange.to,
      deposit: currentDeposit,
    })
    // Keep modal open, show toast with "View Cart" & "Continue Browsing" actions
    // The useCartStore already shows a toast.
  }

  const isAddToCartDisabled = !product || !dateRange.from || !dateRange.to || availabilityStatus === "red"

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl bg-card p-0 rounded-xl overflow-hidden">
          <div className="p-6 text-center text-muted-foreground">Loading product details...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!product) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl bg-card p-0 rounded-xl overflow-hidden">
          <div className="p-6 text-center text-destructive">Product not found.</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-card p-0 rounded-xl overflow-hidden flex flex-col md:flex-row">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 text-muted-foreground hover:bg-muted/20 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        {/* Image Gallery (simplified for Quick View) */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-auto overflow-hidden">
          <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        </div>

        {/* Product Info & Selector */}
        <div className="w-full md:w-1/2 p-6 space-y-6 flex flex-col">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-foreground">{product.name}</DialogTitle>
            <p className="text-muted-foreground text-sm">{product.description}</p>
          </DialogHeader>

          {/* Rental Selector */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Rental Plan</h4>
            <Tabs value={selectedTenure} onValueChange={(value) => setSelectedTenure(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-0 bg-muted/20 rounded-lg">
                <TabsTrigger
                  value="hour"
                  className="py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                >
                  Hour
                </TabsTrigger>
                <TabsTrigger
                  value="day"
                  className="py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                >
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Date Range Picker */}
            <div className="grid gap-2">
              <Label htmlFor="date-range">Rental Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange(dateRange.from, dateRange.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    defaultMonth={dateRange.from || new Date()}
                    disabled={(date) => {
                      // Disable dates that are fully reserved for this product
                      const isReserved = mockReservations.some(
                        (res) =>
                          (res.productId === product.id &&
                            isAfter(date, new Date(res.startAt)) &&
                            isBefore(date, new Date(res.endAt))) ||
                          isEqual(date, new Date(res.startAt)) ||
                          isEqual(date, new Date(res.endAt)),
                      )
                      return isReserved
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity Stepper */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min={1}
                  max={product.qtyOnHand}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.min(product.qtyOnHand, prev + 1))}
                  disabled={quantity >= product.qtyOnHand}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-muted/10 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Rental Price:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(currentPrice ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Security Deposit:</span>
              <span>{formatCurrency(currentDeposit ?? 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", getAvailabilityColor(availabilityStatus))} />
              <span>
                {
                  getProductAvailability(
                    { id: product.id, qtyOnHand: product.qtyOnHand },
                    mockReservations,
                    dateRange.from,
                    dateRange.to,
                  ).text
                }
              </span>
              <span className="ml-auto">On Hand: {product.qtyOnHand}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg font-semibold"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              Add to Cart
            </Button>
            <Link href={`/product/${product.slug}`} prefetch={false}>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 py-3 text-lg font-semibold bg-transparent"
              >
                Go to Details
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
