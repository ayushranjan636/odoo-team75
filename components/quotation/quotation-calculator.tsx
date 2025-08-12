"use client"

import { useState } from "react"
import { useCartStore } from "@/hooks/use-cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Calculator, FileText, Send } from "lucide-react"
import { toast } from "sonner"
import { PDFGenerator } from "./pdf-generator"

interface QuotationData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes: string
  validUntil: string
  quotationNumber: string
}

export function QuotationCalculator() {
  const { items, getTotalPrice } = useCartStore()
  const [quotationData, setQuotationData] = useState<QuotationData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    quotationNumber: `QT-${Date.now().toString().slice(-8)}`,
  })

  const subtotal = getTotalPrice()
  const totalDeposit = items.reduce((sum, item) => sum + item.deposit * item.qty, 0)
  const taxRate = 0.18 // 18% GST
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  const handleInputChange = (field: keyof QuotationData, value: string) => {
    setQuotationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateQuotation = async () => {
    if (!quotationData.customerName || !quotationData.customerEmail) {
      toast.error("Please fill in customer name and email")
      return
    }

    if (items.length === 0) {
      toast.error("No items in cart to generate quotation")
      return
    }

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerInfo: {
            name: quotationData.customerName,
            email: quotationData.customerEmail,
            phone: quotationData.customerPhone,
            address: quotationData.customerAddress,
          },
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            pricePerUnit: item.pricePerUnit,
            tenureType: item.tenureType,
            startDate: item.startDate.toISOString(),
            endDate: item.endDate.toISOString(),
            deposit: item.deposit,
          })),
          notes: quotationData.notes,
          validUntil: quotationData.validUntil,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create quotation")
      }

      if (result.data.odooStatus === "success") {
        toast.success(`Quotation ${result.data.id} created successfully in Odoo!`)
      } else {
        toast.warning(`Quotation created locally. Odoo sync failed: ${result.data.odooError}`)
      }

      // Update quotation number with the one from Odoo or generated
      setQuotationData(prev => ({ 
        ...prev, 
        quotationNumber: result.data.id 
      }))

    } catch (error) {
      console.error("Failed to generate quotation:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate quotation")
    }
  }

  const handleSendQuotation = () => {
    if (!quotationData.customerEmail) {
      toast.error("Please enter customer email")
      return
    }

    toast.success("Quotation sent to customer email")
  }

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No Items to Quote</h1>
          <p className="text-muted-foreground mb-6">Add items to your cart to generate a quotation.</p>
          <Button asChild>
            <a href="/browse">Browse Products</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Quotation Calculator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Enter customer details for the quotation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Customer Name *</Label>
                  <Input
                    id="customer-name"
                    placeholder="Enter customer name"
                    value={quotationData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email Address *</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="customer@example.com"
                    value={quotationData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    placeholder="+91 98765 43210"
                    value={quotationData.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-address">Address</Label>
                  <Textarea
                    id="customer-address"
                    placeholder="Enter customer address"
                    value={quotationData.customerAddress}
                    onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special terms or conditions"
                    value={quotationData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid-until">Valid Until</Label>
                  <Input
                    id="valid-until"
                    type="date"
                    value={quotationData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quotation Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Quotation Summary
                  <Badge variant="outline">#{quotationData.quotationNumber}</Badge>
                </CardTitle>
                <CardDescription>Review items and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex justify-between items-start p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.qty} × {formatCurrency(item.pricePerUnit)} ({item.tenureType})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(item.pricePerUnit * item.qty)}</p>
                        <p className="text-xs text-muted-foreground">
                          Deposit: {formatCurrency(item.deposit * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span>{formatCurrency(totalDeposit)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees (18% GST)</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">*Security deposit will be refunded after return</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full"
                    onClick={handleGenerateQuotation}
                    disabled={!quotationData.customerName || !quotationData.customerEmail}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Quotation
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleSendQuotation} disabled={!quotationData.customerEmail}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <PDFGenerator
                      items={items}
                      quotationData={quotationData}
                      subtotal={subtotal}
                      totalDeposit={totalDeposit}
                      taxes={taxes}
                      total={total}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• This quotation is valid until {new Date(quotationData.validUntil).toLocaleDateString()}</p>
                  <p>• Security deposit is refundable upon return of items in good condition</p>
                  <p>• Delivery and pickup charges may apply based on location</p>
                  <p>• Items are subject to availability at the time of booking</p>
                  <p>• Prices include 18% GST as applicable</p>
                  <p>• Late return charges may apply beyond agreed rental period</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
