import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "₹"): string {
  return `${currency}${amount.toLocaleString("en-IN")}`
}

export function formatDateRange(startDate: Date | undefined, endDate: Date | undefined): string {
  if (!startDate && !endDate) {
    return "Select Dates"
  }
  if (startDate && !endDate) {
    return format(startDate, "MMM dd, yyyy") + " -"
  }
  if (!startDate && endDate) {
    return "- " + format(endDate, "MMM dd, yyyy")
  }
  if (startDate && endDate) {
    if (format(startDate, "yyyy") === format(endDate, "yyyy")) {
      if (format(startDate, "MMM") === format(endDate, "MMM")) {
        return `${format(startDate, "MMM dd")} - ${format(endDate, "dd, yyyy")}`
      }
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`
    }
    return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
  }
  return ""
}

export function getAvailabilityColor(status: "green" | "yellow" | "red"): string {
  switch (status) {
    case "green":
      return "bg-green-500"
    case "yellow":
      return "bg-yellow-500"
    case "red":
      return "bg-red-500"
    default:
      return "bg-gray-400"
  }
}

export function getProductAvailability(
  product: { qtyOnHand: number; id: string },
  mockReservations: { productId: string; startAt: string; endAt: string }[],
  selectedStartDate?: Date,
  selectedEndDate?: Date,
) {
  if (product.qtyOnHand === 0) {
    return { status: "red", text: "Out of Stock" }
  }

  const productReservations = mockReservations.filter((res) => res.productId === product.id)

  if (!selectedStartDate || !selectedEndDate) {
    // If no specific dates selected, check for any current/future reservations
    const now = new Date()
    const hasActiveReservations = productReservations.some(
      (res) => parseISO(res.startAt) <= now && parseISO(res.endAt) >= now,
    )
    if (hasActiveReservations && product.qtyOnHand === 1) {
      return { status: "yellow", text: "Limited Availability" }
    }
    return { status: "green", text: "Available" }
  }

  // Check for overlap with selected dates
  const overlappingReservations = productReservations.filter((res) => {
    const resStart = parseISO(res.startAt)
    const resEnd = parseISO(res.endAt)
    return (
      (selectedStartDate < resEnd && selectedEndDate > resStart) ||
      (selectedStartDate.getTime() === resStart.getTime() && selectedEndDate.getTime() === resEnd.getTime())
    )
  })

  if (overlappingReservations.length >= product.qtyOnHand) {
    return { status: "red", text: "Fully Booked" }
  } else if (overlappingReservations.length > 0 && overlappingReservations.length < product.qtyOnHand) {
    return { status: "yellow", text: "Limited Availability" }
  }

  return { status: "green", text: "Available" }
}
