"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Tag, Truck, GraduationCap, Home, Clock } from "lucide-react"

const promoItems = [
  {
    code: "NEW10",
    description: "10% off on first month",
    icon: Tag,
  },
  {
    code: "FREESHIP",
    description: "Free delivery on orders above ₹999",
    icon: Truck,
  },
  {
    code: "WORKFROMHOME",
    description: "15% off on WFH packages",
    icon: Home,
  },
  {
    code: "STUDENT5",
    description: "Extra 5% for students",
    icon: GraduationCap,
  },
  {
    code: "LONGSTAY",
    description: "Save 20% on 6+ months",
    icon: Clock,
  },
]

export function PromoTicker() {
  const [isPaused, setIsPaused] = useState(false)

  const handleCodeClick = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Code ${code} copied to clipboard!`)
    })
  }

  return (
    <div className="bg-primary/8 border-b border-primary/10 overflow-hidden">
      <div
        className="flex items-center h-10 whitespace-nowrap"
        style={{
          animation: isPaused ? "none" : "marquee 30s linear infinite",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Duplicate the content for seamless loop */}
        {[...Array(3)].map((_, setIndex) => (
          <div key={setIndex} className="flex items-center">
            {promoItems.map((item, index) => {
              const IconComponent = item.icon
              return (
                <button
                  key={`${setIndex}-${index}`}
                  onClick={() => handleCodeClick(item.code)}
                  className="flex items-center gap-2 px-6 py-2 mx-4 bg-primary/10 hover:bg-primary/15 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group"
                  tabIndex={setIndex === 0 ? 0 : -1} // Only first set is focusable
                >
                  <IconComponent className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary text-sm">{item.code}</span>
                  <span className="text-foreground/80 text-sm">—</span>
                  <span className="text-foreground/70 text-sm">{item.description}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div[style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
