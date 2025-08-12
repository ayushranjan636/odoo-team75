import { type NextRequest, NextResponse } from "next/server"

// Mock Razorpay for development
const createMockRazorpayOrder = (amount: number, currency: string, orderId: string) => {
  return {
    id: `order_${Date.now()}`,
    entity: "order",
    amount: amount,
    amount_paid: 0,
    amount_due: amount,
    currency: currency,
    receipt: `receipt_${orderId}`,
    status: "created",
    attempts: 0,
    notes: {
      orderId: orderId,
      createdAt: new Date().toISOString(),
    },
    created_at: Math.floor(Date.now() / 1000)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, orderId } = await request.json()

    // For development, use mock Razorpay
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.log("Using mock Razorpay for development")
      const mockOrder = createMockRazorpayOrder(amount, currency || "INR", orderId)
      return NextResponse.json(mockOrder)
    }

    // Real Razorpay integration (when credentials are available)
    const Razorpay = require("razorpay")
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const options = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: orderId,
        createdAt: new Date().toISOString(),
      },
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    
    // Fallback to mock order on error
    try {
      const { amount, currency, orderId } = await request.json()
      const mockOrder = createMockRazorpayOrder(amount, currency || "INR", orderId)
      return NextResponse.json(mockOrder)
    } catch (parseError) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
  }
}
