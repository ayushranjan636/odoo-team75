"use client"

import { useState } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useAddressStore } from "@/hooks/use-address-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Address } from "@/lib/types"
import { Plus, MapPin, Edit, Trash2, Star } from "lucide-react"
import { toast } from "sonner"

interface AddressFormData {
  name: string
  phone: string
  email: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  type: "home" | "office" | "other"
  isDefault: boolean
}

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void
  selectedAddressId?: string
}

export function AddressManager() {
  const { user } = useAuthStore()
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, getUserAddresses } = useAddressStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
    isDefault: false,
  })

  const userAddresses = user ? getUserAddresses(user.id) : []

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
      isDefault: false,
    })
  }

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!user) return

    if (!formData.name || !formData.phone || !formData.line1 || !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      if (editingAddress) {
        updateAddress(editingAddress.id, {
          ...formData,
          email: formData.email || user?.email || "",
        })
        toast.success("Address updated successfully")
        setIsEditDialogOpen(false)
      } else {
        addAddress({
          ...formData,
          userId: user?.id || "",
          email: formData.email || user?.email || "",
        })
        toast.success("Address added successfully")
        setIsAddDialogOpen(false)
      }

      resetForm()
      setEditingAddress(null)
    } catch (error) {
      toast.error("Failed to save address")
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      email: address.email,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
      isDefault: address.isDefault,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress(addressId)
      toast.success("Address deleted successfully")
    }
  }

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId)
    toast.success("Default address updated")
  }

  const AddressForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder={user?.primaryEmailAddress?.emailAddress || "Enter email"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="line1">Address Line 1 *</Label>
        <Input
          id="line1"
          value={formData.line1}
          onChange={(e) => handleInputChange("line1", e.target.value)}
          placeholder="House/Flat number, Building name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="line2">Address Line 2</Label>
        <Input
          id="line2"
          value={formData.line2}
          onChange={(e) => handleInputChange("line2", e.target.value)}
          placeholder="Area, Landmark (optional)"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="City"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="State"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleInputChange("pincode", e.target.value)}
            placeholder="123456"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address Type</Label>
        <Select value={formData.type} onValueChange={(value: "home" | "office" | "other") => handleInputChange("type", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => handleInputChange("isDefault", e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="isDefault">Set as default address</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {editingAddress ? "Update Address" : "Add Address"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            resetForm()
            setEditingAddress(null)
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>Add a new delivery address to your account</DialogDescription>
            </DialogHeader>
            <AddressForm />
          </DialogContent>
        </Dialog>
      </div>

      {userAddresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
            <p className="text-muted-foreground mb-4">Add an address to get started with delivery</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                  <DialogDescription>Add a new delivery address to your account</DialogDescription>
                </DialogHeader>
                <AddressForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {onAddressSelect && selectedAddressId ? (
            <RadioGroup value={selectedAddressId} onValueChange={(value) => {
              const address = userAddresses.find(addr => addr.id === value)
              if (address) onAddressSelect(address)
            }}>
              {userAddresses.map((address) => (
                <div key={address.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                  <AddressCard address={address} showRadio={false} />
                </div>
              ))}
            </RadioGroup>
          ) : (
            userAddresses.map((address) => (
              <AddressCard key={address.id} address={address} />
            ))
          )}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>Update your delivery address</DialogDescription>
          </DialogHeader>
          <AddressForm />
        </DialogContent>
      </Dialog>
    </div>
  )

  function AddressCard({ address, showRadio = true }: { address: Address, showRadio?: boolean }) {
    return (
      <Card className={`relative ${selectedAddressId === address.id ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{address.name}</h4>
                <Badge variant={address.type === 'home' ? 'default' : address.type === 'office' ? 'secondary' : 'outline'}>
                  {address.type}
                </Badge>
                {address.isDefault && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <p className="text-sm">
                {address.line1}
                {address.line2 && `, ${address.line2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
            <div className="flex gap-1">
              {!address.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(address.id)}
                  title="Set as default"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(address)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(address.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}
