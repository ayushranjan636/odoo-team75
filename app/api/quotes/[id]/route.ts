import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Mock quote data - in real app, fetch from database
    const quote = {
      id: params.id,
      items: [
        {
          productId: "1",
          name: "Premium Sofa Set",
          qty: 1,
          pricePerUnit: 500,
          tenureType: "month",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          deposit: 1000,
        },
      ],
      address: {
        name: "John Doe",
        phone: "+91 9876543210",
        email: "john@example.com",
        line1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      deliveryMethod: "standard",
      subtotal: 500,
      deliveryCharge: 100,
      taxes: 90,
      discount: 0,
      total: 690,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      pdfUrl: `/api/docs/quote/${params.id}.pdf`,
    }

    return NextResponse.json({ data: quote })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}
