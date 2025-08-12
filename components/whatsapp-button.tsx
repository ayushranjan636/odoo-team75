import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  const prefilledMessage = encodeURIComponent("Hi, I'm interested in renting products. Can you help me?")
  const whatsappLink = `https://wa.me/+919876543210?text=${prefilledMessage}` // Replace with actual number

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" prefetch={false}>
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-[#25D366] hover:bg-[#1DA851] text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-8 w-8" />
          <span className="sr-only">Chat on WhatsApp</span>
        </Button>
      </Link>
    </div>
  )
}
