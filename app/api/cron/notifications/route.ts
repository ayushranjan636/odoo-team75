import { type NextRequest, NextResponse } from "next/server"

// Cron job to send installment notifications
export async function POST(request: NextRequest) {
  try {
    console.log('Running installment notification cron job...')

    // Get pending notifications
    const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/payment/notifications`, {
      method: 'GET'
    })

    if (!notificationsResponse.ok) {
      throw new Error('Failed to fetch notifications')
    }

    const data = await notificationsResponse.json()
    const { pendingNotifications } = data

    console.log(`Found ${pendingNotifications.length} pending notifications`)

    // Send notifications
    if (pendingNotifications.length > 0) {
      const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/payment/notifications`, {
        method: 'PUT'
      })

      if (sendResponse.ok) {
        const sendData = await sendResponse.json()
        console.log(`Sent ${sendData.sentCount} notifications successfully`)
        
        return NextResponse.json({
          success: true,
          message: `Sent ${sendData.sentCount} installment notifications`,
          details: sendData
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'No pending notifications to send',
      pendingCount: 0
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process notifications'
    }, { status: 500 })
  }
}

// Manual trigger for testing
export async function GET() {
  try {
    // Get all notifications for testing
    const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/payment/notifications`)
    
    if (!notificationsResponse.ok) {
      throw new Error('Failed to fetch notifications')
    }

    const data = await notificationsResponse.json()
    
    return NextResponse.json({
      success: true,
      pendingNotifications: data.pendingNotifications || [],
      totalNotifications: data.totalNotifications || 0,
      message: 'Notification status retrieved successfully'
    })

  } catch (error) {
    console.error('Failed to get notification status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get notification status'
    }, { status: 500 })
  }
}
