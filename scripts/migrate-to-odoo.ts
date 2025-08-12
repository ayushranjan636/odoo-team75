// scripts/migrate-to-odoo.ts
import dotenv from "dotenv";
dotenv.config();

import odoo, { connectToOdoo } from "../lib/odoo";
import { Product } from "../lib/types";

// This is a temporary import to get the mock data.
// It will be removed after the migration.
import { allMockProducts } from "../lib/mock-data";

async function migrateProducts() {
  console.log("Starting product migration to Odoo...");
  
  try {
    await connectToOdoo();
    console.log("Connected to Odoo successfully!");
    
    // Test with just one product first
    const testProduct = allMockProducts[0];
    console.log("Testing with product:", testProduct.name);
    
    const odooProduct = {
      name: testProduct.name,
      description: testProduct.description,
      list_price: testProduct.salesPrice,
      // Add other fields as necessary
    };

    const id = await odoo.create("product.template", odooProduct);
    console.log(`Created product "${testProduct.name}" with ID: ${id}`);
    
  } catch (error) {
    console.error("Migration failed:", error);
  }

  console.log("Product migration finished.");
}

migrateProducts().catch((e) => {
  console.error("Migration script failed:", e);
  process.exit(1);
});
