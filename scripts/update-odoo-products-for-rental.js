// scripts/update-odoo-products-for-rental.js
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

async function updateProductsForRental() {
  console.log("🔧 Starting Odoo products rental configuration update...");
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
      ["id", "name", "list_price", "rent_ok"]
    );
    
    console.log(`✅ Found ${products.length} products in Odoo`);
    
    let updatedCount = 0;
    let pricingCount = 0;
    
    for (const product of products) {
      console.log(`\n📦 Updating: ${product.name} (ID: ${product.id})`);
      
      const pricingConfig = rentalPricingConfig[product.name];
      if (!pricingConfig) {
        console.log(`⚠️  No pricing config found for ${product.name}`);
        continue;
      }
      
      try {
        // Step 1: Enable rental and sale for the product
        console.log("   🔧 Enabling rental and sale option...");
        await odoo.update("product.template", [product.id], {
          rent_ok: true, // Enable rental
          sale_ok: true, // Ensure product is available for sale/listing
          active: true,  // Ensure product is active
          // invoice_policy: 'delivery', // Invoice on delivery
        });
        
        console.log("   ✅ Rental and sale enabled");
        
        // Step 2: Check if rental pricing model exists and create pricing records
        try {
          console.log("   💰 Setting up rental pricing...");
          
          // Try to create rental pricing records (this might vary based on Odoo rental module)
          // Different Odoo rental modules may have different models
          
          // Option 1: Try product.rental.pricing model
          try {
            const hourlyPriceId = await odoo.create("product.rental.pricing", {
              product_id: product.id,
              duration: 1,
              unit: 'hour',
              price: pricingConfig.hourly,
            });
            console.log(`   ✅ Created hourly pricing (ID: ${hourlyPriceId})`);
            
            const dailyPriceId = await odoo.create("product.rental.pricing", {
              product_id: product.id,
              duration: 1,
              unit: 'day',
              price: pricingConfig.daily,
            });
            console.log(`   ✅ Created daily pricing (ID: ${dailyPriceId})`);
            
            const weeklyPriceId = await odoo.create("product.rental.pricing", {
              product_id: product.id,
              duration: 1,
              unit: 'week',
              price: pricingConfig.weekly,
            });
            console.log(`   ✅ Created weekly pricing (ID: ${weeklyPriceId})`);
            
            const monthlyPriceId = await odoo.create("product.rental.pricing", {
              product_id: product.id,
              duration: 1,
              unit: 'month',
              price: pricingConfig.monthly,
            });
            console.log(`   ✅ Created monthly pricing (ID: ${monthlyPriceId})`);
            
            pricingCount += 4;
            
          } catch (pricingError) {
            console.log(`   ⚠️  Standard rental pricing model not available: ${pricingError.message}`);
            
            // Option 2: Try alternative approach with custom fields
            try {
              await odoo.update("product.template", [product.id], {
                // Try custom fields if they exist
                x_rental_price_hourly: pricingConfig.hourly,
                x_rental_price_daily: pricingConfig.daily,
                x_rental_price_weekly: pricingConfig.weekly,
                x_rental_price_monthly: pricingConfig.monthly,
              });
              console.log("   ✅ Set custom rental pricing fields");
              pricingCount++;
            } catch (customError) {
              console.log(`   ⚠️  Custom pricing fields not available: ${customError.message}`);
              
              // Option 3: At minimum, update the main price to daily rate
              await odoo.update("product.template", [product.id], {
                list_price: pricingConfig.daily, // Set main price to daily rate
              });
              console.log("   ✅ Updated main price to daily rate");
            }
          }
          
        } catch (error) {
          console.log(`   ❌ Failed to set pricing: ${error.message}`);
        }
        
        updatedCount++;
        console.log(`   💰 Pricing - Hourly: ₹${pricingConfig.hourly}, Daily: ₹${pricingConfig.daily}, Weekly: ₹${pricingConfig.weekly}, Monthly: ₹${pricingConfig.monthly}`);
        
      } catch (updateError) {
        console.error(`   ❌ Failed to update ${product.name}:`, updateError.message);
      }
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`✅ Products updated for rental: ${updatedCount}/${products.length}`);
    console.log(`💰 Pricing configurations set: ${pricingCount}`);
    
    // Verify the changes
    console.log(`\n🔍 Verifying rental configuration...`);
    const verifyProducts = await odoo.searchRead("product.template", 
      [["name", "in", productNames], ["rent_ok", "=", true]], 
      ["id", "name", "rent_ok", "list_price"]
    );
    
    console.log(`✅ Verified: ${verifyProducts.length} products are now rental-enabled`);
    
    verifyProducts.forEach(p => {
      console.log(`   📋 ${p.name} - Rental: ${p.rent_ok ? '✅' : '❌'} - Price: ₹${p.list_price}`);
    });
    
  } catch (error) {
    console.error("❌ Update failed:");
    console.error("Error message:", error.message);
  }

  console.log("\n🏁 Rental configuration update finished.");
}

updateProductsForRental().catch((e) => {
  console.error("💥 Update script failed:", e);
  process.exit(1);
});
