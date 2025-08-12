"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarDays, Package, CreditCard, Clock, MapPin, Phone, Mail, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface OrderItem {
  productId: string
  name: string
  image: string
  pricePerUnit: number
  qty: number
  startAt: string
  endAt: string
}

interface Order {
  id: string
  status: "pending" | "confirmed" | "delivered" | "returned" | "cancelled"
  paymentStatus: "pending" | "paid" | "installments" | "refunded"
  createdAt: string
  deliveryDate?: string
  returnDate?: string
  total: number
  deposit: number
  items: OrderItem[]
  contactInfo: {
    name: string
    phone: string
    email: string
    line1: string
    city: string
    state: string
    pincode: string
  }
  installmentInfo?: {
    plan: string
    currentInstallment: number
    totalInstallments: number
    nextPaymentDate?: string
    nextPaymentAmount?: number
  }
  billNumber?: string
  razorpayPaymentId?: string
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarView, setCalendarView] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
    // Set up real-time updates
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        console.log('Orders fetched successfully:', data.length, 'orders')
      } else {
        // Fallback to mock data
        setOrders(getMockOrders())
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders(getMockOrders())
    } finally {
      setLoading(false)
    }
  }

  const getMockOrders = (): Order[] => [
    {
      id: "ORD-1754961843068",
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2025-08-12T01:24:03.068Z",
      deliveryDate: "2025-08-14T18:30:00.000Z",
      returnDate: "2025-08-21T18:30:00.000Z",
      total: 12901.88,
      deposit: 4083.5,
      items: [
        {
          productId: "prod-4",
          name: "Furniture Item 4",
          image: "/placeholder.svg?height=400&width=400&query=Furniture%20Item%204",
          pricePerUnit: 11433.8,
          qty: 1,
          startAt: "2025-08-14T18:30:00.000Z",
          endAt: "2025-08-21T18:30:00.000Z"
        }
      ],
      contactInfo: {
        name: "Customer Name",
        phone: "9012345670",
        email: "student@slate.com",
        line1: "Address Line 1",
        city: "City",
        state: "Karnataka",
        pincode: "123456"
      },
      billNumber: "BILL-1754961848165",
      razorpayPaymentId: "pay_demo_123456"
    },
    {
      id: "ORD-1754961823478",
      status: "delivered",
      paymentStatus: "installments",
      createdAt: "2025-08-10T01:24:03.068Z",
      deliveryDate: "2025-08-12T18:30:00.000Z",
      returnDate: "2025-08-19T18:30:00.000Z",
      total: 8500.00,
      deposit: 2500.0,
      items: [
        {
          productId: "prod-2",
          name: "Office Chair Premium",
          image: "/placeholder.svg?height=400&width=400&query=Office%20Chair",
          pricePerUnit: 7200.0,
          qty: 1,
          startAt: "2025-08-12T18:30:00.000Z",
          endAt: "2025-08-19T18:30:00.000Z"
        }
      ],
      contactInfo: {
        name: "Customer Name",
        phone: "9012345670",
        email: "student@slate.com",
        line1: "Address Line 1",
        city: "City",
        state: "Karnataka",
        pincode: "123456"
      },
      installmentInfo: {
        plan: "2-months",
        currentInstallment: 1,
        totalInstallments: 2,
        nextPaymentDate: "2025-09-12T00:00:00.000Z",
        nextPaymentAmount: 4250.0
      },
      billNumber: "BILL-1754961823478"
    }
  ]

  const handlePayNow = async (order: Order) => {
    if (!order.installmentInfo) return

    setLoading(true)
    toast({
      title: "Redirecting to Payment",
      description: `Processing payment of ₹${order.installmentInfo.nextPaymentAmount?.toLocaleString()} for ${order.id}`,
    })

    try {
      // Create installment payment order
      const paymentResponse = await fetch('/api/payment/installment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          installmentAmount: order.installmentInfo.nextPaymentAmount,
          installmentNumber: order.installmentInfo.currentInstallment + 1
        })
      })

      const paymentData = await paymentResponse.json()

      if (paymentData.success) {
        // In a real application, this would open Razorpay
        // For demo, we'll simulate successful payment
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: "Your installment payment has been processed successfully.",
          })
          
          // Update order status
          setOrders(prev => prev.map(o => 
            o.id === order.id 
              ? {
                  ...o,
                  installmentInfo: {
                    ...o.installmentInfo!,
                    currentInstallment: o.installmentInfo!.currentInstallment + 1,
                    nextPaymentDate: o.installmentInfo!.currentInstallment + 1 < o.installmentInfo!.totalInstallments 
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                      : undefined,
                    nextPaymentAmount: o.installmentInfo!.currentInstallment + 1 < o.installmentInfo!.totalInstallments 
                      ? o.installmentInfo!.nextPaymentAmount
                      : undefined
                  },
                  paymentStatus: o.installmentInfo!.currentInstallment + 1 >= o.installmentInfo!.totalInstallments ? "paid" : "installments"
                }
              : o
          ))
          setLoading(false)
        }, 2000)
      } else {
        throw new Error(paymentData.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleDownloadBill = (order: Order) => {
    if (order.billNumber) {
      const downloadUrl = `/api/payment/generate-bill/pdf?billNumber=${order.billNumber}&orderId=${order.id}&auto=true`
      window.open(downloadUrl, '_blank')
      toast({
        title: "Downloading Bill",
        description: `Invoice ${order.billNumber} is being downloaded.`,
      })
    } else {
      toast({
        title: "Bill Not Available",
        description: "Bill is not yet generated for this order.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "returned": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "installments": return "bg-orange-100 text-orange-800"
      case "refunded": return "bg-gray-100 text-gray-800"
      default: return "bg-red-100 text-red-800"
    }
  }

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case "pending": return order.paymentStatus === "pending" || order.paymentStatus === "installments"
      case "completed": return order.paymentStatus === "paid" && order.status === "returned"
      case "active": return order.status === "delivered" || order.status === "confirmed"
      default: return true
    }
  })

  const pendingPayments = orders.filter(order => 
    order.paymentStatus === "installments" && 
    order.installmentInfo?.nextPaymentAmount
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track your rental orders and manage payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={calendarView ? "default" : "outline"}
            onClick={() => setCalendarView(!calendarView)}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {calendarView ? "List View" : "Calendar View"}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <CreditCard className="h-5 w-5" />
              Pending Payments ({pendingPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPayments.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium">Order {order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Next payment: ₹{order.installmentInfo?.nextPaymentAmount?.toLocaleString()} due on{" "}
                    {order.installmentInfo?.nextPaymentDate && 
                      format(new Date(order.installmentInfo.nextPaymentDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <Button 
                  onClick={() => handlePayNow(order)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Pay Now
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({orders.filter(o => o.status === "delivered" || o.status === "confirmed").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments ({orders.filter(o => o.paymentStatus === "pending" || o.paymentStatus === "installments").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({orders.filter(o => o.paymentStatus === "paid" && o.status === "returned").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {calendarView ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-80 flex-shrink-0">
                    <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border w-fit"
                        modifiers={{
                          hasOrder: filteredOrders.flatMap(order => [
                            order.deliveryDate ? new Date(order.deliveryDate) : [],
                            order.returnDate ? new Date(order.returnDate) : []
                          ].filter(Boolean)).flat()
                        }}
                        modifiersClassNames={{
                          hasOrder: "bg-blue-100 text-blue-900 font-semibold"
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-4">
                      Orders for {selectedDate ? format(selectedDate, "PPP") : "Selected Date"}
                    </h3>
                    <div className="space-y-4">
                      {filteredOrders
                        .filter(order => {
                          if (!selectedDate) return false
                          const orderDate = new Date(order.createdAt)
                          const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null
                          const returnDate = order.returnDate ? new Date(order.returnDate) : null
                          
                          return (
                            orderDate.toDateString() === selectedDate.toDateString() ||
                            (deliveryDate && deliveryDate.toDateString() === selectedDate.toDateString()) ||
                            (returnDate && returnDate.toDateString() === selectedDate.toDateString())
                          )
                        })
                        .map(order => (
                          <Card key={order.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{order.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.length} item(s) • ₹{order.total.toLocaleString()}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                    {order.paymentStatus}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {order.billNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadBill(order)}
                                  >
                                    📄 Download Bill
                                  </Button>
                                )}
                                {order.installmentInfo?.nextPaymentAmount && (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayNow(order)}
                                    disabled={loading}
                                  >
                                    Pay ₹{order.installmentInfo.nextPaymentAmount.toLocaleString()}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      {filteredOrders.filter(order => {
                        if (!selectedDate) return false
                        const orderDate = new Date(order.createdAt)
                        const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null
                        const returnDate = order.returnDate ? new Date(order.returnDate) : null
                        
                        return (
                          orderDate.toDateString() === selectedDate.toDateString() ||
                          (deliveryDate && deliveryDate.toDateString() === selectedDate.toDateString()) ||
                          (returnDate && returnDate.toDateString() === selectedDate.toDateString())
                        )
                      }).length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No orders found for this date</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === "all" 
                    ? "You haven't placed any orders yet."
                    : `No ${activeTab} orders found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order {order.id}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₹{order.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Deposit: ₹{order.deposit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Items</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.qty} × ₹{item.pricePerUnit.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(item.startAt), "MMM dd")} - {format(new Date(item.endAt), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Information */}
                  {order.deliveryDate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Delivery Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.deliveryDate), "MMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      {order.returnDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Return Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.returnDate), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <h5 className="font-medium mb-2">Delivery Address</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{order.contactInfo.name}</p>
                          <p className="text-muted-foreground">
                            {order.contactInfo.line1}, {order.contactInfo.city}, {order.contactInfo.state} {order.contactInfo.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p>{order.contactInfo.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>{order.contactInfo.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Installment Information */}
                  {order.installmentInfo && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h5 className="font-medium mb-2 text-orange-800">Installment Plan</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><span className="font-medium">Plan:</span> {order.installmentInfo.plan}</p>
                          <p><span className="font-medium">Progress:</span> {order.installmentInfo.currentInstallment}/{order.installmentInfo.totalInstallments} payments completed</p>
                        </div>
                        {order.installmentInfo.nextPaymentDate && (
                          <div>
                            <p><span className="font-medium">Next Payment:</span> ₹{order.installmentInfo.nextPaymentAmount?.toLocaleString()}</p>
                            <p><span className="font-medium">Due Date:</span> {format(new Date(order.installmentInfo.nextPaymentDate), "MMM dd, yyyy")}</p>
                          </div>
                        )}
                      </div>
                      {order.installmentInfo.nextPaymentAmount && (
                        <Button 
                          onClick={() => handlePayNow(order)}
                          className="mt-3 bg-orange-600 hover:bg-orange-700"
                        >
                          Pay ₹{order.installmentInfo.nextPaymentAmount.toLocaleString()} Now
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Payment Information */}
                  {order.billNumber && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <p>Bill Number: {order.billNumber}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBill(order)}
                          className="text-xs"
                        >
                          📄 Download Bill
                        </Button>
                        {order.razorpayPaymentId && (
                          <p>Payment ID: {order.razorpayPaymentId}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
