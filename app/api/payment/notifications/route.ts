import { type NextRequest, NextResponse } from "next/server"

// Types for notifications
interface Notification {
  id: string
  type: 'installment_reminder' | 'installment_overdue' | 'installment_paid'
  orderId: string
  installmentId?: string
  message: string
  scheduled: boolean
  scheduledDate?: string
  sent: boolean
  sentAt?: string
  customerPhone?: string
  customerEmail?: string
  createdAt: string
}

// Mock notifications storage
let notifications: Notification[] = []

// Create installment reminder notifications
export async function POST(request: NextRequest) {
  try {
    const { installmentPlan, customerInfo } = await request.json()

    const createdNotifications: Notification[] = []

    // Create reminder notifications for each installment
    for (const installment of installmentPlan.installments) {
      if (installment.status === 'pending') {
        // Reminder 3 days before due date
        const reminderDate = new Date(installment.dueDate)
        reminderDate.setDate(reminderDate.getDate() - 3)

        const reminderNotification: Notification = {
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'installment_reminder',
          orderId: installmentPlan.orderId,
          installmentId: installment.id,
          message: `Reminder: Your installment of ₹${installment.amount} is due on ${new Date(installment.dueDate).toLocaleDateString('en-IN')}. Please make the payment to avoid any inconvenience.`,
          scheduled: true,
          scheduledDate: reminderDate.toISOString(),
          sent: false,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          createdAt: new Date().toISOString()
        }

        // Overdue notification (1 day after due date)
        const overdueDate = new Date(installment.dueDate)
        overdueDate.setDate(overdueDate.getDate() + 1)

        const overdueNotification: Notification = {
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'installment_overdue',
          orderId: installmentPlan.orderId,
          installmentId: installment.id,
          message: `OVERDUE: Your installment of ₹${installment.amount} was due on ${new Date(installment.dueDate).toLocaleDateString('en-IN')}. Please pay immediately to avoid late fees.`,
          scheduled: true,
          scheduledDate: overdueDate.toISOString(),
          sent: false,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          createdAt: new Date().toISOString()
        }

        notifications.push(reminderNotification, overdueNotification)
        createdNotifications.push(reminderNotification, overdueNotification)
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCreated: createdNotifications.length,
      notifications: createdNotifications
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating notifications:", error)
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 })
  }
}

// Get pending notifications to send
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const type = searchParams.get('type')

    let filteredNotifications = notifications

    if (orderId) {
      filteredNotifications = filteredNotifications.filter(n => n.orderId === orderId)
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }

    // Get notifications that should be sent now
    const now = new Date()
    const pendingNotifications = filteredNotifications.filter(n => 
      n.scheduled && 
      !n.sent && 
      n.scheduledDate && 
      new Date(n.scheduledDate) <= now
    )

    return NextResponse.json({
      pendingNotifications,
      totalNotifications: filteredNotifications.length
    })

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// Mark notification as sent
export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json()

    const notification = notifications.find(n => n.id === notificationId)
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    notification.sent = true
    notification.sentAt = new Date().toISOString()

    return NextResponse.json({
      success: true,
      notification
    })

  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

// Send notifications (webhook for actual sending service)
export async function PUT(request: NextRequest) {
  try {
    const now = new Date()
    const pendingNotifications = notifications.filter(n => 
      n.scheduled && 
      !n.sent && 
      n.scheduledDate && 
      new Date(n.scheduledDate) <= now
    )

    const sentNotifications = []

    for (const notification of pendingNotifications) {
      // Here you would integrate with actual SMS/Email service
      // For now, we'll just mark as sent
      
      console.log(`Sending ${notification.type} to ${notification.customerPhone}:`)
      console.log(notification.message)

      notification.sent = true
      notification.sentAt = new Date().toISOString()
      sentNotifications.push(notification)
    }

    return NextResponse.json({
      success: true,
      sentCount: sentNotifications.length,
      sentNotifications
    })

  } catch (error) {
    console.error("Error sending notifications:", error)
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 })
  }
}
