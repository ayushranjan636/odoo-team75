import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updateData = await request.json()

    // Mock reservation update - in real app, update database
    const updatedReservation = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    // Handle different status transitions
    switch (updateData.status) {
      case "picked_up":
        // Move stock to "with customer"
        console.log(`Reservation ${id} marked as picked up - stock moved to customer`)
        break

      case "returned":
        // Free stock and compute deposit refund
        const depositRefund = calculateDepositRefund(updatedReservation)
        console.log(`Reservation ${id} returned - stock freed, deposit refund: ${depositRefund}`)
        break

      case "late":
        // Apply late fees
        const lateFee = calculateLateFee(updatedReservation)
        console.log(`Reservation ${id} marked late - fee applied: ${lateFee}`)
        break

      case "extended":
        // Handle rental extension
        console.log(`Reservation ${id} extended to ${updateData.endAt}`)
        break
    }

    return NextResponse.json(updatedReservation)
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}

function calculateDepositRefund(reservation: any): number {
  // Mock deposit refund calculation
  // In real app, check for damages, late fees, etc.
  const baseRefund = reservation.deposit || 0
  const deductions = 0 // Mock: no deductions
  return Math.max(0, baseRefund - deductions)
}

function calculateLateFee(reservation: any): number {
  // Mock late fee calculation based on policy
  const graceDays = 1 // From settings
  const feePerDay = 100 // From settings

  const endDate = new Date(reservation.endAt)
  const currentDate = new Date()
  const daysLate = Math.max(
    0,
    Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) - graceDays,
  )

  return daysLate * feePerDay
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock single reservation fetch
    const reservation = {
      id,
      userId: "user-001",
      productId: "furn-sofa",
      orderId: "ORD-1234567890",
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      qty: 1,
      status: "reserved" as const,
      price: 1500,
      deposit: 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 })
  }
}
