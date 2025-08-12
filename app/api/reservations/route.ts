import { type NextRequest, NextResponse } from "next/server"
import { createOdooReservation } from "@/lib/odoo"

export async function POST(request: NextRequest) {
  try {
    const reservationData = await request.json()

    // Create reservation in Odoo
    const reservation = await createOdooReservation(reservationData)

    console.log("Reservation created:", reservation)

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")
    const status = searchParams.get("status")

    // Mock reservations data - in real app, fetch from database
    let reservations = [
      {
        id: "RES-1234567890",
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
      },
    ]

    // Apply filters
    if (userId) {
      reservations = reservations.filter((r) => r.userId === userId)
    }
    if (productId) {
      reservations = reservations.filter((r) => r.productId === productId)
    }
    if (status) {
      reservations = reservations.filter((r) => r.status === status)
    }

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}
