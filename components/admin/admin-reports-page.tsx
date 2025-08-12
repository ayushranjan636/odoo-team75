"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  CalendarIcon,
  FileText,
  Truck,
  DollarSign,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format, subDays } from "date-fns"
import { toast } from "sonner"

interface DateRange {
  from?: Date
  to?: Date
}

export function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("performance")

  // Mock data - in real app, this would come from API based on dateRange
  const performanceData = {
    revenueVsOrders: [
      { month: "Jan", revenue: 185000, orders: 45, aov: 4111 },
      { month: "Feb", revenue: 220000, orders: 52, aov: 4231 },
      { month: "Mar", revenue: 195000, orders: 48, aov: 4063 },
      { month: "Apr", revenue: 267000, orders: 61, aov: 4377 },
      { month: "May", revenue: 298000, orders: 68, aov: 4382 },
      { month: "Jun", revenue: 312000, orders: 72, aov: 4333 },
    ],
    kpis: {
      totalRevenue: 1477000,
      totalOrders: 346,
      avgOrderValue: 4269,
      conversionRate: 12.5,
      repeatCustomerRate: 34.2,
    },
  }

  const productsData = {
    mostRented: [
      { name: "Premium Office Chair", rentals: 156, revenue: 234000, utilization: 87 },
      { name: "Standing Desk", rentals: 134, revenue: 201000, utilization: 76 },
      { name: "Gaming Setup", rentals: 98, revenue: 147000, utilization: 65 },
      { name: "Home Theater", rentals: 87, revenue: 130500, utilization: 58 },
      { name: "Treadmill", rentals: 76, revenue: 114000, utilization: 52 },
    ],
    leastRented: [
      { name: "Vintage Typewriter", rentals: 3, revenue: 1200, utilization: 8 },
      { name: "Antique Mirror", rentals: 5, revenue: 2500, utilization: 12 },
      { name: "Classic Gramophone", rentals: 7, revenue: 3500, utilization: 15 },
    ],
    categoryPerformance: [
      { category: "Furniture", rentals: 245, revenue: 367500, fill: "#8884d8" },
      { category: "Electronics", rentals: 189, revenue: 283500, fill: "#82ca9d" },
      { category: "Fitness", rentals: 134, revenue: 201000, fill: "#ffc658" },
      { category: "Appliances", rentals: 98, revenue: 147000, fill: "#ff7300" },
    ],
  }

  const customersData = {
    topCustomers: [
      { name: "Rajesh Kumar", email: "rajesh@example.com", orders: 12, totalSpent: 45000, repeatRate: 85 },
      { name: "Priya Sharma", email: "priya@example.com", orders: 8, totalSpent: 32000, repeatRate: 75 },
      { name: "Amit Patel", email: "amit@example.com", orders: 6, totalSpent: 28000, repeatRate: 67 },
      { name: "Sneha Gupta", email: "sneha@example.com", orders: 5, totalSpent: 22000, repeatRate: 60 },
    ],
    customerSegments: [
      { segment: "VIP (10+ orders)", count: 23, revenue: 345000, fill: "#8884d8" },
      { segment: "Regular (5-9 orders)", count: 67, revenue: 402000, fill: "#82ca9d" },
      { segment: "Occasional (2-4 orders)", count: 156, revenue: 468000, fill: "#ffc658" },
      { segment: "New (1 order)", count: 234, revenue: 234000, fill: "#ff7300" },
    ],
  }

  const operationsData = {
    onTimeMetrics: {
      onTimePickups: 89.5,
      onTimeReturns: 76.3,
      avgLateDays: 2.4,
      feeRecovery: 67.8,
    },
    lateReturns: [
      { orderId: "ORD-1234", customer: "John Doe", product: "Office Chair", daysLate: 3, fee: 300, recovered: true },
      { orderId: "ORD-5678", customer: "Jane Smith", product: "Standing Desk", daysLate: 1, fee: 100, recovered: true },
      { orderId: "ORD-9012", customer: "Bob Wilson", product: "Gaming Setup", daysLate: 5, fee: 500, recovered: false },
      { orderId: "ORD-3456", customer: "Alice Brown", product: "Treadmill", daysLate: 2, fee: 200, recovered: true },
    ],
    pickupReturns: [
      { date: "2024-01-15", pickups: 23, returns: 18, onTimePickups: 21, onTimeReturns: 14 },
      { date: "2024-01-16", pickups: 19, returns: 22, onTimePickups: 17, onTimeReturns: 16 },
      { date: "2024-01-17", pickups: 25, returns: 20, onTimePickups: 22, onTimeReturns: 15 },
      { date: "2024-01-18", pickups: 21, returns: 24, onTimePickups: 19, onTimeReturns: 19 },
    ],
  }

  const handleExport = async (exportFormat: "csv" | "xlsx" | "pdf") => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          format,
          dateRange,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${activeTab}-report-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`
      a.click()

      toast.success(`${activeTab} report exported as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      toast.error("Failed to export report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business performance insights</p>
        </div>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd")}`
                    : format(dateRange.from, "LLL dd, y")
                  : "Select date range"}
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

          <Button variant="outline" onClick={() => handleExport("csv")} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("xlsx")} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(performanceData.kpis.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{performanceData.kpis.totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(performanceData.kpis.avgOrderValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{performanceData.kpis.conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Repeat Rate</p>
                    <p className="text-2xl font-bold">{performanceData.kpis.repeatCustomerRate}%</p>
                  </div>
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "#8884d8" },
                  orders: { label: "Orders", color: "#82ca9d" },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.revenueVsOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Rented Products */}
            <Card>
              <CardHeader>
                <CardTitle>Most Rented Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Rentals</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsData.mostRented.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.rentals}</TableCell>
                        <TableCell>
                          <Badge variant={product.utilization > 70 ? "default" : "secondary"}>
                            {product.utilization}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    rentals: { label: "Rentals" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productsData.categoryPerformance}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="rentals"
                        label={({ category, percent }) => `${category} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {productsData.categoryPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Least Rented Products */}
          <Card>
            <CardHeader>
              <CardTitle>Underperforming Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Rentals</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Action Needed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.leastRented.map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.rentals}</TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.utilization}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Review Pricing</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Repeat Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersData.topCustomers.map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>
                          <Badge variant={customer.repeatRate > 70 ? "default" : "secondary"}>
                            {customer.repeatRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Customers" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customersData.customerSegments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="segment" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          {/* Operations KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On-Time Pickups</p>
                    <p className="text-2xl font-bold">{operationsData.onTimeMetrics.onTimePickups}%</p>
                  </div>
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On-Time Returns</p>
                    <p className="text-2xl font-bold">{operationsData.onTimeMetrics.onTimeReturns}%</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Late Days</p>
                    <p className="text-2xl font-bold">{operationsData.onTimeMetrics.avgLateDays}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fee Recovery</p>
                    <p className="text-2xl font-bold">{operationsData.onTimeMetrics.feeRecovery}%</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Late Returns List */}
          <Card>
            <CardHeader>
              <CardTitle>Late Returns with Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Days Late</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationsData.lateReturns.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{item.orderId}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.daysLate} days</TableCell>
                      <TableCell>{formatCurrency(item.fee)}</TableCell>
                      <TableCell>
                        <Badge variant={item.recovered ? "default" : "destructive"}>
                          {item.recovered ? "Recovered" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
