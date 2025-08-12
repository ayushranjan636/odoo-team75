import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json()

    // For development, always verify as successful if no secret is provided
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.log("Using mock payment verification for development")
      console.log("Payment verified for order:", orderId)
      
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully (mock)",
        paymentId: razorpay_payment_id || `pay_${Date.now()}`,
        orderId: razorpay_order_id || `order_${Date.now()}`
      })
    }

    // Real verification with Razorpay
    const crypto = require("crypto")
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      console.log("Payment verified for order:", orderId)
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Payment verification failed" 
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
