import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    const orderId = params.id

    console.log(`Admin updating order ${orderId} with:`, updateData)

    // In a real application, this would update the database
    // For now, we'll simulate the update
    const updatedOrder = {
      id: orderId,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    console.log(`Order ${orderId} updated successfully by admin`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order ${orderId} updated successfully`
    })
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

    // Mock detailed order data for admin view
    const mockOrder = {
      id: orderId,
      customerId: 'anonymous',
      customerName: 'Customer Name',
      customerEmail: 'student@slate.com',
      status: 'confirmed',
      paymentStatus: 'paid',
      total: 12901.88,
      deposit: 4083.5,
      deliveryDate: "2025-08-14T18:30:00.000Z",
      returnDate: "2025-08-21T18:30:00.000Z",
      deliveryWindow: "9:00 AM - 6:00 PM",
      returnWindow: "9:00 AM - 6:00 PM",
      city: "Bangalore",
      items: [
        {
          productName: "Furniture Item 4",
          quantity: 1,
          pricePerUnit: 11433.8
        }
      ],
      contactInfo: {
        name: 'Customer Name',
        phone: '9012345670',
        email: 'student@slate.com',
        line1: 'Address Line 1',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '123456'
      },
      timeline: [
        {
          status: "Order Placed",
          timestamp: "2025-08-12T01:24:03.068Z",
          note: "Order created by customer"
        },
        {
          status: "Payment Confirmed",
          timestamp: "2025-08-12T01:25:00.000Z",
          note: "Payment verified via Razorpay"
        },
        {
          status: "Bill Generated",
          timestamp: "2025-08-12T01:25:30.000Z",
          note: "Invoice BILL-1754961848165 generated and sent"
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      billNumber: "BILL-1754961848165",
      razorpayPaymentId: "pay_demo_123456"
    }

    return NextResponse.json(mockOrder)
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error)
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
}
