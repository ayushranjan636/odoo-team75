"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Package, CheckCircle, FileText, Eye, Truck, Download, CalendarIcon, Filter } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  status: "quotation" | "confirmed" | "picked_up" | "returned" | "late"
  paymentStatus: "pending" | "paid" | "refunded"
  total: number
  deposit: number
  deliveryDate: string
  returnDate: string
  deliveryWindow: string
  returnWindow: string
  city: string
  items: Array<{
    productName: string
    quantity: number
    pricePerUnit: number
  }>
  timeline: Array<{
    status: string
    timestamp: string
    note?: string
  }>
  createdAt: string
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time order updates
    const interval = setInterval(() => {
      fetchOrders()
      console.log('Admin dashboard: Checking for new orders...')
    }, 10000) // Check every 10 seconds for new orders
    
    return () => clearInterval(interval)
  }, [currentPage, statusFilter, cityFilter, dateRange, searchTerm])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(cityFilter !== "all" && { city: cityFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange.from && { dateFrom: dateRange.from.toISOString() }),
        ...(dateRange.to && { dateTo: dateRange.to.toISOString() }),
      })

      console.log('Admin fetching orders with params:', params.toString())

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        // Check for new orders
        const newOrderCount = data.orders.filter((order: any) => {
          const orderTime = new Date(order.createdAt).getTime()
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
          return orderTime > fiveMinutesAgo
        }).length

        if (newOrderCount > 0 && orders.length > 0) {
          // Show notification for new orders
          toast.success(`${newOrderCount} new order(s) received!`)
        }

        setOrders(data.orders)
        setTotalPages(Math.ceil(data.total / 20))
        console.log(`Admin dashboard: Loaded ${data.orders.length} orders (${data.total} total)`)
      } else {
        console.error('Failed to fetch orders:', data.error)
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as any } : order)))
      toast.success(`Order marked as ${newStatus.replace("_", " ")}`)
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const handleBulkAction = async (action: string) => {
    try {
      await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders, action }),
      })

      toast.success(`Bulk action ${action} completed`)
      setSelectedOrders([])
      fetchOrders()
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/admin/orders/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders.length > 0 ? selectedOrders : undefined }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()

      toast.success("Orders exported successfully")
    } catch (error) {
      toast.error("Failed to export orders")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "quotation":
        return "secondary"
      case "confirmed":
        return "default"
      case "picked_up":
        return "secondary"
      case "returned":
        return "outline"
      case "late":
        return "destructive"
      default:
        return "default"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "paid":
        return "default"
      case "refunded":
        return "outline"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-64"></div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="quotation">Quotation</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from
                    ? dateRange.to
                      ? `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd")}`
                      : format(dateRange.from, "LLL dd, y")
                    : "Date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange as any}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  required={false}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setCityFilter("all")
                setDateRange({})
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{selectedOrders.length} orders selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("picked_up")}>
                <Package className="mr-2 h-4 w-4" />
                Mark Picked Up
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("returned")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Returned
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.length === orders.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrders(orders.map((o) => o.id))
                        } else {
                          setSelectedOrders([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Delivery Window</TableHead>
                  <TableHead>Return Window</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(selectedOrders.filter((id) => id !== order.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}x {item.productName}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-muted-foreground">+{order.items.length - 2} more</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(order.deliveryDate), "MMM dd")}</div>
                        <div className="text-muted-foreground">{order.deliveryWindow}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(order.returnDate), "MMM dd")}</div>
                        <div className="text-muted-foreground">{order.returnWindow}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[600px] sm:w-[600px]">
                            <SheetHeader>
                              <SheetTitle>Order Details - {order.id}</SheetTitle>
                            </SheetHeader>
                            {selectedOrder && (
                              <div className="mt-6 space-y-6">
                                <div>
                                  <h4 className="font-medium mb-2">Customer Information</h4>
                                  <div className="text-sm space-y-1">
                                    <div>{selectedOrder.customerName}</div>
                                    <div className="text-muted-foreground">{selectedOrder.customerEmail}</div>
                                    <div className="text-muted-foreground">{selectedOrder.city}</div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Order Timeline</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.timeline.map((event, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span>{event.status}</span>
                                        <span className="text-muted-foreground">
                                          {format(new Date(event.timestamp), "MMM dd, HH:mm")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>

                        {order.status === "confirmed" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(order.id, "picked_up")}>
                            <Package className="h-4 w-4" />
                          </Button>
                        )}

                        {order.status === "picked_up" && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(order.id, "returned")}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        <Button size="sm" variant="ghost">
                          <FileText className="h-4 w-4" />
                        </Button>

                        <Button size="sm" variant="ghost">
                          <Truck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Showing {orders.length} orders</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
