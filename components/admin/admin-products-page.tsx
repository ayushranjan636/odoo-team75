"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Plus, Upload, Edit, Trash2, Search, Grid3X3, List, Eye, Pause, Play } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  internalRef: string
  salesPrice: number
  costPrice: number
  qtyOnHand: number
  qtyForecasted: number
  rentable: boolean
  status: "active" | "inactive" | "maintenance"
  category: string
  image: string
  description: string
  sustainability: {
    co2New: number
    co2Reuse: number
    weightKg: number
    wasteFactor: number
    retailCost: number
  }
  pricingOverrides?: {
    hourly?: number
    daily?: number
    weekly?: number
    monthly?: number
  }
}

interface CSVMapping {
  name: string
  internalRef: string
  salesPrice: string
  costPrice: string
  qtyOnHand: string
  qtyForecasted: string
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvMapping, setCsvMapping] = useState<CSVMapping>({
    name: "",
    internalRef: "",
    salesPrice: "",
    costPrice: "",
    qtyOnHand: "",
    qtyForecasted: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRentable = async (productId: string, rentable: boolean) => {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentable }),
      })

      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, rentable } : p)))
      toast.success(`Product ${rentable ? "enabled" : "disabled"} for rental`)
    } catch (error) {
      toast.error("Failed to update product")
    }
  }

  const handleStatusToggle = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: newStatus as any } : p)))
      toast.success(`Product ${newStatus === "active" ? "activated" : "paused"}`)
    } catch (error) {
      toast.error("Failed to update product status")
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())
      const data = lines.slice(1, 6).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || ""
          return obj
        }, {} as any)
      })
      setCsvData(data)
      setIsImportModalOpen(true)
    }
    reader.readAsText(file)
  }

  const handleImportCSV = async () => {
    try {
      const mappedData = csvData.map((row) => ({
        name: row[csvMapping.name],
        internalRef: row[csvMapping.internalRef],
        salesPrice: Number.parseFloat(row[csvMapping.salesPrice]) || 0,
        costPrice: Number.parseFloat(row[csvMapping.costPrice]) || 0,
        qtyOnHand: Number.parseInt(row[csvMapping.qtyOnHand]) || 0,
        qtyForecasted: Number.parseInt(row[csvMapping.qtyForecasted]) || 0,
        rentable: true,
        status: "active",
        category: "General",
        sustainability: {
          co2New: 120,
          co2Reuse: 20,
          weightKg: 10,
          wasteFactor: 0.6,
          retailCost: Number.parseFloat(row[csvMapping.salesPrice]) || 0,
        },
      }))

      await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: mappedData }),
      })

      toast.success(`${mappedData.length} products imported successfully`)
      setIsImportModalOpen(false)
      setCsvFile(null)
      setCsvData([])
      fetchProducts()
    } catch (error) {
      toast.error("Failed to import products")
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.internalRef.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.qtyOnHand < 5) ||
      (stockFilter === "out" && product.qtyOnHand === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "maintenance":
        return "destructive"
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
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your rental inventory</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Appliances">Appliances</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stock Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock (&lt;5)</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Ref</TableHead>
                    <TableHead>Sales Price</TableHead>
                    <TableHead>On Hand</TableHead>
                    <TableHead>Forecasted</TableHead>
                    <TableHead>Rentable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.image || "/placeholder.svg?height=48&width=48"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.internalRef}</TableCell>
                      <TableCell>{formatCurrency(product.salesPrice)}</TableCell>
                      <TableCell>
                        <span className={product.qtyOnHand < 5 ? "text-destructive" : ""}>{product.qtyOnHand}</span>
                      </TableCell>
                      <TableCell>{product.qtyForecasted}</TableCell>
                      <TableCell>
                        <Switch
                          checked={product.rentable}
                          onCheckedChange={(checked) => handleToggleRentable(product.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(product.status)}>{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedProduct(product)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Edit Product - {product.name}</SheetTitle>
                              </SheetHeader>
                              {selectedProduct && (
                                <div className="mt-6">
                                  <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                      <TabsTrigger value="basic">Basic</TabsTrigger>
                                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                      <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
                                      <TabsTrigger value="availability">Availability</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Product Name</Label>
                                          <Input defaultValue={selectedProduct.name} />
                                        </div>
                                        <div>
                                          <Label>Internal Reference</Label>
                                          <Input defaultValue={selectedProduct.internalRef} />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Quantity On Hand</Label>
                                          <Input type="number" defaultValue={selectedProduct.qtyOnHand} />
                                        </div>
                                        <div>
                                          <Label>Forecasted Quantity</Label>
                                          <Input type="number" defaultValue={selectedProduct.qtyForecasted} />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Description</Label>
                                        <Textarea defaultValue={selectedProduct.description} />
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="pricing" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Sales Price</Label>
                                          <Input type="number" defaultValue={selectedProduct.salesPrice} />
                                        </div>
                                        <div>
                                          <Label>Cost Price</Label>
                                          <Input type="number" defaultValue={selectedProduct.costPrice} />
                                        </div>
                                      </div>
                                      <div className="space-y-3">
                                        <Label>Pricing Overrides</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm">Hourly Rate</Label>
                                            <Input type="number" placeholder="Auto-calculated" />
                                          </div>
                                          <div>
                                            <Label className="text-sm">Daily Rate</Label>
                                            <Input type="number" placeholder="Auto-calculated" />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm">Weekly Rate</Label>
                                            <Input type="number" placeholder="Auto-calculated" />
                                          </div>
                                          <div>
                                            <Label className="text-sm">Monthly Rate</Label>
                                            <Input type="number" placeholder="Auto-calculated" />
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="sustainability" className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>CO₂ New (kg)</Label>
                                          <Input
                                            type="number"
                                            defaultValue={selectedProduct.sustainability?.co2New || 120}
                                          />
                                        </div>
                                        <div>
                                          <Label>CO₂ Reuse (kg)</Label>
                                          <Input
                                            type="number"
                                            defaultValue={selectedProduct.sustainability?.co2Reuse || 20}
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Weight (kg)</Label>
                                          <Input
                                            type="number"
                                            defaultValue={selectedProduct.sustainability?.weightKg || 10}
                                          />
                                        </div>
                                        <div>
                                          <Label>Waste Factor</Label>
                                          <Input
                                            type="number"
                                            step="0.1"
                                            defaultValue={selectedProduct.sustainability?.wasteFactor || 0.6}
                                          />
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="availability" className="space-y-4">
                                      <div>
                                        <Label>Availability Calendar</Label>
                                        <div className="mt-2 p-4 border rounded-lg">
                                          <Calendar mode="multiple" className="rounded-md" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Select dates when this product is unavailable
                                        </p>
                                      </div>
                                    </TabsContent>
                                  </Tabs>

                                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Save Changes</Button>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusToggle(product.id, product.status)}
                          >
                            {product.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>

                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={product.image || "/placeholder.svg?height=200&width=200"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={getStatusColor(product.status)}>{product.status}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.internalRef}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{formatCurrency(product.salesPrice)}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.qtyOnHand}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <Switch
                    checked={product.rentable}
                    onCheckedChange={(checked) => handleToggleRentable(product.id, checked)}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleStatusToggle(product.id, product.status)}>
                      {product.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CSV Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Map CSV Columns</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(csvMapping).map(([field, value]) => (
                  <div key={field}>
                    <Label className="capitalize">{field.replace(/([A-Z])/g, " $1")}</Label>
                    <Select value={value} onValueChange={(val) => setCsvMapping((prev) => ({ ...prev, [field]: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvData.length > 0 &&
                          Object.keys(csvData[0]).map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {csvData.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Preview (First 5 rows)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Sales Price</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>On Hand</TableHead>
                        <TableHead>Forecasted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row[csvMapping.name]}</TableCell>
                          <TableCell>{row[csvMapping.internalRef]}</TableCell>
                          <TableCell>{row[csvMapping.salesPrice]}</TableCell>
                          <TableCell>{row[csvMapping.costPrice]}</TableCell>
                          <TableCell>{row[csvMapping.qtyOnHand]}</TableCell>
                          <TableCell>{row[csvMapping.qtyForecasted]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportCSV} disabled={!Object.values(csvMapping).every((v) => v)}>
                Import {csvData.length} Products
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
