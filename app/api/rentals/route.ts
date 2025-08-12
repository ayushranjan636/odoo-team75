import { NextResponse } from "next/server";
import { connectToOdoo } from "@/lib/odoo";

const RENTAL_ROOT_NAMES = [
  process.env.ODOO_RENTAL_ROOT || "Rental",
  "Rentals",
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const odoo = await connectToOdoo();

    // 1) Find the Rental root
    const rentalRoot = await odoo.searchRead(
      "product.category",
      [["name", "in", RENTAL_ROOT_NAMES], ["parent_id", "=", false]],
      ["id", "name"],
      0,
      1
    );

    if (!rentalRoot.length) {
      return NextResponse.json(
        { error: "Rental root category not found. Set ODOO_RENTAL_ROOT or create one in Odoo." },
        { status: 404 }
      );
    }

    const rentalRootId = rentalRoot[0].id;

    // 2) Find direct child categories of "Rental"
    const childCats = await odoo.searchRead(
      "product.category",
      [["parent_id", "=", rentalRootId]],
      ["id", "name"],
      0,
      100,
      "name asc"
    );

    // If you also want products directly under the Rental root, include it as a pseudo-child:
    const includeRootProducts = false;

    const buckets = [];

    // Optional: gather products directly under Rental
    if (includeRootProducts) {
      const rootProducts = await odoo.searchRead(
        "product.template",
        [["categ_id", "=", rentalRootId], ["sale_ok", "=", true]],
        ["id", "name", "list_price", "description", "description_sale", "image_1920", "categ_id"],
        0,
        500,
        "name asc"
      );
      if (rootProducts.length) {
        buckets.push({
          id: rentalRootId,
          name: rentalRoot[0].name,
          slug: slugify(rentalRoot[0].name),
          products: rootProducts.map(toFrontendProduct),
        });
      }
    }

    // 3) For each subcategory, fetch its products
    for (const cat of childCats) {
      const prods = await odoo.searchRead(
        "product.template",
        [["categ_id", "=", cat.id], ["sale_ok", "=", true]],
        ["id", "name", "list_price", "description", "description_sale", "image_1920", "categ_id"],
        0,
        500,
        "name asc"
      );

      buckets.push({
        id: cat.id,
        name: cat.name,
        slug: slugify(cat.name),
        products: prods.map(toFrontendProduct),
      });
    }

    // Sort buckets in a friendly order if you care (optional):
    const preferredOrder = ["Office Equipment", "Electronics", "Furniture", "Appliances", "Event Equipment"];
    buckets.sort((a, b) => {
      const ai = preferredOrder.indexOf(a.name);
      const bi = preferredOrder.indexOf(b.name);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return NextResponse.json({
      categories: buckets,
      count: buckets.reduce((sum, b) => sum + b.products.length, 0),
      lastUpdated: new Date().toISOString(),
    }, {
      // cache for 5 minutes at the edge/CDN
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });

  } catch (err: any) {
    // Avoid leaking secrets
    return NextResponse.json(
      { error: "Failed to load rentals from Odoo.", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

function toFrontendProduct(p: any) {
  // list_price in your migration = Daily Rate
  const dailyRate = typeof p.list_price === "number" ? p.list_price : Number(p.list_price || 0);

  // Image: convert base64 into data URL for direct <img src="">
  const image =
    p.image_1920 ? `data:image/png;base64,${p.image_1920}` : null;

  // Prefer description_sale on SO/web, fallback to description
  const description =
    (p.description_sale && String(p.description_sale).trim()) ||
    (p.description && String(p.description).trim()) ||
    "";

  return {
    id: p.id,
    name: p.name,
    dailyRate,
    description,
    image,
    // categ_id arrives like [id, "Category Name"] from Odoo many2one
    categoryId: Array.isArray(p.categ_id) ? p.categ_id[0] : p.categ_id,
    categoryName: Array.isArray(p.categ_id) ? p.categ_id[1] : undefined,
  };
}
