"use client"

import { useState } from "react"
import { useAdminStore } from "@/hooks/use-admin-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  Package,
  Search,
  Filter,
  ExternalLink
} from "lucide-react"
import type { Product } from "@/hooks/use-admin-store"

export function AdminProductsComprehensive() {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    fetchProducts 
  } = useAdminStore()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    basePrice: 0,
    specifications: {},
    images: [],
    availability: {
      isAvailable: true,
      stock: 1,
      locations: []
    },
    pricing: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      deposit: 0
    }
  })

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)))

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || newProduct.basePrice <= 0) {
      toast.error("Please fill in all required fields")
      return
    }

    const result = await addProduct({
      ...newProduct,
      id: `prod-${Date.now()}`,
      slug: newProduct.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    if (result.success) {
      toast.success("Product added successfully!")
      setIsAddDialogOpen(false)
      setNewProduct({
        name: "",
        description: "",
        category: "",
        basePrice: 0,
        specifications: {},
        images: [],
        availability: {
          isAvailable: true,
          stock: 1,
          locations: []
        },
        pricing: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          deposit: 0
        }
      })
    } else {
      toast.error(result.error || "Failed to add product")
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return

    const result = await updateProduct(editingProduct.id, {
      ...editingProduct,
      updatedAt: new Date().toISOString()
    })

    if (result.success) {
      toast.success("Product updated successfully!")
      setIsEditDialogOpen(false)
      setEditingProduct(null)
    } else {
      toast.error(result.error || "Failed to update product")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const result = await deleteProduct(productId)

    if (result.success) {
      toast.success("Product deleted successfully!")
    } else {
      toast.error(result.error || "Failed to delete product")
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct({ ...product })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your rental inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for your rental inventory. It will be synced with Odoo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name *</Label>
                <Input 
                  id="name" 
                  className="col-span-3"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category *</Label>
                <Select onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="basePrice" className="text-right">Base Price *</Label>
                <Input 
                  id="basePrice" 
                  type="number" 
                  className="col-span-3"
                  value={newProduct.basePrice}
                  onChange={(e) => setNewProduct({...newProduct, basePrice: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  className="col-span-3"
                  value={newProduct.availability.stock}
                  onChange={(e) => setNewProduct({
                    ...newProduct, 
                    availability: {
                      ...newProduct.availability, 
                      stock: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea 
                  id="description" 
                  className="col-span-3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Available</Label>
                <Switch 
                  checked={newProduct.availability.isAvailable}
                  onCheckedChange={(checked) => setNewProduct({
                    ...newProduct,
                    availability: {
                      ...newProduct.availability,
                      isAvailable: checked
                    }
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Odoo Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{product.basePrice}</TableCell>
                  <TableCell>{product.availability.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.availability.isAvailable ? "default" : "destructive"}>
                      {product.availability.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Synced
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Changes will be synced with Odoo.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name *</Label>
                <Input 
                  id="edit-name" 
                  className="col-span-3"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-basePrice" className="text-right">Base Price *</Label>
                <Input 
                  id="edit-basePrice" 
                  type="number" 
                  className="col-span-3"
                  value={editingProduct.basePrice}
                  onChange={(e) => setEditingProduct({...editingProduct, basePrice: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  className="col-span-3"
                  value={editingProduct.availability.stock}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct, 
                    availability: {
                      ...editingProduct.availability, 
                      stock: Number(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea 
                  id="edit-description" 
                  className="col-span-3"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Available</Label>
                <Switch 
                  checked={editingProduct.availability.isAvailable}
                  onCheckedChange={(checked) => setEditingProduct({
                    ...editingProduct,
                    availability: {
                      ...editingProduct.availability,
                      isAvailable: checked
                    }
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
