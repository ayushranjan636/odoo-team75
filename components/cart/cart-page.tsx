"use client"

import { useState } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"
import { useCartStore } from "@/hooks/use-cart-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { CartItem } from "@/components/cart/cart-item"
import { EmptyCart } from "@/components/cart/empty-cart"
import { ShoppingBag, ArrowRight, Calculator, Zap } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const ensureDate = (date: Date | string): Date => {
  return date instanceof Date ? date : new Date(date)
}

export function CartPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { items, clearCart, getTotalPrice, createOdooQuotation } = useCartStore()
  const [isClearing, setIsClearing] = useState(false)
  const [quickQuoteOpen, setQuickQuoteOpen] = useState(false)
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Group items by delivery slot (date + time window)
  const groupedItems = items.reduce(
    (groups, item) => {
      const startDate = ensureDate(item.startDate)
      const endDate = ensureDate(item.endDate)
      const deliveryKey = `${startDate.toDateString()}-${endDate.toDateString()}`
      if (!groups[deliveryKey]) {
        groups[deliveryKey] = []
      }
      groups[deliveryKey].push({
        ...item,
        startDate,
        endDate,
      })
      return groups
    },
    {} as Record<string, typeof items>,
  )

  const subtotal = getTotalPrice()
  const totalDeposit = items.reduce((sum, item) => sum + item.deposit * item.qty, 0)
  const taxRate = 0.18 // 18% GST
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  const handleClearCart = async () => {
    setIsClearing(true)
    // Add a small delay for better UX
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 500)
  }

  const handleQuickQuotation = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast.error("Please fill in customer name and email")
      return
    }

    setIsCreatingQuotation(true)
    try {
      const result = await createOdooQuotation(customerInfo)
      if (result.odooStatus === "success") {
        toast.success(`Quotation ${result.id} created successfully in Odoo!`)
      } else {
        toast.warning(`Quotation created locally. Odoo sync failed.`)
      }
      setQuickQuoteOpen(false)
      setCustomerInfo({ name: "", email: "", phone: "" })
    } catch (error) {
      toast.error("Failed to create quotation")
      console.error(error)
    } finally {
      setIsCreatingQuotation(false)
    }
  }

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
            </h1>
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearing}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
            >
              {isClearing ? "Clearing..." : "Clear Cart"}
            </Button>
          </div>

          {/* Grouped Cart Items */}
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([deliveryKey, groupItems]) => {
              const firstItem = groupItems[0]
              const startDate = ensureDate(firstItem.startDate)
              const endDate = ensureDate(firstItem.endDate)
              const deliveryDate = startDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              const returnDate = endDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })

              return (
                <div key={deliveryKey} className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Delivery Slot</h3>
                    <p className="text-sm text-muted-foreground">
                      Delivery: {deliveryDate} • Return: {returnDate}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {groupItems.map((item) => (
                      <CartItem key={`${item.productId}-${ensureDate(item.startDate).getTime()}`} item={item} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Security Deposit</span>
                <span className="text-foreground">{formatCurrency(totalDeposit)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes & Fees (18% GST)</span>
                <span className="text-foreground">{formatCurrency(taxes)}</span>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between text-lg font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              <div className="text-xs text-muted-foreground mt-2">*Security deposit will be refunded after return</div>
            </div>

            <div className="space-y-3 mt-6">
              {isAuthenticated ? (
                <>
                  <Link href="/checkout" prefetch={false}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg font-semibold">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/quotation" prefetch={false}>
                      <Button variant="outline" className="w-full py-3 text-sm font-semibold bg-transparent">
                        <Calculator className="mr-2 h-4 w-4" />
                        Full Quote
                      </Button>
                    </Link>

                    <Dialog open={quickQuoteOpen} onOpenChange={setQuickQuoteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full py-3 text-sm font-semibold bg-transparent">
                          <Zap className="mr-2 h-4 w-4" />
                          Quick Quote
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Quick Quotation</DialogTitle>
                          <DialogDescription>
                            Create an instant Odoo quotation for your cart items
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="quick-name">Customer Name *</Label>
                            <Input
                              id="quick-name"
                              placeholder="Enter customer name"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quick-email">Email Address *</Label>
                            <Input
                              id="quick-email"
                              type="email"
                              placeholder="customer@example.com"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quick-phone">Phone Number</Label>
                            <Input
                              id="quick-phone"
                              placeholder="+91 98765 43210"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>
                          <Button
                            onClick={handleQuickQuotation}
                            disabled={isCreatingQuotation || !customerInfo.name || !customerInfo.email}
                            className="w-full"
                          >
                            {isCreatingQuotation ? "Creating..." : "Create Odoo Quotation"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg font-semibold">
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Sign In to Checkout
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button variant="outline" className="w-full py-3 text-lg font-semibold bg-transparent">
                      <Calculator className="mr-2 h-5 w-5" />
                      Sign In for Quotation
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/browse" prefetch={false}>
                <Button variant="outline" className="w-full py-3 text-lg font-semibold bg-transparent">
                  Continue Browsing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
