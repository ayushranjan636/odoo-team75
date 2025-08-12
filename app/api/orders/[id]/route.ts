import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for orders (in production, this would be a database)
let orders: any[] = []

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const orderId = params.id

    console.log(`Updating order ${orderId} with:`, updateData)

    // For now, we'll simulate the update
    // In production, this would update the database
    const updatedOrder = {
      id: orderId,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    console.log(`Order ${orderId} updated successfully`)

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Mock order data for development
    const mockOrder = {
      id: orderId,
      userId: 'anonymous',
      status: 'confirmed',
      paymentStatus: 'paid',
      total: 12901.884000000002,
      deposit: 4083.5,
      items: [
        {
          productId: 'prod-4',
          name: 'Furniture Item 4',
          image: '/placeholder.svg?height=400&width=400&query=Furniture%20Item%204',
          pricePerUnit: 11433.800000000001,
          qty: 1,
          startAt: '2025-08-14T18:30:00.000Z',
          endAt: '2025-08-14T18:30:00.000Z'
        }
      ],
      address: {
        name: 'Customer Name',
        phone: '9012345670',
        email: 'student@slate.com',
        line1: 'Address Line 1',
        city: 'City',
        state: 'Karnataka',
        pincode: '123456'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockOrder)
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error)
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
}
