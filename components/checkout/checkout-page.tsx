"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/hooks/use-cart-store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ContactAddressStep } from "@/components/checkout/contact-address-step"
import { DeliveryWindowStep } from "@/components/checkout/delivery-window-step"
import { PaymentStep } from "@/components/checkout/payment-step"
import { EmptyCart } from "@/components/cart/empty-cart"
import { ArrowLeft } from "lucide-react"
import type { ContactAddressForm, DeliveryWindowForm } from "@/lib/checkout-schemas"

export function CheckoutPage() {
  const router = useRouter()
  const { items } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [contactData, setContactData] = useState<ContactAddressForm | null>(null)
  const [deliveryData, setDeliveryData] = useState<DeliveryWindowForm | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  if (items.length === 0) {
    return <EmptyCart />
  }

  const steps = [
    { number: 1, title: "Contact & Address", completed: !!contactData },
    { number: 2, title: "Delivery & Return", completed: !!deliveryData },
    { number: 3, title: "Payment", completed: false },
  ]

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleContactSubmit = (data: ContactAddressForm) => {
    setContactData(data)
    handleNextStep()
  }

  const handleDeliverySubmit = (data: DeliveryWindowForm) => {
    setDeliveryData(data)
    // Generate a quote ID automatically and proceed to payment
    const generatedQuoteId = `quote-${Date.now()}`
    setQuoteId(generatedQuoteId)
    handleNextStep()
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Checkout</h1>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step.number === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.completed
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? "✓" : step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step.number === currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          {currentStep === 1 && <ContactAddressStep onSubmit={handleContactSubmit} initialData={contactData} />}

          {currentStep === 2 && (
            <DeliveryWindowStep
              onSubmit={handleDeliverySubmit}
              onBack={handlePrevStep}
              initialData={deliveryData}
              cartItems={items}
            />
          )}

          {currentStep === 3 && (
            <PaymentStep
              onBack={handlePrevStep}
              contactData={contactData!}
              deliveryData={deliveryData!}
              cartItems={items}
              quoteId={quoteId!}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStep > 1 && currentStep < 3 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevStep} className="bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
