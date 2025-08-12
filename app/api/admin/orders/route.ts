import { NextResponse } from "next/server"

export async function GET() {
  // Mock orders data
  const orders = [
    {
      id: "ORD-1234567890",
      customerId: "cust-001",
      customerName: "Rajesh Kumar",
      customerEmail: "rajesh@example.com",
      status: "confirmed",
      total: 15000,
      deposit: 5000,
      deliveryDate: "2024-01-15T10:00:00Z",
      returnDate: "2024-01-22T18:00:00Z",
      items: [{ productName: "Premium Office Chair", quantity: 2, pricePerUnit: 7500 }],
      createdAt: "2024-01-10T09:30:00Z",
    },
    {
      id: "ORD-0987654321",
      customerId: "cust-002",
      customerName: "Priya Sharma",
      customerEmail: "priya@example.com",
      status: "picked_up",
      total: 28000,
      deposit: 8000,
      deliveryDate: "2024-01-12T14:00:00Z",
      returnDate: "2024-01-26T16:00:00Z",
      items: [{ productName: "Standing Desk", quantity: 1, pricePerUnit: 28000 }],
      createdAt: "2024-01-08T11:15:00Z",
    },
    {
      id: "ORD-1122334455",
      customerId: "cust-003",
      customerName: "Amit Patel",
      customerEmail: "amit@example.com",
      status: "late",
      total: 45000,
      deposit: 15000,
      deliveryDate: "2024-01-05T12:00:00Z",
      returnDate: "2024-01-12T18:00:00Z",
      items: [{ productName: "Gaming Setup Complete", quantity: 1, pricePerUnit: 45000 }],
      createdAt: "2024-01-02T16:45:00Z",
    },
  ]

  return NextResponse.json({ orders })
}
