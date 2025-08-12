import { mockHowItWorksSteps } from "@/lib/mock-data"
import { ShoppingCart, CreditCard, Truck } from "lucide-react"
import type React from "react"

const IconMap: { [key: string]: React.ElementType } = {
  ShoppingCart: ShoppingCart,
  CreditCard: CreditCard,
  Truck: Truck,
}

export function HowItWorks() {
  return (
    <section className="py-12 md:py-16 bg-background">
      {" "}
      {/* Reduced padding */}
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground font-sans mb-8">How It Works</h2>{" "}
        {/* Reduced margin-bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockHowItWorksSteps.map((step, index) => {
            const IconComponent = IconMap[step.icon]
            return (
              <div
                key={index}
                className="rounded-xl border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,.06)] p-6 space-y-4 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
                  {IconComponent && <IconComponent className="h-8 w-8" />}
                </div>
                <h3 className="text-xl font-semibold text-foreground font-sans">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
