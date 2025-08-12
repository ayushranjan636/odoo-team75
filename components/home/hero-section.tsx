import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative w-full py-24 md:py-32 lg:py-48 bg-gradient-to-r from-brand to-blue-700 text-white overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter font-inter">
            Rent Everything You Need, Flexibly.
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-blue-100">
            From furniture to electronics, get quality products on rent with easy terms and free maintenance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/browse" prefetch={false}>
              <Button className="bg-accent text-white hover:bg-accent/90 px-8 py-6 text-lg font-semibold rounded-lg transition-colors duration-200">
                Explore Rentals
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-brand px-8 py-6 text-lg font-semibold rounded-lg transition-colors duration-200 bg-transparent"
            >
              Schedule a Free Consultation
            </Button>
          </div>
        </div>
      </div>
      {/* Abstract background pattern */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="/placeholder.svg?height=800&width=1600"
          alt="Background pattern"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}
