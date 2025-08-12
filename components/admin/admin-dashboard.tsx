"use client"

import { useState, useEffect } from "react"
import { useAdminStore } from "@/hooks/use-admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminProductsPage } from "@/components/admin/admin-products-page"
import { AdminOrdersPage } from "@/components/admin/admin-orders-page"
import { AdminPricingPage } from "@/components/admin/admin-pricing-page"
import { toast } from "sonner"
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"

export function AdminDashboard() {
  const { products, orders, syncWithOdoo, fetchProducts, fetchOrders } = useAdminStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [fetchProducts, fetchOrders])

  const handleOdooSync = async () => {
    setIsSyncing(true)
    const result = await syncWithOdoo()
    
    if (result.success) {
      toast.success("Successfully synced with Odoo!")
    } else {
      toast.error(result.error || "Failed to sync with Odoo")
    }
    
    setIsSyncing(false)
  }

  // Calculate stats
  const totalProducts = products.length
  const availableProducts = products.filter(p => p.availability.isAvailable).length
  const outOfStockProducts = products.filter(p => !p.availability.isAvailable).length
  
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
  
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0)
  
  const pendingPayments = orders
    .filter(o => o.paymentStatus === 'pending')
    .reduce((sum, order) => sum + order.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your rental business</p>
        </div>
        <Button 
          onClick={handleOdooSync} 
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync with Odoo'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{availableProducts} available</span>
                  {" • "}
                  <span className="text-red-600">{outOfStockProducts} out of stock</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-orange-600">{pendingOrders} pending</span>
                  {" • "}
                  <span className="text-green-600">{confirmedOrders} confirmed</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Paid orders only
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{pendingPayments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          order.status === 'confirmed' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'delivered' ? 'outline' : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Product availability overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.availability.isAvailable ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          In Stock ({product.availability.stock})
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <AdminProductsPage />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrdersPage />
        </TabsContent>

        <TabsContent value="pricing">
          <AdminPricingPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
