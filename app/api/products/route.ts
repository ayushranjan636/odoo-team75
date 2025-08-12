import { NextResponse } from "next/server"
import { getOdooProducts } from "@/lib/odoo"
import { getBasePriceForTenure, getAvailabilityStatus, type TenureType } from "@/lib/pricing"
import { parseISO } from "date-fns"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get("q")?.toLowerCase() || ""
  const category = searchParams.get("category")?.toLowerCase()
  const slug = searchParams.get("slug")?.toLowerCase()
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "12")
  const sort = searchParams.get("sort") || "popularity" // popularity, price-asc, price-desc, newest
  const tenure = (searchParams.get("tenure") as TenureType) || "month"
  const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
  const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "999999")
  const availableFrom = searchParams.get("availableFrom") ? parseISO(searchParams.get("availableFrom")!) : undefined
  const availableTo = searchParams.get("availableTo") ? parseISO(searchParams.get("availableTo")!) : undefined
  const pricelist = searchParams.get("pricelist") || "standard"

  const allProducts = await getOdooProducts();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[API /products] fetched raw count =', allProducts.length)
  }
  if (!allProducts.length) {
    return NextResponse.json({ items: [], total: 0, page, limit, diagnostics: {
      note: 'No products from Odoo. Verify DB + env vars. Check /api/test-products for raw output.'
    }})
  }
  const mockReservations: any[] = []; // TODO: Replace with actual reservations from Odoo

  const attributeFilters: { [key: string]: string[] } = {}
  searchParams.forEach((value, key) => {
    if (key.startsWith("attrs[")) {
      const attrName = key.substring(6, key.length - 1)
      attributeFilters[attrName] = value.split(",")
    }
  })

  const filteredProducts = allProducts.filter((product) => {
    if (slug) {
      return product.slug.toLowerCase() === slug
    }

    const matchesSearch = q
      ? product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
      : true
  // Category filter: incoming category already lower-case, product.category is Proper Case
  const matchesCategory = category ? product.category.toLowerCase() === category : true

    // Filter by price range (using the base price for the selected tenure)
    const basePrice = getBasePriceForTenure(product, tenure, pricelist)
    const matchesPrice = basePrice >= minPrice && basePrice <= maxPrice

    // Filter by availability
    const availabilityStatus = getAvailabilityStatus(product, mockReservations, availableFrom, availableTo)
    const matchesAvailability = availabilityStatus !== "red" // Only show if not fully booked

    // Filter by attributes
    const matchesAttributes = Object.keys(attributeFilters).every((attrName) => {
      const productAttrValues = product.attributes?.[attrName as keyof typeof product.attributes]
      const filterValues = attributeFilters[attrName]
      if (!productAttrValues || productAttrValues.length === 0) return false // Product doesn't have this attribute
      return filterValues.some((filterVal) => {
        if (Array.isArray(productAttrValues)) {
          return productAttrValues.some(val => 
            typeof val === 'string' && val === filterVal
          )
        }
        return false
      })
    })

    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability && matchesAttributes
  })

  // Apply sorting
  filteredProducts.sort((a, b) => {
    if (sort === "price-asc") {
      return getBasePriceForTenure(a, tenure, pricelist) - getBasePriceForTenure(b, tenure, pricelist)
    } else if (sort === "price-desc") {
      return getBasePriceForTenure(b, tenure, pricelist) - getBasePriceForTenure(a, tenure, pricelist)
    } else if (sort === "newest") {
      return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
    }
    // Default to popularity (mocked by salesPrice for now, higher salesPrice = more popular)
    return b.salesPrice - a.salesPrice
  })

  const total = filteredProducts.length
  const start = (page - 1) * limit
  const end = start + limit
  const items = filteredProducts.slice(start, end).map((product) => ({
    ...product,
    // Add computed price for the current tenure and pricelist
    pricePerTenure: getBasePriceForTenure(product, tenure, pricelist),
    availabilityStatus: getAvailabilityStatus(product, mockReservations, availableFrom, availableTo),
  }))

  return NextResponse.json({ items, total, page, limit })
}
