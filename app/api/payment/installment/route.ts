import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, installmentAmount, installmentNumber } = await request.json()

    console.log(`Processing installment payment for order ${orderId}:`, {
      installmentAmount,
      installmentNumber
    })

    // Create Razorpay order for installment
    const razorpayResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(installmentAmount * 100), // Convert to paise
        currency: 'INR',
        orderId: `${orderId}_installment_${installmentNumber}`
      })
    })

    if (!razorpayResponse.ok) {
      throw new Error('Failed to create Razorpay order')
    }

    const razorpayOrder = await razorpayResponse.json()

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: installmentAmount,
      currency: 'INR',
      orderId: orderId,
      installmentNumber: installmentNumber
    })
  } catch (error) {
    console.error('Error creating installment payment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create installment payment' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, installmentNumber, paymentId, paymentStatus } = await request.json()

    console.log(`Updating installment payment for order ${orderId}:`, {
      installmentNumber,
      paymentId,
      paymentStatus
    })

    // In a real application, this would update the database
    // For now, we'll simulate the update
    
    return NextResponse.json({
      success: true,
      message: `Installment ${installmentNumber} for order ${orderId} updated successfully`,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating installment payment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update installment payment' 
    }, { status: 500 })
  }
}
