import { type NextRequest, NextResponse } from "next/server"

// Sync order to Odoo database
export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData, paymentData, billData } = await request.json()

    console.log(`Syncing order ${orderId} to Odoo database...`)

    // Mock Odoo order creation for development
    // In production, this would use the actual Odoo API
    const mockOdooOrder = {
      id: `SO${Date.now()}`,
      name: orderId,
      partner_name: orderData.address.name,
      partner_email: orderData.address.email,
      amount_total: orderData.total,
      state: 'sale',
      created_at: new Date().toISOString()
    }

    console.log(`Order ${orderId} successfully synced to Odoo (mock). Odoo Order ID: ${mockOdooOrder.id}`)
    
    // Mock bill/invoice sync if bill data is provided
    if (billData) {
      console.log(`Invoice ${billData.billNumber} synced to Odoo (mock)`)
    }

    return NextResponse.json({
      success: true,
      message: 'Order successfully synced to Odoo',
      odooOrderId: mockOdooOrder.id,
      syncedAt: new Date().toISOString(),
      mockData: true // Indicates this is mock data
    })

  } catch (error) {
    console.error('Error syncing order to Odoo:', error)
    
    // Even if Odoo sync fails, don't fail the entire payment process
    return NextResponse.json({
      success: false,
      error: 'Failed to sync to Odoo database',
      message: 'Order completed but Odoo sync failed. Order will be synced later.',
      fallback: true
    }, { status: 200 }) // Return 200 so payment process continues
  }
}

// Get order sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // In real implementation, check Odoo for order status
    // For now, return mock status
    return NextResponse.json({
      orderId,
      synced: true,
      odooOrderId: `SO${Date.now()}`,
      syncedAt: new Date().toISOString(),
      status: 'sale'
    })

  } catch (error) {
    console.error('Error checking order sync status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check sync status'
    }, { status: 500 })
  }
}
