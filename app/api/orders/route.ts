import { type NextRequest, NextResponse } from "next/server"
import { createOdooOrder, getOdooOrders } from "@/lib/odoo"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Create order in Odoo
    const order = await createOdooOrder(orderData)

    console.log("Order created:", order)

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const orders = await getOdooOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    // Return mock orders as fallback
    const mockOrders = [
    {
      id: "ORD-1234567890",
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      returnDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      total: 5000,
      items: [
        {
          name: "Premium Office Chair",
          image: "/placeholder.svg?height=400&width=400",
          qty: 1,
          tenureType: "week",
        },
        {
          name: "Standing Desk",
          image: "/placeholder.svg?height=400&width=400",
          qty: 1,
          tenureType: "week",
        },
      ],
      contactInfo: {
        name: "John Doe",
        phone: "+91 98765 43210",
        address: "123 Main Street, Bangalore, Karnataka 560001",
      },
    },
    {
      id: "ORD-0987654321",
      status: "picked-up",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      returnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      total: 3500,
      items: [
        {
          name: "Gaming Setup Package",
          image: "/placeholder.svg?height=400&width=400",
          qty: 1,
          tenureType: "week",
        },
      ],
      contactInfo: {
        name: "Jane Smith",
        phone: "+91 87654 32109",
        address: "456 Tech Park, Mumbai, Maharashtra 400001",
      },
    },
    {
      id: "ORD-1122334455",
      status: "due-return",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      deliveryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      returnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      total: 2800,
      items: [
        {
          name: "Fitness Equipment Set",
          image: "/placeholder.svg?height=400&width=400",
          qty: 1,
          tenureType: "month",
        },
      ],
      contactInfo: {
        name: "Mike Johnson",
        phone: "+91 76543 21098",
        address: "789 Fitness Street, Delhi, Delhi 110001",
      },
    },
    {
      id: "ORD-5566778899",
      status: "returned",
      paymentStatus: "paid",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      deliveryDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
      returnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      total: 4200,
      items: [
        {
          name: "Home Theater System",
          image: "/placeholder.svg?height=400&width=400",
          qty: 1,
          tenureType: "month",
        },
      ],
      contactInfo: {
        name: "Sarah Wilson",
        phone: "+91 65432 10987",
        address: "321 Entertainment Ave, Chennai, Tamil Nadu 600001",
      },
    },
  ]

  return NextResponse.json(mockOrders)
}
