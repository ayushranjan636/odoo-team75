"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Minus, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn, formatCurrency, formatDateRange, getAvailabilityColor, getProductAvailability } from "@/lib/utils"
import { isAfter, isBefore, isEqual } from "date-fns"
import { useCartStore } from "@/hooks/use-cart-store"
import { toast } from "sonner"
import { mockReservations } from "@/lib/mock-data"
import { calculateRentalPrice } from "@/lib/pricing"
import { SustainabilityMicroPanel } from "@/components/product/sustainability-micro-panel"
import { BundleIt } from "@/components/product/bundle-it"
import { WhatsAppQuickQuote } from "@/components/product/whatsapp-quick-quote"
import { ApiStatusBanner } from "@/components/ui/api-status-banner"
import { apiClient } from "@/lib/api"
import type { Product } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ProductDetailsProps {
  productSlug: string
}

export function ProductDetails({ productSlug }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedTenure, setSelectedTenure] = useState<"hour" | "day" | "week" | "month">("month")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [quantity, setQuantity] = useState(1)
  const addItemToCart = useCartStore((state) => state.addItem)
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const slugResponse = await apiClient.getProductBySlug(productSlug)

        if (slugResponse.error) {
          setError(slugResponse.error)
          setProduct(null)
          return
        }

        if (!slugResponse.data?.items || slugResponse.data.items.length === 0) {
          router.push("/product/not-found")
          return
        }

        const foundProduct = slugResponse.data.items[0]

        // We already have the full product data from the first call
        setProduct(foundProduct)
        setSelectedImage(foundProduct.images[0] || null)
        // Reset state for new product
        setSelectedTenure("month")
        setDateRange({})
        setQuantity(1)
      } catch (error) {
        console.error("Error fetching product details:", error)
        setError("Failed to fetch product details")
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productSlug, router])

  const { currentPrice, currentDeposit, availabilityStatus } = useMemo(() => {
    if (!product) return { currentPrice: 0, currentDeposit: 0, availabilityStatus: "red" as const }

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
      toast.error("Please select dates for rental.")
      return
    }

    if (availabilityStatus === "red") {
      toast.error("Product not available for selected dates.")
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
  }

  const isAddToCartDisabled = !product || !dateRange.from || !dateRange.to || availabilityStatus === "red"

  if (loading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="w-full aspect-[4/3] bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full aspect-[4/3] bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error && error.includes("Failed to fetch")) {
    return (
      <div className="container py-12">
        <div className="mb-6">
          <ApiStatusBanner endpoint="/api/products" method="GET" samplePayload={{ slug: productSlug }} />
        </div>
        <div className="max-w-md mx-auto space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Unable to Load Product</h1>
          <p className="text-muted-foreground">
            There was an error loading the product details. Please try again later.
          </p>
          <Button asChild>
            <Link href="/browse">Back to Catalog</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return null // Component will navigate away, so return null
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <Image
              src={selectedImage || product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img: string, index: number) => (
              <button
                key={index}
                className={cn(
                  "relative w-full aspect-[4/3] overflow-hidden rounded-md border-2 transition-all",
                  selectedImage === img ? "border-primary" : "border-transparent hover:border-muted",
                )}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info & Selector */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
          </div>

          {/* Rental Selector */}
          <div className="space-y-4 border-t border-b border-border py-6">
            <h2 className="text-2xl font-bold text-foreground">Choose Your Rental Plan</h2>
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
              <Label htmlFor="date-range" className="text-foreground">
                Rental Dates
              </Label>
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
              <Label htmlFor="quantity" className="text-foreground">
                Quantity
              </Label>
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

            {/* Price Box */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Rental Price:</span>
                <span className="text-4xl font-bold text-primary">{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Security Deposit:</span>
                <span className="font-medium">{formatCurrency(currentDeposit)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-primary/10">
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
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              {isAddToCartDisabled ? "Select Dates First" : "Add to Cart"}
            </Button>
          </div>

          {/* Sustainability Micro-Panel */}
          <SustainabilityMicroPanel sustainability={product.sustainability} />

          {/* WhatsApp Quick Quote */}
          <WhatsAppQuickQuote product={product} selectedTenure={selectedTenure} dateRange={dateRange} />
        </div>
      </div>

      {/* Product Details Section */}
      <div className="mt-16 space-y-12">
        {/* Product Specifications */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Product Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium">{product.internalRef}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{product.sustainability.weight_kg} kg</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Available Quantity</span>
                <span className="font-medium">{product.qtyOnHand} units</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Rentable</span>
                <span className="font-medium">{product.rentable ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Added</span>
                <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Impact */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">Sustainability Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {product.sustainability.co2_reuse}kg
              </div>
              <div className="text-sm text-muted-foreground">CO₂ Saved (Reuse vs New)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {product.sustainability.waste_factor}%
              </div>
              <div className="text-sm text-muted-foreground">Waste Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {product.sustainability.weight_kg}kg
              </div>
              <div className="text-sm text-muted-foreground">Product Weight</div>
            </div>
          </div>
        </div>

        {/* Bundle It / Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Related Products</h3>
            <BundleIt products={product.relatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}
