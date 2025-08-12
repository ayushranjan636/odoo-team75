import { type NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, orderId } = await request.json()

    const options = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: orderId,
        createdAt: new Date().toISOString(),
      },
    }

    const razorpayOrder = await razorpay.orders.create(options)

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}
