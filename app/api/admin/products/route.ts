import { NextResponse } from "next/server"

export async function GET() {
  // Mock products data
  const products = [
    {
      id: "1",
      name: "Premium Office Chair",
      internalRef: "OFC-001",
      salesPrice: 25000,
      costPrice: 15000,
      qtyOnHand: 45,
      qtyForecasted: 60,
      rentable: true,
      status: "active",
      category: "furniture",
      image: "/placeholder.svg?height=200&width=200",
      description: "Ergonomic office chair with lumbar support",
    },
    {
      id: "2",
      name: "Standing Desk",
      internalRef: "DSK-002",
      salesPrice: 35000,
      costPrice: 22000,
      qtyOnHand: 23,
      qtyForecasted: 40,
      rentable: true,
      status: "active",
      category: "furniture",
      image: "/placeholder.svg?height=200&width=200",
      description: "Height adjustable standing desk",
    },
    {
      id: "3",
      name: "Gaming Setup Complete",
      internalRef: "GAM-003",
      salesPrice: 85000,
      costPrice: 55000,
      qtyOnHand: 12,
      qtyForecasted: 20,
      rentable: true,
      status: "active",
      category: "electronics",
      image: "/placeholder.svg?height=200&width=200",
      description: "Complete gaming setup with monitor, keyboard, mouse",
    },
  ]

  return NextResponse.json({ products })
}
