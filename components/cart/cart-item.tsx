"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Minus, Plus, Trash2, Edit3 } from "lucide-react"
import { useCartStore, type CartItem as CartItemType } from "@/hooks/use-cart-store"
import { formatCurrency, formatDateRange, cn } from "@/lib/utils"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeItem } = useCartStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTenure, setEditTenure] = useState(item.tenureType)
  const [editDateRange, setEditDateRange] = useState<{ from?: Date; to?: Date }>({
    from: item.startDate,
    to: item.endDate,
  })
  const [editQuantity, setEditQuantity] = useState(item.qty)

  const handleQuantityChange = (newQty: number) => {
    if (newQty <= 0) {
      handleRemove()
    } else {
      updateItemQuantity(item.productId, newQty)
    }
  }

  const handleRemove = () => {
    removeItem(item.productId)
    showComingSoonToast() // "Item removed from cart"
  }

  const handleSaveEdit = () => {
    // In a real app, this would recalculate pricing and update the item
    // For now, we'll just show a toast and close editing mode
    showComingSoonToast() // "Item updated successfully"
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTenure(item.tenureType)
    setEditDateRange({ from: item.startDate, to: item.endDate })
    setEditQuantity(item.qty)
    setIsEditing(false)
  }

  const itemTotal = item.pricePerUnit * item.qty
  const depositTotal = item.deposit * item.qty

  return (
    <div className="flex gap-4 p-4 bg-background border border-border rounded-lg">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      {/* Product Details */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/product/${item.slug}`} prefetch={false}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{item.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground capitalize">
              {item.tenureType} rental • {formatDateRange(item.startDate, item.endDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit item</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>

        {/* Editing Mode */}
        {isEditing && (
          <div className="bg-muted/10 p-4 rounded-lg space-y-4 border border-border">
            <h4 className="font-medium text-foreground">Edit Rental Details</h4>

            {/* Tenure Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Rental Period</Label>
              <Tabs value={editTenure} onValueChange={(value) => setEditTenure(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-muted/20 rounded-lg">
                  <TabsTrigger value="hour" className="py-1 px-2 text-xs">
                    Hour
                  </TabsTrigger>
                  <TabsTrigger value="day" className="py-1 px-2 text-xs">
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="week" className="py-1 px-2 text-xs">
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="py-1 px-2 text-xs">
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm">Rental Dates</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editDateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange(editDateRange.from, editDateRange.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={editDateRange}
                    onSelect={setEditDateRange}
                    numberOfMonths={2}
                    defaultMonth={editDateRange.from || new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-sm">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                  disabled={editQuantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-16 text-center h-8"
                  min={1}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditQuantity(editQuantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Edit Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quantity and Price (Normal Mode) */}
        {!isEditing && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(item.qty - 1)}
                disabled={item.qty <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(item.qty + 1)}
                className="h-8 w-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(itemTotal)}</div>
              <div className="text-xs text-muted-foreground">+ {formatCurrency(depositTotal)} deposit</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
