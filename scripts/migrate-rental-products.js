// scripts/migrate-rental-products.js
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

// --- Category helpers --- //
const RENTAL_ROOT_NAMES = ["Rental", "Rentals"]; // use whichever exists

// simple cache to avoid extra RPCs
const categoryCache = new Map();

async function getOrCreateCategory(name, parentId = false) {
  const cacheKey = `${parentId || 0}|${name.toLowerCase()}`;
  if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey);

  const domain = parentId
    ? [["name", "=", name], ["parent_id", "=", parentId]]
    : [["name", "=", name], ["parent_id", "=", false]];

  const found = await odoo.searchRead("product.category", domain, ["id", "name"]);
  let id;
  if (found.length) {
    id = found[0].id;
  } else {
    const vals = parentId ? { name, parent_id: parentId } : { name };
    id = await odoo.create("product.category", vals);
    console.log(`   📁 Created category "${name}" with ID: ${id}`);
  }
  categoryCache.set(cacheKey, id);
  return id;
}

async function getRentalRootId() {
  const found = await odoo.searchRead(
    "product.category",
    [["name", "in", RENTAL_ROOT_NAMES], ["parent_id", "=", false]],
    ["id", "name"]
  );
  if (found.length) return found[0].id;
  // create "Rental" as the root if not found
  const rootId = await odoo.create("product.category", { name: RENTAL_ROOT_NAMES[0] });
  console.log(`📁 Created root category "Rental" with ID: ${rootId}`);
  return rootId;
}

async function getCategoryUnderRental(childName) {
  const rentalRootId = await getRentalRootId();
  if (!childName) return rentalRootId;
  return await getOrCreateCategory(childName, rentalRootId);
}

