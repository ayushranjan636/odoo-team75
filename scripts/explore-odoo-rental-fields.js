// scripts/explore-odoo-rental-fields.js
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

async function exploreRentalFields() {
  console.log("🔍 Exploring Odoo rental fields and models...");
  
  try {
    await odoo.connect();
    console.log("✅ Connected to Odoo successfully!");
    
    // Check what fields are available on product.template
    console.log("\n📋 Checking product.template fields...");
    
    const productFields = await odoo.searchRead("ir.model.fields", 
      [["model", "=", "product.template"], ["name", "ilike", "rent"]], 
      ["name", "field_description", "ttype"]
    );
    
    console.log(`Found ${productFields.length} rental-related fields on product.template:`);
    productFields.forEach(field => {
      console.log(`   📝 ${field.name} (${field.ttype}): ${field.field_description}`);
    });
    
    // Check for rental-related models
    console.log("\n🏗️  Checking for rental-related models...");
    
    const rentalModels = await odoo.searchRead("ir.model", 
      [["model", "ilike", "rental"]], 
      ["model", "name"]
    );
    
    console.log(`Found ${rentalModels.length} rental-related models:`);
    rentalModels.forEach(model => {
      console.log(`   🏷️  ${model.model}: ${model.name}`);
    });
    
    // Check product records to see current structure
    console.log("\n📦 Checking current product structure...");
    const sampleProducts = await odoo.searchRead("product.template", 
      [["name", "ilike", "Chair"]], 
      ["id", "name", "list_price"],
      0, 2 // Limit to 2 records
    );
    
    if (sampleProducts.length > 0) {
      console.log(`Sample product data:`);
      sampleProducts.forEach(product => {
        console.log(`   📋 ID: ${product.id}, Name: ${product.name}, Price: ${product.list_price}`);
      });
      
      // Get all available fields for the first product
      console.log("\n📋 All available fields for product.template:");
      const allFields = await odoo.searchRead("ir.model.fields", 
        [["model", "=", "product.template"]], 
        ["name", "field_description", "ttype"]
      );
      
      // Filter for potentially rental-related fields
      const potentialRentalFields = allFields.filter(field => 
        field.name.toLowerCase().includes('rent') || 
        field.name.toLowerCase().includes('price') ||
        field.name.toLowerCase().includes('sale') ||
        field.field_description.toLowerCase().includes('rent')
      );
      
      console.log(`\n🎯 Potential rental-related fields (${potentialRentalFields.length}):`);
      potentialRentalFields.forEach(field => {
        console.log(`   📝 ${field.name} (${field.ttype}): ${field.field_description}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Exploration failed:", error.message);
  }
}

exploreRentalFields().catch((e) => {
  console.error("💥 Exploration script failed:", e);
  process.exit(1);
});
