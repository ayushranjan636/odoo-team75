"use client"

import { useState } from "react"
import { useAdminStore } from "@/hooks/use-admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Eye,
  Pencil,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Search,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react"
import type { Order } from "@/hooks/use-admin-store"

export function AdminOrdersComprehensive() {
  const { 
    orders, 
    updateOrderStatus, 
    updatePaymentStatus, 
    fetchOrders 
  } = useAdminStore()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)

  // Filter orders based on search, status, and payment
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const result = await updateOrderStatus(orderId, newStatus)

    if (result.success) {
      toast.success(`Order status updated to ${newStatus}`)
    } else {
      toast.error(result.error || "Failed to update order status")
    }
  }

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: Order['paymentStatus']) => {
    const result = await updatePaymentStatus(orderId, newStatus)

    if (result.success) {
      toast.success(`Payment status updated to ${newStatus}`)
    } else {
      toast.error(result.error || "Failed to update payment status")
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailOpen(true)
  }

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'delivered': return 'outline'
      case 'returned': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPaymentBadgeVariant = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'failed': return 'destructive'
      case 'refunded': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'delivered': return <Package className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  // Calculate summary stats
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({filteredOrders.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.items.length} item(s)</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{order.totalAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openOrderDetail(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value as Order['status'])}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => handleUpdatePaymentStatus(order.id, value as Order['paymentStatus'])}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete order information and management
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedOrder.customerPhone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <Badge variant={getPaymentBadgeVariant(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-bold text-lg">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rental Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rental Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Delivery Date</Label>
                      <p className="font-medium">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Return Date</Label>
                      <p className="font-medium">{new Date(selectedOrder.returnDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.pricing.daily}</TableCell>
                          <TableCell>₹{item.totalAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
