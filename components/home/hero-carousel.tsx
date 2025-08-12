"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { mockHeroImages } from "@/lib/mock-data"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { useState, useEffect } from "react" // Import useState and useEffect

export function HeroCarousel() {
  const [mounted, setMounted] = useState(false) // State to track if component is mounted

  useEffect(() => {
    setMounted(true) // Set mounted to true after component mounts on the client
  }, [])

  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {mockHeroImages.map((image, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative w-full h-full">
                {mounted ? ( // Conditionally render Image only after mounting
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover object-center"
                  />
                ) : (
                  // Fallback div for server-side render or before hydration
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center text-center px-4 md:px-6">
                  <div className="max-w-4xl space-y-6 text-white animate-fade-in">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter font-sans">
                      Endless Options, One Rent
                    </h1>
                    <p className="text-lg md:text-xl leading-relaxed text-white/90">
                      Discover a world of possibilities with flexible rental plans for your home and lifestyle needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Link href="/browse" prefetch={false}>
                        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-6 text-lg font-semibold rounded-lg transition-colors duration-200">
                          Explore Rentals
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold rounded-lg transition-colors duration-200 bg-transparent"
                        onClick={showComingSoonToast} // Mock schedule consultation
                      >
                        Get a Free Consultation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white border-white hover:bg-white hover:text-primary" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white border-white hover:bg-white hover:text-primary" />
      </Carousel>
    </section>
  )
}
