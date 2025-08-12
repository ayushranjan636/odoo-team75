"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { CartItem } from "@/hooks/use-cart-store"
import type { ContactAddressForm, DeliveryWindowForm } from "@/lib/checkout-schemas"

interface QuotationStepProps {
  onBack: () => void
  onProceed: (quoteId: string) => void
  contactData: ContactAddressForm
  deliveryData: DeliveryWindowForm
  cartItems: CartItem[]
}

interface Quote {
  id: string
  items: any[]
  address: any
  deliveryMethod: string
  coupon?: string
  subtotal: number
  deliveryCharge: number
  taxes: number
  discount: number
  total: number
  createdAt: string
  expiresAt: string
  pdfUrl: string
}

export function QuotationStep({ onBack, onProceed, contactData, deliveryData, cartItems }: QuotationStepProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQuote = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            pricePerUnit: item.pricePerUnit,
            tenureType: item.tenureType,
            startDate: item.startDate.toISOString(),
            endDate: item.endDate.toISOString(),
            deposit: item.deposit,
          })),
          address: contactData,
          deliveryMethod: deliveryData.deliveryMethod,
          coupon: deliveryData.coupon,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      setQuote(result.data)
      toast.success("Quotation generated successfully!")
    } catch (error) {
      console.error("Error generating quote:", error)
      setError("Failed to generate quotation")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQuote = () => {
    if (quote?.pdfUrl) {
      window.open(quote.pdfUrl, "_blank")
      toast.success("Quotation downloaded!")
    }
  }

  const handleProceedToPayment = () => {
    if (quote) {
      onProceed(quote.id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Quotation</h2>
        <p className="text-muted-foreground">Generate and review your rental quotation before proceeding to payment.</p>
      </div>

      {!quote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Quotation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Click below to generate your rental quotation with all the details you've provided.
            </p>
            <Button onClick={generateQuote} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Quotation"}
            </Button>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {quote && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quotation #{quote.id}</span>
                <Button variant="outline" onClick={handleDownloadQuote}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Generated:</span>
                  <p className="font-medium">{new Date(quote.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>
                  <p className="font-medium">{new Date(quote.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Items</h4>
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.qty} × {formatCurrency(item.pricePerUnit)} ({item.tenureType})
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.pricePerUnit * item.qty)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>{formatCurrency(quote.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (18% GST):</span>
                  <span>{formatCurrency(quote.taxes)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(quote.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} className="bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Delivery
            </Button>
            <Button onClick={handleProceedToPayment}>Proceed to Payment</Button>
          </div>
        </div>
      )}

      {!quote && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack} className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Delivery
          </Button>
        </div>
      )}
    </div>
  )
}
