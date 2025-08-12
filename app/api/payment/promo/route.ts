import { type NextRequest, NextResponse } from "next/server"

// Types for promo codes
interface PromoCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number // percentage (1-100) or fixed amount
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  description: string
  createdAt: string
}

// Mock promo codes
const promoCodes: PromoCode[] = [
  {
    id: "PROMO-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    usedCount: 25,
    validFrom: new Date("2025-01-01").toISOString(),
    validUntil: new Date("2025-12-31").toISOString(),
    isActive: true,
    description: "Welcome discount - 10% off on first order",
    createdAt: new Date().toISOString()
  },
  {
    id: "PROMO-2",
    code: "SAVE20",
    type: "percentage",
    value: 20,
    minOrderAmount: 2000,
    maxDiscount: 1000,
    usageLimit: 50,
    usedCount: 12,
    validFrom: new Date("2025-01-01").toISOString(),
    validUntil: new Date("2025-12-31").toISOString(),
    isActive: true,
    description: "Save big - 20% off on orders above ₹2000",
    createdAt: new Date().toISOString()
  },
  {
    id: "PROMO-3",
    code: "FLAT500",
    type: "fixed",
    value: 500,
    minOrderAmount: 3000,
    usageLimit: 200,
    usedCount: 45,
    validFrom: new Date("2025-01-01").toISOString(),
    validUntil: new Date("2025-12-31").toISOString(),
    isActive: true,
    description: "Flat ₹500 off on orders above ₹3000",
    createdAt: new Date().toISOString()
  },
  {
    id: "PROMO-4",
    code: "MONTH30",
    type: "percentage",
    value: 30,
    minOrderAmount: 5000,
    maxDiscount: 2000,
    usageLimit: 30,
    usedCount: 8,
    validFrom: new Date("2025-08-01").toISOString(),
    validUntil: new Date("2025-08-31").toISOString(),
    isActive: true,
    description: "Monthly special - 30% off on premium rentals",
    createdAt: new Date().toISOString()
  },
  {
    id: "PROMO-5",
    code: "STUDENT15",
    type: "percentage",
    value: 15,
    minOrderAmount: 1500,
    maxDiscount: 750,
    usageLimit: 100,
    usedCount: 22,
    validFrom: new Date("2025-01-01").toISOString(),
    validUntil: new Date("2025-12-31").toISOString(),
    isActive: true,
    description: "Student discount - 15% off for educational purposes",
    createdAt: new Date().toISOString()
  },
  {
    id: "PROMO-6",
    code: "PROF20",
    type: "percentage",
    value: 20,
    minOrderAmount: 2500,
    maxDiscount: 1500,
    usageLimit: 50,
    usedCount: 5,
    validFrom: new Date("2025-01-01").toISOString(),
    validUntil: new Date("2025-12-31").toISOString(),
    isActive: true,
    description: "Professor special - 20% off for academic demonstrations",
    createdAt: new Date().toISOString()
  }
]

// Validate and apply promo code
export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json()

    if (!code || !orderAmount) {
      return NextResponse.json({ error: "Code and order amount required" }, { status: 400 })
    }

    // Find promo code
    const promo = promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase() && p.isActive)

    if (!promo) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid or expired promo code" 
      }, { status: 400 })
    }

    // Check validity dates
    const now = new Date()
    const validFrom = new Date(promo.validFrom)
    const validUntil = new Date(promo.validUntil)

    if (now < validFrom || now > validUntil) {
      return NextResponse.json({ 
        valid: false, 
        error: "Promo code has expired" 
      }, { status: 400 })
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ 
        valid: false, 
        error: "Promo code usage limit exceeded" 
      }, { status: 400 })
    }

    // Check minimum order amount
    if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order amount ₹${promo.minOrderAmount} required` 
      }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.type === 'percentage') {
      discountAmount = (orderAmount * promo.value) / 100
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, promo.maxDiscount)
      }
    } else {
      discountAmount = promo.value
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount)

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        type: promo.type,
        value: promo.value
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount
    })

  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
  }
}

// Get all active promo codes
export async function GET() {
  try {
    const now = new Date()
    const activePromos = promoCodes.filter(promo => {
      const validUntil = new Date(promo.validUntil)
      return promo.isActive && now <= validUntil && 
             (!promo.usageLimit || promo.usedCount < promo.usageLimit)
    })

    // Return public info only
    const publicPromos = activePromos.map(promo => ({
      code: promo.code,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minOrderAmount: promo.minOrderAmount,
      maxDiscount: promo.maxDiscount,
      validUntil: promo.validUntil
    }))

    return NextResponse.json(publicPromos)
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

// Apply promo code (increment usage count)
export async function PATCH(request: NextRequest) {
  try {
    const { code } = await request.json()

    const promo = promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase())
    if (promo) {
      promo.usedCount += 1
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error applying promo code:", error)
    return NextResponse.json({ error: "Failed to apply promo code" }, { status: 500 })
  }
}
