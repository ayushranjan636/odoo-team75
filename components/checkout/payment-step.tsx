"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Shield, CheckCircle, Smartphone, Building2, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/hooks/use-cart-store"
import { apiClient } from "@/lib/api"
import { ApiStatusBanner } from "@/components/ui/api-status-banner"
import { useToast } from "@/hooks/use-toast"
import type { ContactAddressForm, DeliveryWindowForm } from "@/lib/checkout-schemas"

interface PaymentStepProps {
  onBack: () => void
  contactData: ContactAddressForm
  deliveryData: DeliveryWindowForm
  cartItems: CartItem[]
  quoteId?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentStep({ onBack, contactData, deliveryData, cartItems, quoteId }: PaymentStepProps) {
  const router = useRouter()
  const { clearCart } = useCartStore()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const subtotal = cartItems.reduce((sum, item) => sum + item.pricePerUnit * item.qty, 0)
  const totalDeposit = cartItems.reduce((sum, item) => sum + item.deposit * item.qty, 0)
  const taxRate = 0.18 // 18% GST
  const taxes = subtotal * taxRate
  const total = subtotal + taxes

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const createRazorpayOrder = async (orderData: any) => {
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Amount in paise
          currency: "INR",
          orderId: orderData.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Razorpay order")
      }

      const razorpayOrder = await response.json()
      return razorpayOrder.id
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      // Fallback to mock order ID for demo
      return `order_${Date.now()}`
    }
  }

  const handleRazorpayPayment = async (orderData: any) => {
    const scriptLoaded = await loadRazorpayScript()

    if (!scriptLoaded) {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please check your internet connection and try again.",
        variant: "destructive",
      })
      return false
    }

    try {
      const razorpayOrderId = await createRazorpayOrder(orderData)

      const options = {
        key: "rzp_test_1Qk9VgOcz26k1H", // Your Razorpay test key
        amount: Math.round(total * 100), // Amount in paise
        currency: "INR",
        name: "RentKaro",
        description: `Rental Order - ${cartItems.length} items`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            setIsProcessing(true)
            // Verify payment on backend
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.id,
              }),
            })

            const verifyResult = await verifyResponse.json()

            if (verifyResponse.ok && verifyResult.success) {
              // Create reservations for all cart items
              for (const item of cartItems) {
                const reservationResponse = await apiClient.createReservation({
                  productId: item.productId,
                  orderId: orderData.id,
                  startAt: item.startDate.toISOString(),
                  endAt: item.endDate.toISOString(),
                  qty: item.qty,
                  status: "reserved",
                  price: item.pricePerUnit,
                  deposit: item.deposit,
                })

                if (reservationResponse.error) {
                  console.error("Failed to create reservation:", reservationResponse.error)
                }
              }

              // Update order status
              await apiClient.updateOrder(orderData.id, {
                paymentStatus: "paid",
                status: "confirmed",
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              })

              // Clear cart and redirect
              clearCart()
              toast({
                title: "Payment Successful!",
                description: "Your rental order has been confirmed. You'll receive a confirmation email shortly.",
              })
              router.push(`/orders?success=true&orderId=${orderData.id}`)
            } else {
              throw new Error(verifyResult.message || "Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast({
              title: "Payment Verification Failed",
              description:
                "Your payment was processed but verification failed. Please contact support if amount was deducted.",
              variant: "destructive",
            })
            setIsProcessing(false)
          }
        },
        prefill: {
          name: contactData.name,
          email: contactData.email,
          contact: contactData.phone,
        },
        notes: {
          address: `${contactData.address}, ${contactData.city} - ${contactData.pincode}`,
          quoteId: quoteId || "N/A",
        },
        theme: {
          color: "#0D9488", // Teal color matching the brand
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast({
              title: "Payment Cancelled",
              description: "You can retry the payment anytime.",
              variant: "default",
            })
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        toast({
          title: "Payment Failed",
          description: `${response.error.description}. Please try again.`,
          variant: "destructive",
        })
        setIsProcessing(false)
      })

      paymentObject.open()
      return true
    } catch (error) {
      console.error("Error initializing Razorpay payment:", error)
      toast({
        title: "Payment Initialization Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setApiError(null)

    try {
      // Create order first
      const orderData = {
        userId: "anonymous", // In real app, get from auth
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          pricePerUnit: item.pricePerUnit,
          qty: item.qty,
          startAt: item.startDate.toISOString(),
          endAt: item.endDate.toISOString(),
        })),
        total,
        deposit: totalDeposit,
        address: {
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          line1: contactData.address,
          city: contactData.city,
          state: "Karnataka", // Would be selected in form
          pincode: contactData.pincode,
        },
        deliveryMethod: `${deliveryData.deliveryDate.toLocaleDateString()} ${deliveryData.deliveryTimeSlot}`,
        returnMethod: `${deliveryData.returnDate.toLocaleDateString()} ${deliveryData.returnTimeSlot}`,
        paymentStatus: "pending",
        status: "quotation",
        quoteId: quoteId || null,
      }

      const orderResponse = await apiClient.createOrder(orderData)

      if (orderResponse.error) {
        setApiError(orderResponse.error)
        return
      }

      if (!orderResponse.data) {
        setApiError("Failed to create order")
        return
      }

      const order = orderResponse.data

      // Handle different payment methods
      if (paymentMethod === "razorpay") {
        const paymentSuccess = await handleRazorpayPayment(order)
        if (!paymentSuccess) {
          setIsProcessing(false)
          return
        }
      } else {
        // For demo purposes, simulate other payment methods
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Create reservations
        for (const item of cartItems) {
          const reservationResponse = await apiClient.createReservation({
            productId: item.productId,
            orderId: order.id,
            startAt: item.startDate.toISOString(),
            endAt: item.endDate.toISOString(),
            qty: item.qty,
            status: "reserved",
            price: item.pricePerUnit,
            deposit: item.deposit,
          })

          if (reservationResponse.error) {
            console.error("Failed to create reservation:", reservationResponse.error)
          }
        }

        // Update order status
        await apiClient.updateOrder(order.id, {
          paymentStatus: "paid",
          status: "confirmed",
        })

        clearCart()
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed.",
        })
        router.push(`/orders?success=true&orderId=${order.id}`)
      }
    } catch (error) {
      console.error("Payment failed:", error)
      setApiError("Payment processing failed. Please try again.")
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      })
    } finally {
      if (paymentMethod !== "razorpay") {
        setIsProcessing(false)
      }
    }
  }

  const handleRetryPayment = () => {
    setRetryCount((prev) => prev + 1)
    setApiError(null)
    handlePayment()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Payment</h2>
        <p className="text-muted-foreground">Review your order and complete the payment securely.</p>
      </div>

      {apiError && (
        <div className="mb-6">
          <ApiStatusBanner
            endpoint="/api/orders"
            method="POST"
            samplePayload={{ items: cartItems, total, contactData, deliveryData }}
            onDismiss={() => setApiError(null)}
          />
          {retryCount < 3 && (
            <Button
              variant="outline"
              onClick={handleRetryPayment}
              className="mt-3 bg-transparent"
              disabled={isProcessing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Payment
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.startDate.getTime()}`} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-muted-foreground">
                      Qty: {item.qty} • {item.tenureType} rental
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{formatCurrency(item.pricePerUnit * item.qty)}</div>
                    <div className="text-xs text-muted-foreground">
                      + {formatCurrency(item.deposit * item.qty)} deposit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
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
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-foreground">Total Amount</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="text-xs text-muted-foreground">*Security deposit will be refunded after return</div>
          </div>
        </div>

        {/* Payment Method & Delivery Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-2 p-4 border-2 border-primary rounded-lg bg-primary/5">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        MC
                      </div>
                      <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        UPI
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Razorpay Secure</div>
                    <div className="text-sm text-muted-foreground">Cards, UPI, Net Banking, Wallets</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg opacity-60">
                <RadioGroupItem value="upi" id="upi" disabled />
                <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-muted-foreground">UPI Direct</div>
                    <div className="text-sm text-muted-foreground">Coming Soon</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg opacity-60">
                <RadioGroupItem value="netbanking" id="netbanking" disabled />
                <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-muted-foreground">Net Banking</div>
                    <div className="text-sm text-muted-foreground">Coming Soon</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-700">
                256-bit SSL encrypted • PCI DSS compliant • Secure payments by Razorpay
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Information</h3>
            <div className="bg-muted/10 p-4 rounded-lg space-y-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Contact:</span>
                <span className="ml-2 text-muted-foreground">
                  {contactData.name} • {contactData.phone}
                </span>
              </div>
              <div>
                <span className="font-medium text-foreground">Email:</span>
                <span className="ml-2 text-muted-foreground">{contactData.email}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Address:</span>
                <span className="ml-2 text-muted-foreground">
                  {contactData.address}, {contactData.city} - {contactData.pincode}
                </span>
              </div>
              <Separator />
              <div>
                <span className="font-medium text-foreground">Delivery:</span>
                <span className="ml-2 text-muted-foreground">
                  {deliveryData.deliveryDate.toLocaleDateString()} •{" "}
                  {deliveryData.deliveryTimeSlot.replace("-", ":00 - ")}:00
                </span>
              </div>
              <div>
                <span className="font-medium text-foreground">Return:</span>
                <span className="ml-2 text-muted-foreground">
                  {deliveryData.returnDate.toLocaleDateString()} • {deliveryData.returnTimeSlot.replace("-", ":00 - ")}
                  :00
                </span>
              </div>
              {quoteId && (
                <div>
                  <span className="font-medium text-foreground">Quote ID:</span>
                  <span className="ml-2 text-muted-foreground">{quoteId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onBack} className="bg-transparent" disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? (
            "Processing Payment..."
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay {formatCurrency(total)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
