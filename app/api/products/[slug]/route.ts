import { NextResponse } from "next/server"
import { getOdooProducts } from "@/lib/odoo"
import { calculateRentalPrice, getAvailabilityStatus } from "@/lib/pricing"
import { parseISO } from "date-fns"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  const tenure = (searchParams.get("tenure") as any) || "month"
  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")
  const pricelist = searchParams.get("pricelist") || "standard"

  const allProducts = await getOdooProducts()
  const product = allProducts.find((p) => p.slug === slug)

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 })
  }

  const startDate = startDateParam ? parseISO(startDateParam) : undefined
  const endDate = endDateParam ? parseISO(endDateParam) : undefined

  const { price, deposit } = calculateRentalPrice(
    product,
    tenure,
    startDate || new Date(), // Use current date if not provided for calculation
    endDate || new Date(),
    pricelist,
  )

  const mockReservations: any[] = []; // TODO: Replace with actual reservations from Odoo
  const availabilityStatus = getAvailabilityStatus(product, mockReservations, startDate, endDate)

  // Find related products by slug
  const relatedProducts = product.relatedProducts
    ? allProducts.filter((p) => product.relatedProducts?.includes(p.slug))
    : []

  return NextResponse.json({
    ...product,
    currentPrice: price,
    currentDeposit: deposit,
    availabilityStatus: availabilityStatus,
    relatedProducts: relatedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      price: getBasePriceForTenure(p, "month", pricelist), // Show monthly price for related
      tenure: "month",
      description: p.description,
      qtyOnHand: p.qtyOnHand, // Ensure qtyOnHand is passed for related products
    })),
  })
}

function getBasePriceForTenure(p: any, tenure: any, pricelist: any): any {
  // This is a simplified version, ideally would use the full pricing logic
  // TODO: Replace with Odoo pricelists
  const mockPricelists: any = {
    standard: { hourly: 0.1, daily: 0.5, weekly: 2, monthly: 5 },
    premium: { hourly: 0.15, daily: 0.7, weekly: 2.5, monthly: 7 },
  };
  const rule = mockPricelists[pricelist] || mockPricelists.standard
  let price = 0
  switch (tenure) {
    case "hour":
      price = p.salesPrice * rule.hourly
      break
    case "day":
      price = p.salesPrice * rule.daily
      break
    case "week":
      price = p.salesPrice * rule.weekly
      break
    case "month":
      price = p.salesPrice * rule.monthly
      break
  }
  return Math.round(price)
}
