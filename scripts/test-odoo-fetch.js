// scripts/test-odoo-fetch.js
require("dotenv").config();
const Odoo = require("odoo-await");

const ODOO_URL = process.env.ODOO_URL || "https://rentkar2.odoo.com";
const ODOO_DB = process.env.ODOO_DB || "rentkar2";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "ayushranjan535@gmail.com";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || "d90be76471da68d1a593859f5435fc993d2bb778";

const odoo = new Odoo({
  baseUrl: ODOO_URL,
  db: ODOO_DB,
  username: ODOO_USERNAME,
  password: ODOO_PASSWORD,
});

const RENTAL_ROOT_NAMES = ["Rental", "Rentals"];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function testOdooFetch() {
  console.log("🔍 Testing Odoo product fetch...");
  console.log("URL:", ODOO_URL);
  console.log("DB:", ODOO_DB);
  console.log("Username:", ODOO_USERNAME);
  
  try {
    console.log("\n🔗 Connecting to Odoo...");
    await odoo.connect();
    console.log("✅ Connected successfully!");

    // 1) Test: Get all product categories first
    console.log("\n📁 Fetching all product categories...");
    const allCategories = await odoo.searchRead(
      "product.category",
      [],
      ["id", "name", "parent_id"]
    );
    
    console.log(`✅ Found ${allCategories.length} categories total:`);
    allCategories.forEach(cat => {
      const parentInfo = cat.parent_id ? ` (parent: ${cat.parent_id[1]})` : " (root)";
      console.log(`   - ID ${cat.id}: "${cat.name}"${parentInfo}`);
    });

    // 2) Test: Fetch ALL products regardless of category
    console.log("\n� Fetching ALL products (no category filter)...");
    
    // First, let's get a sample product to see all available fields
    const sampleProducts = await odoo.searchRead(
      "product.template",
      [],
      [], // Empty fields list to get ALL fields
      0, // offset
      2   // limit to just 2 products to see structure
    );

    if (sampleProducts.length > 0) {
      console.log("\n🔍 SAMPLE PRODUCT STRUCTURE (showing all available fields):");
      console.log("=" * 60);
      console.log("Sample Product 1:");
      console.log(JSON.stringify(sampleProducts[0], null, 2));
      if (sampleProducts.length > 1) {
        console.log("\nSample Product 2:");
        console.log(JSON.stringify(sampleProducts[1], null, 2));
      }
    }

    // 3) Now fetch all products with basic fields only
    const products = await odoo.searchRead(
      "product.template",
      [], // No filter - get ALL products
      [
        "id", "name", "list_price", "standard_price",
        "description", "description_sale",
        "categ_id", "type", "uom_id",
        "sale_ok", "purchase_ok", "active",
        "image_1920",
        "default_code", "barcode",
        "create_date", "write_date"
      ]
    );

    console.log(`✅ Found ${products.length} products total\n`);

    // 4) Group products by category
    const categoryMap = new Map();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    const productsByCategory = new Map();

    // Group products by category
    products.forEach(p => {
      const categoryId = Array.isArray(p.categ_id) ? p.categ_id[0] : p.categ_id;
      const categoryName = Array.isArray(p.categ_id) ? p.categ_id[1] : "Unknown";
      
      if (!productsByCategory.has(categoryId)) {
        productsByCategory.set(categoryId, []);
      }
      productsByCategory.get(categoryId).push({
        ...p,
        categoryId,
        categoryName
      });
    });

    // 5) Display detailed results
    console.log("📊 ALL PRODUCTS BY CATEGORY:");
    console.log("=" * 70);
    
    productsByCategory.forEach((prods, categoryId) => {
      const category = categoryMap.get(categoryId);
      const categoryName = category ? category.name : "Unknown Category";
      
      console.log(`\n📂 ${categoryName} (${prods.length} products)`);
      console.log("   Products:");
      
      prods.forEach(p => {
        console.log(`\n     🔸 ${p.name} (ID: ${p.id})`);
        console.log(`       • Price: ₹${p.list_price || 0}`);
        console.log(`       • Standard Price: ₹${p.standard_price || 0}`);
        console.log(`       • Type: ${p.type || "N/A"}`);
        console.log(`       • Sale OK: ${p.sale_ok}`);
        console.log(`       • Purchase OK: ${p.purchase_ok}`);
        console.log(`       • Active: ${p.active}`);
        console.log(`       • Default Code: ${p.default_code || "N/A"}`);
        console.log(`       • Barcode: ${p.barcode || "N/A"}`);
        console.log(`       • UOM: ${Array.isArray(p.uom_id) ? p.uom_id[1] : p.uom_id || "N/A"}`);
        console.log(`       • Created: ${p.create_date || "N/A"}`);
        console.log(`       • Updated: ${p.write_date || "N/A"}`);
        console.log(`       • Has Image: ${p.image_1920 ? "Yes" : "No"}`);
        console.log(`       • Description Sale: ${p.description_sale ? p.description_sale.substring(0, 80) + "..." : "N/A"}`);
        console.log(`       • Description: ${p.description ? p.description.substring(0, 80) + "..." : "N/A"}`);
      });
    });

    // 6) Summary by type and status
    console.log("\n🎯 PRODUCT SUMMARY:");
    console.log("=" * 50);
    
    const summary = {
      total: products.length,
      byType: {},
      byStatus: {
        active: 0,
        inactive: 0,
        sale_ok: 0,
        purchase_ok: 0
      },
      categories: productsByCategory.size,
      withImages: 0,
      withDescriptions: 0
    };

    products.forEach(p => {
      // Count by type
      const type = p.type || "unknown";
      summary.byType[type] = (summary.byType[type] || 0) + 1;
      
      // Count by status
      if (p.active) summary.byStatus.active++;
      else summary.byStatus.inactive++;
      
      if (p.sale_ok) summary.byStatus.sale_ok++;
      if (p.purchase_ok) summary.byStatus.purchase_ok++;
      
      // Count features
      if (p.image_1920) summary.withImages++;
      if (p.description || p.description_sale) summary.withDescriptions++;
    });

    console.log(`   � Total Products: ${summary.total}`);
    console.log(`   📁 Categories: ${summary.categories}`);
    console.log(`   🏷️  Product Types:`);
    Object.entries(summary.byType).forEach(([type, count]) => {
      console.log(`      - ${type}: ${count}`);
    });
    console.log(`   ✅ Active: ${summary.byStatus.active}`);
    console.log(`   ❌ Inactive: ${summary.byStatus.inactive}`);
    console.log(`   🛒 Can Sell: ${summary.byStatus.sale_ok}`);
    console.log(`   🛍️  Can Purchase: ${summary.byStatus.purchase_ok}`);
    console.log(`   🖼️  With Images: ${summary.withImages}`);
    console.log(`   📝 With Descriptions: ${summary.withDescriptions}`);

  } catch (error) {
    console.error("❌ Error during fetch test:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
}

testOdooFetch().catch(e => {
  console.error("💥 Script failed:", e);
  process.exit(1);
});
