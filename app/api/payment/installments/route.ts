import { type NextRequest, NextResponse } from "next/server"

// Types for installment plans
interface InstallmentPlan {
  id: string
  orderId: string
  totalAmount: number
  installments: Installment[]
  status: 'active' | 'completed' | 'defaulted'
  createdAt: string
}

interface Installment {
  id: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paidAt?: string
  reminderSent?: boolean
}

// Mock storage for installment plans
let installmentPlans: InstallmentPlan[] = []

export async function POST(request: NextRequest) {
  try {
    const { orderId, totalAmount, planType } = await request.json()

    // Validate plan type
    if (!['2-months', '3-months'].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Create installment plan
    const numberOfInstallments = planType === '2-months' ? 2 : 3
    const installmentAmount = Math.ceil(totalAmount / numberOfInstallments)
    const now = new Date()

    const installments: Installment[] = []
    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(now)
      dueDate.setMonth(dueDate.getMonth() + i + 1) // Due every month starting next month

      installments.push({
        id: `INST-${Date.now()}-${i}`,
        amount: i === numberOfInstallments - 1 
          ? totalAmount - (installmentAmount * (numberOfInstallments - 1)) // Adjust last installment for remainder
          : installmentAmount,
        dueDate: dueDate.toISOString(),
        status: 'pending',
        reminderSent: false
      })
    }

    const plan: InstallmentPlan = {
      id: `PLAN-${Date.now()}`,
      orderId,
      totalAmount,
      installments,
      status: 'active',
      createdAt: now.toISOString()
    }

    installmentPlans.push(plan)

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("Error creating installment plan:", error)
    return NextResponse.json({ error: "Failed to create installment plan" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (orderId) {
      const plan = installmentPlans.find(p => p.orderId === orderId)
      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }
      return NextResponse.json(plan)
    }

    return NextResponse.json(installmentPlans)
  } catch (error) {
    console.error("Error fetching installment plans:", error)
    return NextResponse.json({ error: "Failed to fetch installment plans" }, { status: 500 })
  }
}

// Update installment status (for payment processing)
export async function PATCH(request: NextRequest) {
  try {
    const { installmentId, status, paidAt } = await request.json()

    const plan = installmentPlans.find(p => 
      p.installments.some(inst => inst.id === installmentId)
    )

    if (!plan) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 })
    }

    const installment = plan.installments.find(inst => inst.id === installmentId)
    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 })
    }

    installment.status = status
    if (paidAt) {
      installment.paidAt = paidAt
    }

    // Check if all installments are paid
    const allPaid = plan.installments.every(inst => inst.status === 'paid')
    if (allPaid) {
      plan.status = 'completed'
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error updating installment:", error)
    return NextResponse.json({ error: "Failed to update installment" }, { status: 500 })
  }
}
