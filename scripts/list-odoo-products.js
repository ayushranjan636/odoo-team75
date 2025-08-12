// scripts/list-odoo-products.js
require("dotenv").config();
const Odoo = require("odoo-await");

const ODOO_URL = process.env.ODOO_URL || "https://rentkaro2.odoo.com";
const ODOO_DB = process.env.ODOO_DB || "rentkaro2";
const ODOO_USERNAME = process.env.ODOO_USERNAME || "admin";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || "d90be76471da68d1a593859f5435fc993d2bb778";

const odoo = new Odoo({
  baseUrl: ODOO_URL,
  db: ODOO_DB,
  username: ODOO_USERNAME,
  password: ODOO_PASSWORD,
});

async function listProducts() {
  console.log("📋 Listing all products in Odoo...");
  
  try {
    await odoo.connect();
    console.log("✅ Connected to Odoo successfully!");
    
    // Get all products including inactive ones
    const products = await odoo.searchRead("product.template", 
      ["|", ["active", "=", true], ["active", "=", false]], // Get both active and inactive products
      ["id", "name", "list_price", "sale_ok", "active", "type", "create_date"]
    );
    
    console.log(`\n📦 Found ${products.length} total products in Odoo:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id} | Name: "${product.name}" | Price: ₹${product.list_price} | Sale: ${product.sale_ok ? '✅' : '❌'} | Active: ${product.active ? '✅' : '❌'} | Type: ${product.type}`);
    });
    
    // Filter for products that might be our rental products
    const rentalProducts = products.filter(p => 
      p.name.includes('Chair') || 
      p.name.includes('TV') || 
      p.name.includes('Console') ||
      p.name.includes('Desk') ||
      p.name.includes('Table') ||
      p.name.includes('MacBook') ||
      p.name.includes('Camera') ||
      p.name.includes('Sofa') ||
      p.name.includes('Bed') ||
      p.name.includes('Refrigerator') ||
      p.name.includes('Washing') ||
      p.name.includes('Air Conditioner') ||
      p.name.includes('Sound') ||
      p.name.includes('Projector') ||
      p.name.includes('Tent')
    );
    
    if (rentalProducts.length > 0) {
      console.log(`\n🎯 Potential rental products (${rentalProducts.length}):`);
      rentalProducts.forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product.id} | "${product.name}" | ₹${product.list_price}`);
      });
    } else {
      console.log("\n❌ No rental products found. Let's check if any products were created recently:");
      const recentProducts = products.filter(p => {
        const createDate = new Date(p.create_date);
        const today = new Date();
        const diffTime = Math.abs(today - createDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1; // Created in the last day
      });
      
      console.log(`Recent products (last 24 hours): ${recentProducts.length}`);
      recentProducts.forEach((product, index) => {
        console.log(`${index + 1}. ID: ${product.id} | "${product.name}" | ₹${product.list_price} | Created: ${product.create_date}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Failed to list products:", error.message);
  }
}

listProducts().catch((e) => {
  console.error("💥 List script failed:", e);
  process.exit(1);
});