// Comprehensive rental products with different categories and pricing
const rentalProducts = [
  // Office Equipment
  {
    name: "Ergonomic Office Chair - Premium",
    description: "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long work sessions and home offices.",
    category: "Office Equipment",
    dailyRate: 250,
    weeklyRate: 1500,
    monthlyRate: 5000,
    image: "/placeholder.jpg",
    features: ["Lumbar Support", "Adjustable Height", "Mesh Back", "360° Swivel"]
  },
  {
    name: "Standing Desk - Electric",
    description: "Electric height-adjustable standing desk with memory presets. Promote better health and productivity in your workspace.",
    category: "Office Equipment",
    dailyRate: 400,
    weeklyRate: 2400,
    monthlyRate: 8000,
    image: "/placeholder.jpg",
    features: ["Electric Adjustment", "Memory Presets", "Cable Management", "Anti-Collision"]
  },
  {
    name: "Conference Table - 8 Seater",
    description: "Professional conference table for 8 people with built-in cable management and modern design.",
    category: "Office Equipment",
    dailyRate: 800,
    weeklyRate: 4800,
    monthlyRate: 15000,
    image: "/placeholder.jpg",
    features: ["Seats 8 People", "Cable Management", "Modern Design", "Scratch Resistant"]
  },

  // Electronics
  {
    name: "4K Smart TV - 55 inch",
    description: "55-inch 4K Smart TV with HDR support, built-in streaming apps, and voice control. Perfect for events and entertainment.",
    category: "Electronics",
    dailyRate: 500,
    weeklyRate: 3000,
    monthlyRate: 10000,
    image: "/placeholder.jpg",
    features: ["4K Resolution", "HDR Support", "Smart TV", "Voice Control"]
  },
  {
    name: "Gaming Console - Latest Gen",
    description: "Latest generation gaming console with 4K gaming support, wireless controllers, and access to thousands of games.",
    category: "Electronics",
    dailyRate: 400,
    weeklyRate: 2400,
    monthlyRate: 8000,
    image: "/placeholder.jpg",
    features: ["4K Gaming", "Wireless Controllers", "Game Library", "Online Multiplayer"]
  },
  {
    name: "MacBook Pro - M3 Chip",
    description: "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for creative work and professional tasks.",
    category: "Electronics",
    dailyRate: 800,
    weeklyRate: 4800,
    monthlyRate: 16000,
    image: "/placeholder.jpg",
    features: ["M3 Chip", "16GB RAM", "512GB SSD", "Retina Display"]
  },
  {
    name: "Professional Camera - DSLR",
    description: "High-end DSLR camera with multiple lenses for photography and videography projects.",
    category: "Electronics",
    dailyRate: 600,
    weeklyRate: 3600,
    monthlyRate: 12000,
    image: "/placeholder.jpg",
    features: ["Full Frame", "4K Video", "Multiple Lenses", "Professional Grade"]
  },

  // Furniture
  {
    name: "Luxury Sofa Set - 3+2",
    description: "Premium leather sofa set with 3-seater and 2-seater. Perfect for events, staging, or temporary accommodation.",
    category: "Furniture",
    dailyRate: 700,
    weeklyRate: 4200,
    monthlyRate: 14000,
    image: "/placeholder.jpg",
    features: ["Genuine Leather", "3+2 Seater", "Premium Quality", "Comfortable"]
  },
  {
    name: "Dining Table Set - 6 Seater",
    description: "Elegant dining table with 6 chairs. Solid wood construction with modern design.",
    category: "Furniture",
    dailyRate: 600,
    weeklyRate: 3600,
    monthlyRate: 12000,
    image: "/placeholder.jpg",
    features: ["Solid Wood", "6 Chairs Included", "Modern Design", "Scratch Resistant"]
  },
  {
    name: "King Size Bed with Mattress",
    description: "Luxury king size bed frame with premium memory foam mattress. Complete sleeping solution.",
    category: "Furniture",
    dailyRate: 500,
    weeklyRate: 3000,
    monthlyRate: 10000,
    image: "/placeholder.jpg",
    features: ["King Size", "Memory Foam", "Premium Frame", "Complete Set"]
  },

  // Appliances
  {
    name: "Refrigerator - Double Door",
    description: "Energy-efficient double door refrigerator with frost-free technology and large capacity.",
    category: "Appliances",
    dailyRate: 300,
    weeklyRate: 1800,
    monthlyRate: 6000,
    image: "/placeholder.jpg",
    features: ["Double Door", "Frost Free", "Energy Efficient", "Large Capacity"]
  },
  {
    name: "Washing Machine - Front Load",
    description: "Automatic front-loading washing machine with multiple wash programs and energy efficiency.",
    category: "Appliances",
    dailyRate: 250,
    weeklyRate: 1500,
    monthlyRate: 5000,
    image: "/placeholder.jpg",
    features: ["Front Load", "Multiple Programs", "Energy Efficient", "Auto Clean"]
  },
  {
    name: "Air Conditioner - Split AC 1.5 Ton",
    description: "Energy-efficient split AC with inverter technology, perfect for cooling medium-sized rooms.",
    category: "Appliances",
    dailyRate: 400,
    weeklyRate: 2400,
    monthlyRate: 8000,
    image: "/placeholder.jpg",
    features: ["1.5 Ton", "Inverter Technology", "Energy Star", "Remote Control"]
  },

  // Event Equipment
  {
    name: "Professional Sound System",
    description: "Complete professional sound system with speakers, mixer, and microphones for events and parties.",
    category: "Event Equipment",
    dailyRate: 1000,
    weeklyRate: 6000,
    monthlyRate: 20000,
    image: "/placeholder.jpg",
    features: ["Professional Grade", "Complete System", "Multiple Microphones", "Bluetooth Enabled"]
  },
  {
    name: "LED Projector - 4K",
    description: "High-brightness 4K LED projector with screen for presentations and entertainment.",
    category: "Event Equipment",
    dailyRate: 600,
    weeklyRate: 3600,
    monthlyRate: 12000,
    image: "/placeholder.jpg",
    features: ["4K Resolution", "High Brightness", "Screen Included", "Multiple Inputs"]
  },
  {
    name: "Party Tent - 20x20 ft",
    description: "Large waterproof party tent for outdoor events, weddings, and celebrations.",
    category: "Event Equipment",
    dailyRate: 800,
    weeklyRate: 4800,
    monthlyRate: 16000,
    image: "/placeholder.jpg",
    features: ["20x20 ft", "Waterproof", "Easy Setup", "Weather Resistant"]
  }
];

