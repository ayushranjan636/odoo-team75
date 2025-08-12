"use client"

import { toast } from "sonner"

export function showComingSoonToast() {
  toast("Coming Soon!", {
    description: "This feature is under development. Stay tuned!",
    duration: 3000,
  })
}
