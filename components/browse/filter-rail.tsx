"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn, formatCurrency, formatDateRange } from "@/lib/utils"
import { useProductFilters } from "@/hooks/use-product-filters"
import { allMockProducts } from "@/lib/mock-data"

interface FilterRailProps {
  onClose?: () => void // For mobile sheet
}

export function FilterRail({ onClose }: FilterRailProps) {
  const { filters, updateFilters, clearFilters } = useProductFilters()

  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || 100000])
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.availableFrom,
    to: filters.availableTo,
  })
  const [selectedTenure, setSelectedTenure] = useState(filters.tenure || "month")
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>(filters.attributes || {})

  // Extract all unique attributes from mock products
  const allAttributes: { [key: string]: string[] } = {}
  allMockProducts.forEach((product) => {
    if (product.attributes) {
      for (const key in product.attributes) {
        const attrValues = product.attributes[key as keyof typeof product.attributes]
        if (Array.isArray(attrValues)) {
          if (!allAttributes[key]) {
            allAttributes[key] = []
          }
          attrValues.forEach((val) => {
            if (typeof val === 'string' && !allAttributes[key].includes(val)) {
              allAttributes[key].push(val)
            }
          })
        }
      }
    }
  })

  useEffect(() => {
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 100000])
    setDateRange({ from: filters.availableFrom, to: filters.availableTo })
    setSelectedTenure(filters.tenure || "month")
    setSelectedAttributes(filters.attributes || {})
  }, [filters])

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }

  const handlePriceApply = () => {
    updateFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] })
    if (onClose) {
      setTimeout(() => onClose(), 100) // Small delay to show the filter was applied
    }
  }

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setDateRange(range || {})
    updateFilters({
      availableFrom: range?.from || undefined,
      availableTo: range?.to || undefined,
    })
    if (onClose && range?.from && range?.to) {
      setTimeout(() => onClose(), 100)
    }
  }

  const handleTenureChange = (value: string) => {
    setSelectedTenure(value as "hour" | "day" | "week" | "month")
    updateFilters({ tenure: value as "hour" | "day" | "week" | "month" })
    if (onClose) {
      setTimeout(() => onClose(), 100)
    }
  }

  const handleAttributeToggle = (attrName: string, attrValue: string) => {
    setSelectedAttributes((prev) => {
      const currentValues = prev[attrName] || []
      const newValues = currentValues.includes(attrValue)
        ? currentValues.filter((v) => v !== attrValue)
        : [...currentValues, attrValue]

      const newAttrs = { ...prev, [attrName]: newValues }
      if (newValues.length === 0) {
        delete newAttrs[attrName]
      }
      updateFilters({ attributes: newAttrs })

      if (onClose) {
        setTimeout(() => onClose(), 100)
      }

      return newAttrs
    })
  }

  const handleClearAll = () => {
    clearFilters()
    setPriceRange([0, 100000])
    setDateRange({})
    setSelectedTenure("month")
    setSelectedAttributes({})
    onClose?.() // Close mobile sheet
  }

  return (
    <div className="p-6 space-y-8 bg-card border-r border-border h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-foreground">Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Availability Date Range */}
      <div className="space-y-4">
        <Label className="text-foreground">Availability Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(dateRange.from, dateRange.to)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange as any}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              defaultMonth={dateRange.from || new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Tenure Tabs */}
      <div className="space-y-4">
        <Label className="text-foreground">Tenure</Label>
        <Tabs value={selectedTenure} onValueChange={handleTenureChange} className="w-full">
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
              className="py-2 px-3 text-sm data-[state=active]:bg-primary data-[state-active]:text-primary-foreground rounded-lg"
            >
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Price/day Slider */}
      <div className="space-y-4">
        <Label className="text-foreground">Price/{selectedTenure}</Label>
        <Slider
          min={0}
          max={100000}
          step={100}
          value={priceRange}
          onValueChange={handlePriceChange}
          onPointerUp={handlePriceApply} // Apply filter on release
          className="[&_[data-radix-slider-track]]:bg-primary/20 [&_[data-radix-slider-range]]:bg-primary"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(priceRange[0])}</span>
          <span>{formatCurrency(priceRange[1])}</span>
        </div>
      </div>

      {/* Attributes */}
      {Object.keys(allAttributes).map((attrName) => (
        <div key={attrName} className="space-y-4">
          <Label className="text-foreground">{attrName.charAt(0).toUpperCase() + attrName.slice(1)}</Label>
          <div className="flex flex-wrap gap-2">
            {allAttributes[attrName].map((attrValue) => {
              const isActive = selectedAttributes[attrName]?.includes(attrValue)
              return (
                <Button
                  key={attrValue}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full px-3 py-1 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-card text-foreground hover:bg-muted/10",
                  )}
                  onClick={() => handleAttributeToggle(attrName, attrValue)}
                >
                  {attrValue}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