async function migrateRentalProducts() {
  console.log("🚀 Starting rental products migration to Odoo...");
  console.log("URL:", ODOO_URL);
  console.log("DB:", ODOO_DB);
  console.log("Username:", ODOO_USERNAME);
  
  try {
    console.log("🔗 Attempting to connect to Odoo...");
    await odoo.connect();
    console.log("✅ Connected to Odoo successfully!");
    
    // First, let's clean up existing test products if any
    console.log("\n🧹 Cleaning up existing test products...");
    const existingTestProducts = await odoo.searchRead("product.template", 
      [["name", "in", ["Ergonomic Office Chair", "4K Smart TV", "Gaming Console"]]], 
      ["id", "name"]
    );
    
    for (const product of existingTestProducts) {
      await odoo.delete("product.template", [product.id]);
      console.log(`🗑️  Deleted test product: ${product.name}`);
    }
    
    let successCount = 0;
    let skippedCount = 0;
    
    // Migrate all rental products
    for (const product of rentalProducts) {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // Check if product already exists
      const existingProducts = await odoo.searchRead("product.template", 
        [["name", "=", product.name]], 
        ["id", "name"]
      );
      
      if (existingProducts.length > 0) {
        console.log(`⚠️  Product "${product.name}" already exists with ID: ${existingProducts[0].id}`);
        skippedCount++;
        continue;
      }
      
      // Calculate hourly rate (daily rate / 8 hours)
      const hourlyRate = Math.round(product.dailyRate / 8);
      
      // 👇 ensure each product goes to Rental / <product.category>
      const categId = await getCategoryUnderRental(product.category);
      
      const odooProduct = {
        name: product.name,
        description: product.description, // Use description_sale if you want it on SO lines; 'description' is internal notes
        list_price: product.dailyRate, // Default price is daily rate
        type: 'consu', // Consumable type for rental products (switch to 'product' if you stock-track rentals)
        categ_id: categId, // ✅ put it in Rental category (with subcategory)
        
        // Use standard fields that should exist
        sale_ok: true, // Can be sold
        purchase_ok: false, // Not for purchase (rental only)
        invoice_policy: 'delivery', // Invoice on delivery
      };

      try {
        const id = await odoo.create("product.template", odooProduct);
        console.log(`✅ Created "${product.name}" with ID: ${id}`);
        console.log(`   📁 Category: Rental / ${product.category}`);
        console.log(`   💰 Rates - Hourly: ₹${hourlyRate}, Daily: ₹${product.dailyRate}, Weekly: ₹${product.weeklyRate}, Monthly: ₹${product.monthlyRate}`);
        
        // Optional: if you use Odoo Rental app, try enabling rent flag (ignored if field doesn't exist)
        try {
          await odoo.update("product.template", [id], { rent_ok: true });
          console.log(`   🏷️  Rental flag enabled`);
        } catch {
          // Field not present – skip silently
          console.log(`   ⚠️  Rental flag field not available (normal if rental module not installed)`);
        }
        
        successCount++;
      } catch (createError) {
        console.error(`❌ Failed to create "${product.name}":`, createError.message);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully created: ${successCount} products`);
    console.log(`⚠️  Skipped (already exist): ${skippedCount} products`);
    console.log(`📊 Total products processed: ${rentalProducts.length}`);
    
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error("Error message:", error.message);
  }

  console.log("\n🏁 Rental products migration finished.");
}

migrateRentalProducts().catch((e) => {
  console.error("💥 Migration script failed:", e);
  process.exit(1);
});
