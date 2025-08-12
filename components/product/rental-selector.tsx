"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, addDays, differenceInHours, differenceInDays } from "date-fns"
import { calculateRentalPrice } from "@/lib/pricing"

interface Product {
  id: string
  price: number
  qtyOnHand: number
}

interface RentalSelectorProps {
  product: Product
  onRentalDataChange: (data: {
    tenureType: "hour" | "day" | "week" | "month"
    startDate: Date | null
    endDate: Date | null
    quantity: number
    totalPrice: number
    deposit: number
  }) => void
}

export function RentalSelector({ product, onRentalDataChange }: RentalSelectorProps) {
  const [tenureType, setTenureType] = useState<"hour" | "day" | "week" | "month">("day")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState("10:00")
  const [endTime, setEndTime] = useState("18:00")
  const [quantity, setQuantity] = useState(1)

  // Calculate pricing and update parent
  useEffect(() => {
    let totalPrice = 0
    let deposit = 0

    if (startDate && endDate) {
      const duration =
        tenureType === "hour" ? differenceInHours(endDate, startDate) : differenceInDays(endDate, startDate) || 1

      const { price: unitPrice } = calculateRentalPrice(
        { 
          id: product.id,
          slug: product.id,
          name: "Product",
          category: "Furniture",
          internalRef: product.id,
          salesPrice: product.price,
          qtyOnHand: product.qtyOnHand,
          qtyForecasted: 0,
          rentable: true,
          sustainability: {
            co2_new: 0,
            co2_reuse: 0,
            weight_kg: 0,
            waste_factor: 0
          },
          images: [],
          description: "",
          createdAt: new Date().toISOString()
        },
        tenureType,
        startDate,
        endDate,
        "standard"
      )
      totalPrice = unitPrice * quantity
      deposit = Math.round(product.price * 0.2) * quantity // 20% of sales price as deposit
    }

    onRentalDataChange({
      tenureType,
      startDate,
      endDate,
      quantity,
      totalPrice,
      deposit,
    })
  }, [tenureType, startDate, endDate, quantity, product.price, onRentalDataChange])

  const handleTenureChange = (value: string) => {
    setTenureType(value as "hour" | "day" | "week" | "month")

    // Auto-adjust end date based on tenure
    if (startDate) {
      switch (value) {
        case "hour":
          setEndDate(addDays(startDate, 0)) // Same day
          break
        case "day":
          setEndDate(addDays(startDate, 1))
          break
        case "week":
          setEndDate(addDays(startDate, 7))
          break
        case "month":
          setEndDate(addDays(startDate, 30))
          break
      }
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product.qtyOnHand, quantity + delta))
    setQuantity(newQuantity)
  }

  // Mock function to check if a date is available
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-900">Rental Options</h3>

      {/* Tenure Tabs */}
      <Tabs value={tenureType} onValueChange={handleTenureChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hour">Hour</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value={tenureType} className="space-y-4 mt-4">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => setStartDate(date || null)}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date) => setEndDate(date || null)}
                    disabled={(date) => isDateDisabled(date) || (startDate ? date <= startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Selection for hourly rentals */}
          {tenureType === "hour" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.qtyOnHand}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">(Max: {product.qtyOnHand})</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
