"use client"

import { useState } from "react"
import { useAdminStore } from "@/hooks/use-admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DollarSign, 
  Pencil, 
  Calculator,
  TrendingUp,
  Package
} from "lucide-react"
import type { Product } from "@/hooks/use-admin-store"

export function AdminPricingComprehensive() {
  const { products, updateProduct } = useAdminStore()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false)
  const [pricingData, setPricingData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    deposit: 0
  })

  const openPricingDialog = (product: Product) => {
    setSelectedProduct(product)
    setPricingData({
      daily: product.pricing.daily,
      weekly: product.pricing.weekly,
      monthly: product.pricing.monthly,
      deposit: product.pricing.deposit
    })
    setIsPricingDialogOpen(true)
  }

  const handleUpdatePricing = async () => {
    if (!selectedProduct) return

    const result = await updateProduct(selectedProduct.id, {
      ...selectedProduct,
      pricing: pricingData,
      updatedAt: new Date().toISOString()
    })

    if (result.success) {
      toast.success("Pricing updated successfully!")
      setIsPricingDialogOpen(false)
      setSelectedProduct(null)
    } else {
      toast.error(result.error || "Failed to update pricing")
    }
  }

  // Calculate pricing recommendations based on daily rate
  const calculateRecommendedPricing = (dailyRate: number) => {
    return {
      daily: dailyRate,
      weekly: Math.round(dailyRate * 6), // 6 days rate for weekly (1 day discount)
      monthly: Math.round(dailyRate * 25), // 25 days rate for monthly (5 days discount)
      deposit: Math.round(dailyRate * 10) // 10 days worth as deposit
    }
  }

  const applyRecommendedPricing = () => {
    if (!selectedProduct) return
    const recommended = calculateRecommendedPricing(selectedProduct.pricing.daily || 100)
    setPricingData(recommended)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
        <p className="text-muted-foreground">Manage rental pricing for all products</p>
      </div>

      {/* Pricing Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Daily Rate</p>
                <p className="text-2xl font-bold">
                  ₹{Math.round(products.reduce((sum, p) => sum + p.pricing.daily, 0) / products.length || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Weekly Rate</p>
                <p className="text-2xl font-bold">
                  ₹{Math.round(products.reduce((sum, p) => sum + p.pricing.weekly, 0) / products.length || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Monthly Rate</p>
                <p className="text-2xl font-bold">
                  ₹{Math.round(products.reduce((sum, p) => sum + p.pricing.monthly, 0) / products.length || 0)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Product Pricing
          </CardTitle>
          <CardDescription>Manage rental rates for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Weekly Rate</TableHead>
                <TableHead>Monthly Rate</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">₹{product.pricing.daily}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600 font-medium">₹{product.pricing.weekly}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-purple-600 font-medium">₹{product.pricing.monthly}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-orange-600 font-medium">₹{product.pricing.deposit}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.availability.isAvailable ? "default" : "destructive"}>
                      {product.availability.isAvailable ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openPricingDialog(product)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Update Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Pricing</DialogTitle>
            <DialogDescription>
              Update rental rates for {selectedProduct?.name}. Changes will be synced with Odoo.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* Current Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Product Name</Label>
                      <p className="font-medium">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Daily Rate</Label>
                      <p className="font-medium">₹{selectedProduct.pricing.daily.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Stock</Label>
                      <p className="font-medium">{selectedProduct.availability.stock} units</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Recommended Pricing
                  </CardTitle>
                  <CardDescription>
                    Based on base price of ₹{selectedProduct.basePrice.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {(() => {
                      const recommended = calculateRecommendedPricing(selectedProduct.basePrice)
                      return (
                        <>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Daily</p>
                            <p className="text-lg font-bold text-green-600">₹{recommended.daily}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Weekly</p>
                            <p className="text-lg font-bold text-blue-600">₹{recommended.weekly}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Monthly</p>
                            <p className="text-lg font-bold text-purple-600">₹{recommended.monthly}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Deposit</p>
                            <p className="text-lg font-bold text-orange-600">₹{recommended.deposit}</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={applyRecommendedPricing} className="w-full">
                      Apply Recommended Pricing
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Pricing Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="daily">Daily Rate (₹)</Label>
                      <Input
                        id="daily"
                        type="number"
                        value={pricingData.daily}
                        onChange={(e) => setPricingData({...pricingData, daily: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weekly">Weekly Rate (₹)</Label>
                      <Input
                        id="weekly"
                        type="number"
                        value={pricingData.weekly}
                        onChange={(e) => setPricingData({...pricingData, weekly: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthly">Monthly Rate (₹)</Label>
                      <Input
                        id="monthly"
                        type="number"
                        value={pricingData.monthly}
                        onChange={(e) => setPricingData({...pricingData, monthly: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deposit">Security Deposit (₹)</Label>
                      <Input
                        id="deposit"
                        type="number"
                        value={pricingData.deposit}
                        onChange={(e) => setPricingData({...pricingData, deposit: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePricing}>Update Pricing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
