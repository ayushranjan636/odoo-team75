"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, User, Search, CalendarIcon, X } from "lucide-react"
import { cn, formatDateRange } from "@/lib/utils"
import type { DateRange as DayPickerDateRange } from "react-day-picker"

type DateRange = {
  from?: Date
  to?: Date
}

const routeTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/orders": "Orders",
  "/admin/pickups": "Pickups",
  "/admin/returns": "Returns",
  "/admin/products": "Products",
  "/admin/pricing": "Pricing",
  "/admin/reports": "Reports",
  "/admin/customers": "Customers",
  "/admin/locations": "Locations",
  "/admin/appointments": "Appointments",
  "/admin/settings": "Settings",
}

export function AdminHeader() {
  const pathname = usePathname()
  const currentTitle = routeTitles[pathname] || "Admin"
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In a real app, this would trigger a global search
      console.log("Global search:", searchQuery)
      // Could navigate to search results or filter current page
    }
  }

  const clearDateRange = () => {
    setDateRange(undefined)
    setIsDatePickerOpen(false)
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      setIsDatePickerOpen(false)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== "/admin" && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, products..."
              className="w-[200px] lg:w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Global Date Range Filter */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] lg:w-[250px] justify-start text-left font-normal hidden md:flex",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <div className="flex items-center gap-1">
                    <span>{formatDateRange(dateRange.from, dateRange.to)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearDateRange()
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  formatDateRange(dateRange.from, undefined)
                )
              ) : (
                <span>Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange as DayPickerDateRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
            />
            {dateRange && (
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" onClick={clearDateRange} className="w-full bg-transparent">
                  Clear Date Range
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-4" />

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
