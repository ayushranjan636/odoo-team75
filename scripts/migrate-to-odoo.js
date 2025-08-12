// scripts/migrate-to-odoo.js
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

// Test products to migrate
const testProducts = [
  {
    name: "Ergonomic Office Chair",
    description: "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long work sessions.",
    salesPrice: 15000,
  },
  {
    name: "4K Smart TV", 
    description: "55-inch 4K Smart TV with HDR support, built-in streaming apps, and voice control. Transform your entertainment experience.",
    salesPrice: 45000,
  },
  {
    name: "Gaming Console",
    description: "Latest generation gaming console with 4K gaming support, wireless controllers, and access to thousands of games.",
    salesPrice: 35000,
  }
];

async function migrateProducts() {
  console.log("Starting product migration to Odoo...");
  console.log("URL:", ODOO_URL);
  console.log("DB:", ODOO_DB);
  console.log("Username:", ODOO_USERNAME);
  
  try {
    console.log("Attempting to connect to Odoo...");
    await odoo.connect();
    console.log("✅ Connected to Odoo successfully!");
    
    // Migrate all products
    for (const product of testProducts) {
      console.log(`\nMigrating product: ${product.name}`);
      
      // Check if product already exists
      const existingProducts = await odoo.searchRead("product.template", [["name", "=", product.name]], ["id", "name"]);
      
      if (existingProducts.length > 0) {
        console.log(`⚠️  Product "${product.name}" already exists with ID: ${existingProducts[0].id}`);
        continue;
      }
      
      const odooProduct = {
        name: product.name,
        description: product.description,
        list_price: product.salesPrice,
        type: 'consu', // 'consu' = consumable, 'service' = service
      };

      const id = await odoo.create("product.template", odooProduct);
      console.log(`✅ Created product "${product.name}" with ID: ${id}`);
    }
    
    console.log("\n🎉 All products migrated successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error("Error message:", error.message);
  }

  console.log("Product migration finished.");
}

migrateProducts().catch((e) => {
  console.error("Migration script failed:", e);
  process.exit(1);
});
