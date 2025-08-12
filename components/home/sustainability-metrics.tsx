"use client"

import { useState, useEffect } from "react"
import { mockSustainabilityData } from "@/lib/mock-data"
import { Leaf, IndianRupee, Recycle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { Button } from "@/components/ui/button" // Import Button for the toggle

// Simple counter animation hook
const useCountUp = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: DOMHighResTimeStamp | null = null
    const step = (timestamp: DOMHighResTimeStamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])

  return count
}

export function SustainabilityMetrics() {
  const [isGlobal, setIsGlobal] = useState(true) // Default to Global
  const data = mockSustainabilityData.global // For now, always use global mock data

  const co2Count = useCountUp(data.co2Saved)
  const moneyCount = useCountUp(data.moneySaved)
  const wasteCount = useCountUp(data.wasteAvoided)

  const handleMyImpactClick = () => {
    // Simulate login check
    const isLoggedIn = false // Replace with actual auth check
    if (!isLoggedIn) {
      showComingSoonToast() // "My impact" opens login if guest
      // In a real app: router.push('/login')
    } else {
      setIsGlobal(false)
    }
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      {" "}
      {/* Reduced padding */}
      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          {" "}
          {/* Reduced margin-bottom */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            {" "}
            {/* Reduced margin-bottom */}
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-foreground">Our Impact on Sustainability</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              Choosing reuse over new makes a measurable difference. Here’s ours so far:
            </p>
          </div>
          <div className="flex space-x-2 border border-border rounded-lg p-1 bg-card">
            
            
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <TooltipProvider>
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6 space-y-4 w-full h-[260px] flex flex-col items-center justify-between">
              <Leaf className="h-12 w-12 text-sustainability-green" />
              <h3 className="text-4xl font-bold font-sans text-foreground">{co2Count} kg</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground cursor-help">
                    CO₂ Emissions Saved <span className="text-xs">(By choosing reuse over new)</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
                  <p>Calculated as (CO₂ from new – CO₂ from rental reuse) × units rented.</p>
                </TooltipContent>
              </Tooltip>
              {/* Tiny 30-day sparkline placeholder */}
              <div className="h-2 w-4/5 bg-muted/20 rounded-full overflow-hidden mt-auto">
                <div className="h-full w-full bg-sustainability-green rounded-full" style={{ width: "70%" }} />{" "}
                {/* Mock sparkline */}
              </div>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6 space-y-4 w-full h-[260px] flex flex-col items-center justify-between">
              <IndianRupee className="h-12 w-12 text-sustainability-amber" />
              <h3 className="text-4xl font-bold font-sans text-foreground">₹{moneyCount}</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground cursor-help">
                    Money Saved by Customers <span className="text-xs">(Compared to buying new)</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
                  <p>Calculated as (Retail cost – Rental cost) × units rented.</p>
                </TooltipContent>
              </Tooltip>
              {/* Tiny 30-day sparkline placeholder */}
              <div className="h-2 w-4/5 bg-muted/20 rounded-full overflow-hidden mt-auto">
                <div className="h-full w-full bg-sustainability-amber rounded-full" style={{ width: "85%" }} />{" "}
                {/* Mock sparkline */}
              </div>
            </div>
          </TooltipProvider>

          <TooltipProvider>
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-6 space-y-4 w-full h-[260px] flex flex-col items-center justify-between">
              <Recycle className="h-12 w-12 text-sustainability-teal" />
              <h3 className="text-4xl font-bold font-sans text-foreground">{wasteCount} kg</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-muted-foreground cursor-help">
                    Waste Avoided <span className="text-xs">(Kept out of landfills)</span>
                  </p>
                </TooltipTrigger>
                <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
                  <p>Calculated as (Product weight × waste factor if discarded).</p>
                </TooltipContent>
              </Tooltip>
              {/* Tiny 30-day sparkline placeholder */}
              <div className="h-2 w-4/5 bg-muted/20 rounded-full overflow-hidden mt-auto">
                <div className="h-full w-full bg-sustainability-teal rounded-full" style={{ width: "60%" }} />{" "}
                {/* Mock sparkline */}
              </div>
            </div>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mt-8">Updated daily at 9:00 AM IST.</p>
      </div>
    </section>
  )
}
