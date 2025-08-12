"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { format } from "date-fns"

interface WhatsAppQuickQuoteProps {
  product: {
    name: string
  }
  selectedTenure: "hour" | "day" | "week" | "month"
  dateRange: { from?: Date; to?: Date }
}

export function WhatsAppQuickQuote({ product, selectedTenure, dateRange }: WhatsAppQuickQuoteProps) {
  const prefilledMessage = encodeURIComponent(
    `Hi, I'm interested in renting "${product.name}" for ${selectedTenure} from ${
      dateRange.from ? format(dateRange.from, "PPP") : "a selected date"
    } to ${dateRange.to ? format(dateRange.to, "PPP") : "a selected date"}. Can you provide a quick quote?`,
  )
  const whatsappLink = `https://wa.me/+919876543210?text=${prefilledMessage}` // Replace with actual number

  return (
    <div className="mt-6">
      <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" prefetch={false}>
        <Button
          className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 text-lg font-semibold flex items-center justify-center gap-2 rounded-lg"
          aria-label="Get a quick quote on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp Quick Quote
        </Button>
      </Link>
    </div>
  )
}
