import { NextResponse } from "next/server";
import { ensureOdooConnected } from "@/lib/odoo";

function toBool(v: string | null): boolean | undefined {
  if (v === null) return undefined;
  return v === "true" ? true : v === "false" ? false : undefined;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 200);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const type = url.searchParams.get("type") ?? "consu"; // consumable by default for rentals
    const saleOk = toBool(url.searchParams.get("sale_ok")) ?? true;
    const active = toBool(url.searchParams.get("active")) ?? true;

  const odoo = await ensureOdooConnected();

    const domain: any[] = [];
    if (type) domain.push(["type", "=", type]);       // 'product' | 'consu' | 'service'
    if (saleOk !== undefined) domain.push(["sale_ok", "=", saleOk]);
    if (active !== undefined) domain.push(["active", "=", active]);

    // Fetch product templates (one per product; variants are product.product)
    const fields = [
      "id",
      "name", 
      "list_price",
      "standard_price",
      "categ_id",
      "description",
      "description_sale",
      "type",
      "default_code",
      "barcode",
      "image_1920",
      "sale_ok",
      "purchase_ok",
      "active",
      "create_date",
      "write_date"
    ];

    const products = await odoo.searchRead(
      "product.template",
      domain,
      fields
    );

    // Optional: total count (uncomment if your odoo-await version supports searchCount)
    // const total = await odoo.searchCount("product.template", domain);

    const items = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.list_price,
      standardPrice: p.standard_price,
      type: p.type,                       // 'product'|'consu'|'service'
      sku: p.default_code || null,
      barcode: p.barcode || null,
      categoryId: Array.isArray(p.categ_id) ? p.categ_id[0] : p.categ_id,
      categoryName: Array.isArray(p.categ_id) ? p.categ_id[1] : null,
      image: p.image_1920
        ? `data:image/png;base64,${p.image_1920}`
        : null,
      description:
        (p.description_sale && String(p.description_sale).trim()) ||
        (p.description && String(p.description).trim()) ||
        "",
      saleOk: p.sale_ok,
      purchaseOk: p.purchase_ok,
      active: p.active,
      createdAt: p.create_date,
      updatedAt: p.write_date
    }));

    const diagnostics = items.length === 0 ? {
      domain,
      note: "No products returned. Verify DB (env ODOO_DB) has data and product types match filter.",
    } : undefined;

    return NextResponse.json({
      items,
      count: items.length,
      limit,
      offset,
      diagnostics,
      fetchedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=60" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch products from Odoo.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
