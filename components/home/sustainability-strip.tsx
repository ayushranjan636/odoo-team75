"use client"

import { useState, useEffect } from "react"
import { mockSustainabilityData } from "@/lib/mock-data"
import { Leaf, IndianRupee, Recycle } from "lucide-react"

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

export function SustainabilityStrip() {
  const [isGlobal, setIsGlobal] = useState(true)
  const data = isGlobal ? mockSustainabilityData.global : mockSustainabilityData.myImpact // MyImpact would be auth-gated

  const co2Count = useCountUp(data.co2Saved)
  const moneyCount = useCountUp(data.moneySaved)
  const wasteCount = useCountUp(data.wasteAvoided)

  return (
    <section className="py-16 md:py-24 bg-brand text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-inter mb-4 md:mb-0">Our Impact on Sustainability</h2>
          <div className="flex space-x-2 border border-white/50 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isGlobal ? "bg-white text-brand" : "text-white hover:bg-white/20"
              }`}
              onClick={() => setIsGlobal(true)}
            >
              Global
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isGlobal ? "bg-white text-brand" : "text-white hover:bg-white/20"
              }`}
              onClick={() => setIsGlobal(false)}
              // In a real app, this would be disabled if not authenticated
            >
              My Impact
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/30 bg-white/10 p-6 text-center space-y-3 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
            <Leaf className="h-10 w-10 text-accent mx-auto" />
            <h3 className="text-3xl font-bold font-inter">{co2Count} kg</h3>
            <p className="text-sm text-blue-100">CO₂ Saved</p>
            {/* Tiny sparkline placeholder */}
            <div className="h-8 w-full bg-blue-200/20 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-accent rounded-full" /> {/* Mock sparkline */}
            </div>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/10 p-6 text-center space-y-3 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
            <IndianRupee className="h-10 w-10 text-accent-secondary mx-auto" />
            <h3 className="text-3xl font-bold font-inter">₹{moneyCount}</h3>
            <p className="text-sm text-blue-100">Money Saved</p>
            {/* Tiny sparkline placeholder */}
            <div className="h-8 w-full bg-blue-200/20 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-accent-secondary rounded-full" /> {/* Mock sparkline */}
            </div>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/10 p-6 text-center space-y-3 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
            <Recycle className="h-10 w-10 text-accent mx-auto" />
            <h3 className="text-3xl font-bold font-inter">{wasteCount} kg</h3>
            <p className="text-sm text-blue-100">Waste Avoided</p>
            {/* Tiny sparkline placeholder */}
            <div className="h-8 w-full bg-blue-200/20 rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-accent rounded-full" /> {/* Mock sparkline */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
