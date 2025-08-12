// scripts/simple-rental-update.js
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

// Rental pricing configurations for different product types
const rentalPricingConfig = {
  "Ergonomic Office Chair - Premium": { hourly: 31, daily: 250, weekly: 1500, monthly: 5000 },
  "Standing Desk - Electric": { hourly: 50, daily: 400, weekly: 2400, monthly: 8000 },
  "Conference Table - 8 Seater": { hourly: 100, daily: 800, weekly: 4800, monthly: 15000 },
  "4K Smart TV - 55 inch": { hourly: 63, daily: 500, weekly: 3000, monthly: 10000 },
  "Gaming Console - Latest Gen": { hourly: 50, daily: 400, weekly: 2400, monthly: 8000 },
  "MacBook Pro - M3 Chip": { hourly: 100, daily: 800, weekly: 4800, monthly: 16000 },
  "Professional Camera - DSLR": { hourly: 75, daily: 600, weekly: 3600, monthly: 12000 },
  "Luxury Sofa Set - 3+2": { hourly: 88, daily: 700, weekly: 4200, monthly: 14000 },
  "Dining Table Set - 6 Seater": { hourly: 75, daily: 600, weekly: 3600, monthly: 12000 },
  "King Size Bed with Mattress": { hourly: 63, daily: 500, weekly: 3000, monthly: 10000 },
  "Refrigerator - Double Door": { hourly: 38, daily: 300, weekly: 1800, monthly: 6000 },
  "Washing Machine - Front Load": { hourly: 31, daily: 250, weekly: 1500, monthly: 5000 },
  "Air Conditioner - Split AC 1.5 Ton": { hourly: 50, daily: 400, weekly: 2400, monthly: 8000 },
  "Professional Sound System": { hourly: 125, daily: 1000, weekly: 6000, monthly: 20000 },
  "LED Projector - 4K": { hourly: 75, daily: 600, weekly: 3600, monthly: 12000 },
  "Party Tent - 20x20 ft": { hourly: 100, daily: 800, weekly: 4800, monthly: 16000 },
};

async function simpleRentalUpdate() {
  console.log("🛠️  Starting simple rental configuration update...");
  console.log("URL:", ODOO_URL);
  console.log("DB:", ODOO_DB);
  console.log("Username:", ODOO_USERNAME);
  
  try {
    console.log("🔗 Attempting to connect to Odoo...");
    await odoo.connect();
    console.log("✅ Connected to Odoo successfully!");
    
    // Find all our rental products
    const productNames = Object.keys(rentalPricingConfig);
    console.log(`\n🔍 Looking for ${productNames.length} rental products...`);
    
    const products = await odoo.searchRead("product.template", 
      [["name", "in", productNames]], 
      ["id", "name", "list_price", "sale_ok", "purchase_ok"]
    );
    
    console.log(`✅ Found ${products.length} products in Odoo`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      console.log(`\n📦 Updating: ${product.name} (ID: ${product.id})`);
      
      const pricingConfig = rentalPricingConfig[product.name];
      if (!pricingConfig) {
        console.log(`⚠️  No pricing config found for ${product.name}`);
        continue;
      }
      
      try {
        // Update product with rental-friendly configuration
        const updateData = {
          sale_ok: true, // Can be sold/rented
          purchase_ok: true, // Can be purchased (for inventory)
          list_price: pricingConfig.daily, // Set main price to daily rate
          type: 'consu', // Consumable type (good for rental tracking)
          // Add description with rental pricing info
          description: `${product.description || ''}\n\nRental Rates:\n- Hourly: ₹${pricingConfig.hourly}\n- Daily: ₹${pricingConfig.daily}\n- Weekly: ₹${pricingConfig.weekly}\n- Monthly: ₹${pricingConfig.monthly}`,
        };
        
        // Try to add custom fields if they exist
        try {
          // These might work if custom fields have been created
          updateData.x_rental_hourly = pricingConfig.hourly;
          updateData.x_rental_daily = pricingConfig.daily;
          updateData.x_rental_weekly = pricingConfig.weekly;
          updateData.x_rental_monthly = pricingConfig.monthly;
          updateData.x_is_rental = true;
        } catch (customFieldError) {
          // Ignore if custom fields don't exist
        }
        
        await odoo.update("product.template", [product.id], updateData);
        
        console.log("   ✅ Product updated successfully");
        console.log(`   💰 Daily rate set to: ₹${pricingConfig.daily}`);
        console.log(`   📝 Description updated with rental rates`);
        
        updatedCount++;
        
      } catch (updateError) {
        console.error(`   ❌ Failed to update ${product.name}:`, updateError.message);
      }
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`✅ Products updated: ${updatedCount}/${products.length}`);
    
    // Verify the changes
    console.log(`\n🔍 Verifying updates...`);
    const verifyProducts = await odoo.searchRead("product.template", 
      [["name", "in", productNames]], 
      ["id", "name", "list_price", "sale_ok", "type"]
    );
    
    console.log(`✅ Verification complete:`);
    verifyProducts.forEach(p => {
      const pricingConfig = rentalPricingConfig[p.name];
      const isCorrectPrice = pricingConfig && p.list_price === pricingConfig.daily;
      console.log(`   📋 ${p.name} - Price: ₹${p.list_price} ${isCorrectPrice ? '✅' : '⚠️'} - Sale: ${p.sale_ok ? '✅' : '❌'} - Type: ${p.type}`);
    });
    
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Products are now configured with daily rental rates as the main price`);
    console.log(`   2. Rental pricing information has been added to product descriptions`);
    console.log(`   3. Your website will now show these products with proper pricing`);
    console.log(`   4. You may need to manually enable rental features in Odoo if a rental module is available`);
    
  } catch (error) {
    console.error("❌ Update failed:");
    console.error("Error message:", error.message);
  }

  console.log("\n🏁 Rental configuration update finished.");
}

simpleRentalUpdate().catch((e) => {
  console.error("💥 Update script failed:", e);
  process.exit(1);
});
