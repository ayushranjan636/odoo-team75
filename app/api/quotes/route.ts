import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createOdooQuotation } from "@/lib/odoo"

const createQuoteSchema = z.object({
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      qty: z.number(),
      pricePerUnit: z.number(),
      tenureType: z.enum(["hour", "day", "week", "month"]),
      startDate: z.string(),
      endDate: z.string(),
      deposit: z.number(),
    }),
  ),
  deliveryMethod: z.string().optional(),
  coupon: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createQuoteSchema.parse(body)

    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.pricePerUnit * item.qty, 0)
    const totalDeposit = validatedData.items.reduce((sum, item) => sum + item.deposit * item.qty, 0)
    const deliveryCharge = validatedData.deliveryMethod === "express" ? 200 : 100
    const taxes = subtotal * 0.18 // 18% GST
    const discount = validatedData.coupon === "NEW10" ? subtotal * 0.1 : 0
    const total = subtotal + deliveryCharge + taxes - discount

    // Try to create quotation in Odoo
    let odooQuotation = null;
    let odooError = null;

    try {
      odooQuotation = await createOdooQuotation({
        customerInfo: validatedData.customerInfo,
        items: validatedData.items,
        notes: validatedData.notes,
        validUntil: validatedData.validUntil,
      });
    } catch (error) {
      odooError = error instanceof Error ? error.message : "Failed to create Odoo quotation";
      console.error("Odoo quotation creation failed:", error);
    }

    // Generate quote response
    const quote = {
      id: odooQuotation?.quotationNumber || `Q-${Date.now()}`,
      odooId: odooQuotation?.id || null,
      customerInfo: validatedData.customerInfo,
      items: validatedData.items,
      deliveryMethod: validatedData.deliveryMethod,
      coupon: validatedData.coupon,
      notes: validatedData.notes,
      subtotal,
      totalDeposit,
      deliveryCharge,
      taxes,
      discount,
      total,
      createdAt: new Date().toISOString(),
      expiresAt: validatedData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      pdfUrl: `/api/docs/quote/${odooQuotation?.quotationNumber || Date.now()}.pdf`, // Mock PDF URL
      odooStatus: odooQuotation ? "success" : "failed",
      odooError: odooError,
    }

    return NextResponse.json({ 
      data: quote,
      message: odooQuotation 
        ? "Quotation created successfully in Odoo"
        : `Quotation created locally. Odoo integration failed: ${odooError}`
    })
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 })
  }
}
