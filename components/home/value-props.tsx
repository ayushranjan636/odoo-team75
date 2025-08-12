import type React from "react"
import { mockValueProps } from "@/lib/mock-data"
import { Truck, Wrench, CalendarDays, SprayCan } from "lucide-react"

const IconMap: { [key: string]: React.ElementType } = {
  Truck: Truck,
  Wrench: Wrench,
  CalendarDays: CalendarDays,
  SprayCan: SprayCan,
}

export function ValueProps() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center font-inter">
          Why Choose Rentify?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockValueProps.map((prop, index) => {
            const IconComponent = IconMap[prop.icon]
            return (
              <div
                key={index}
                className="rounded-xl border border-[#E2E8F0] bg-surface shadow-[0_8px_24px_rgba(0,0,0,.06)] p-6 text-center space-y-4 transition-all duration-200 hover:shadow-lg"
              >
                {IconComponent && <IconComponent className="h-10 w-10 text-brand mx-auto" />}
                <h3 className="text-xl font-semibold text-foreground font-inter">{prop.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prop.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
