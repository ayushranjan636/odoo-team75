"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function showCartToast(action: "added" | "updated", onViewCart?: () => void, onContinue?: () => void) {
  const message = action === "added" ? "Added to cart" : "Cart updated"

  toast.success(message, {
    action: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onViewCart?.()
            toast.dismiss()
          }}
        >
          View Cart
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onContinue?.()
            toast.dismiss()
          }}
        >
          Continue
        </Button>
      </div>
    ),
    duration: 4000,
  })
}
