import { NextResponse } from "next/server"
import { ReservationLifecycleManager } from "@/lib/reservation-lifecycle"

export async function POST() {
  try {
    // Verify cron authorization (in production, use proper auth)
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    await ReservationLifecycleManager.processLateReturns()

    return NextResponse.json({
      success: true,
      message: "Late returns processed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in late returns cron job:", error)
    return NextResponse.json(
      {
        error: "Failed to process late returns",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Allow GET for testing purposes
  return POST()
}
