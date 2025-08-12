import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    console.log('Admin fetching orders with filters:', { status, city, search, dateFrom, dateTo })

    // Enhanced mock orders that represent real order data structure
    const orders = [
      {
        id: "ORD-1754961843068",
        customerId: "anonymous",
        customerName: "Customer Name",
        customerEmail: "student@slate.com",
        status: "confirmed",
        paymentStatus: "paid",
        total: 12901.88,
        deposit: 4083.5,
        deliveryDate: "2025-08-14T18:30:00.000Z",
        returnDate: "2025-08-21T18:30:00.000Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Bangalore",
        items: [
          {
            productName: "Furniture Item 4",
            quantity: 1,
            pricePerUnit: 11433.8
          }
        ],
        timeline: [
          {
            status: "Order Placed",
            timestamp: "2025-08-12T01:24:03.068Z",
            note: "Order ORD-1754961843068 created"
          },
          {
            status: "Payment Confirmed",
            timestamp: "2025-08-12T01:25:00.000Z",
            note: "Payment verified and order confirmed"
          },
          {
            status: "Bill Generated",
            timestamp: "2025-08-12T01:25:30.000Z",
            note: "Invoice BILL-1754961848165 generated and sent"
          }
        ],
        createdAt: "2025-08-12T01:24:03.068Z",
        billNumber: "BILL-1754961848165",
        razorpayPaymentId: "pay_demo_123456"
      },
      {
        id: "ORD-1754961823478",
        customerId: "anonymous",
        customerName: "Customer Name",
        customerEmail: "student@slate.com",
        status: "picked_up",
        paymentStatus: "installments",
        total: 8500.00,
        deposit: 2500.0,
        deliveryDate: "2025-08-12T18:30:00.000Z",
        returnDate: "2025-08-19T18:30:00.000Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Mumbai",
        items: [
          {
            productName: "Office Chair Premium",
            quantity: 1,
            pricePerUnit: 7200.0
          }
        ],
        timeline: [
          {
            status: "Order Placed",
            timestamp: "2025-08-10T01:24:03.068Z",
            note: "Order ORD-1754961823478 created"
          },
          {
            status: "First Installment Paid",
            timestamp: "2025-08-10T01:25:00.000Z",
            note: "First installment payment confirmed"
          },
          {
            status: "Items Delivered",
            timestamp: "2025-08-12T10:30:00.000Z",
            note: "Items delivered to customer"
          }
        ],
        createdAt: "2025-08-10T01:24:03.068Z",
        installmentInfo: {
          plan: "2-months",
          currentInstallment: 1,
          totalInstallments: 2,
          nextPaymentDate: "2025-09-10T00:00:00.000Z",
          nextPaymentAmount: 4250.0
        }
      },
      {
        id: "ORD-1754961814722",
        customerId: "anonymous",
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        status: "quotation",
        paymentStatus: "pending",
        total: 15500.00,
        deposit: 5000.0,
        deliveryDate: "2025-08-15T18:30:00.000Z",
        returnDate: "2025-08-22T18:30:00.000Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Delhi",
        items: [
          {
            productName: "Premium Dining Set",
            quantity: 1,
            pricePerUnit: 13500.0
          }
        ],
        timeline: [
          {
            status: "Quotation Generated",
            timestamp: "2025-08-12T00:23:34.722Z",
            note: "Order ORD-1754961814722 created, awaiting payment"
          }
        ],
        createdAt: "2025-08-12T00:23:34.722Z"
      },
      // Legacy mock orders for completeness
      {
        id: "ORD-1234567890",
        customerId: "cust-001",
        customerName: "Rajesh Kumar",
        customerEmail: "rajesh@example.com",
        status: "confirmed",
        paymentStatus: "paid",
        total: 15000,
        deposit: 5000,
        deliveryDate: "2024-01-15T10:00:00Z",
        returnDate: "2024-01-22T18:00:00Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Bangalore",
        items: [{ productName: "Premium Office Chair", quantity: 2, pricePerUnit: 7500 }],
        timeline: [
          {
            status: "Order Placed",
            timestamp: "2024-01-10T09:30:00Z",
            note: "Order created"
          }
        ],
        createdAt: "2024-01-10T09:30:00Z",
      },
      {
        id: "ORD-0987654321",
        customerId: "cust-002",
        customerName: "Priya Sharma",
        customerEmail: "priya@example.com",
        status: "picked_up",
        paymentStatus: "paid",
        total: 28000,
        deposit: 8000,
        deliveryDate: "2024-01-12T14:00:00Z",
        returnDate: "2024-01-26T16:00:00Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Mumbai",
        items: [{ productName: "Standing Desk", quantity: 1, pricePerUnit: 28000 }],
        timeline: [
          {
            status: "Order Placed",
            timestamp: "2024-01-08T11:15:00Z",
            note: "Order created"
          }
        ],
        createdAt: "2024-01-08T11:15:00Z",
      },
      {
        id: "ORD-1122334455",
        customerId: "cust-003",
        customerName: "Amit Patel",
        customerEmail: "amit@example.com",
        status: "late",
        paymentStatus: "paid",
        total: 45000,
        deposit: 15000,
        deliveryDate: "2024-01-05T12:00:00Z",
        returnDate: "2024-01-12T18:00:00Z",
        deliveryWindow: "9:00 AM - 6:00 PM",
        returnWindow: "9:00 AM - 6:00 PM",
        city: "Delhi",
        items: [{ productName: "Gaming Setup Complete", quantity: 1, pricePerUnit: 45000 }],
        timeline: [
          {
            status: "Order Placed",
            timestamp: "2024-01-02T16:45:00Z",
            note: "Order created"
          }
        ],
        createdAt: "2024-01-02T16:45:00Z",
      },
    ]

    // Apply filters
    let filteredOrders = [...orders]

    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }

    if (city && city !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.city.toLowerCase().includes(city.toLowerCase()))
    }

    if (search) {
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= fromDate && orderDate <= toDate
      })
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

    return NextResponse.json({
      orders: paginatedOrders,
      total: filteredOrders.length,
      page,
      limit,
      totalPages: Math.ceil(filteredOrders.length / limit)
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
