import { type Product, mockPricelists, type PricelistRule } from "@/lib/mock-data"
import { differenceInDays, differenceInHours, differenceInWeeks, differenceInMonths, parseISO } from "date-fns"

export type TenureType = "hour" | "day" | "week" | "month"

export function calculateRentalPrice(
  product: Product,
  tenureType: TenureType,
  startDate: Date,
  endDate: Date,
  pricelistName = "standard",
): { price: number; deposit: number } {
  const rule: PricelistRule = mockPricelists[pricelistName] || mockPricelists.standard

  let duration = 0
  switch (tenureType) {
    case "hour":
      duration = differenceInHours(endDate, startDate)
      break
    case "day":
      duration = differenceInDays(endDate, startDate)
      break
    case "week":
      duration = differenceInWeeks(endDate, startDate)
      break
    case "month":
      duration = differenceInMonths(endDate, startDate)
      break
    default:
      duration = 1 // Default to 1 unit if tenure type is unknown
  }

  if (duration <= 0) {
    duration = 1 // Ensure at least 1 unit for calculation
  }

  let pricePerUnit = 0
  switch (tenureType) {
    case "hour":
      pricePerUnit = product.salesPrice * rule.hourly
      break
    case "day":
      pricePerUnit = product.salesPrice * rule.daily
      break
    case "week":
      pricePerUnit = product.salesPrice * rule.weekly
      break
    case "month":
      pricePerUnit = product.salesPrice * rule.monthly
      break
  }

  let totalPrice = pricePerUnit * duration

  // Apply discounts (mocking simple application for now)
  if (rule.discounts && rule.discounts.length > 0) {
    rule.discounts.forEach((discount) => {
      if (discount.type === "percent") {
        totalPrice *= (100 - discount.value) / 100
      } else if (discount.type === "fixed") {
        totalPrice -= discount.value
      }
    })
  }

  // Ensure price doesn't go below zero
  totalPrice = Math.max(0, totalPrice)

  // Mock deposit (e.g., 10% of sales price, or a fixed minimum)
  const deposit = Math.max(500, product.salesPrice * 0.1)

  return { price: Math.round(totalPrice), deposit: Math.round(deposit) }
}

export function getBasePriceForTenure(product: Product, tenureType: TenureType, pricelistName = "standard"): number {
  const rule: PricelistRule = mockPricelists[pricelistName] || mockPricelists.standard
  let pricePerUnit = 0
  switch (tenureType) {
    case "hour":
      pricePerUnit = product.salesPrice * rule.hourly
      break
    case "day":
      pricePerUnit = product.salesPrice * rule.daily
      break
    case "week":
      pricePerUnit = product.salesPrice * rule.weekly
      break
    case "month":
      pricePerUnit = product.salesPrice * rule.monthly
      break
  }
  return Math.round(pricePerUnit)
}

export function getAvailabilityStatus(
  product: Product,
  reservations: { productId: string; startAt: string; endAt: string }[],
  selectedStartDate?: Date,
  selectedEndDate?: Date,
): "green" | "yellow" | "red" {
  if (product.qtyOnHand === 0) {
    return "red" // Out of stock
  }

  const productReservations = reservations.filter((res) => res.productId === product.id)

  if (!selectedStartDate || !selectedEndDate) {
    // If no specific dates selected, check for any current/future reservations
    const now = new Date()
    const hasActiveReservations = productReservations.some(
      (res) => parseISO(res.startAt) <= now && parseISO(res.endAt) >= now,
    )
    if (hasActiveReservations && product.qtyOnHand === 1) {
      return "yellow" // Only one item, and it's currently reserved
    }
    return "green" // Available generally
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
    return "red" // All units reserved for the selected period
  } else if (overlappingReservations.length > 0 && overlappingReservations.length < product.qtyOnHand) {
    return "yellow" // Some units reserved, but not all
  }

  return "green" // Fully available for the selected period
}
