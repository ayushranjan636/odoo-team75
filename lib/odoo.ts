// lib/odoo.ts
// Central Odoo integration helper
// Fixes: environment mismatch, missing ensureOdooConnected export, repeated connections.
import Odoo from "odoo-await";
import { Product, Order, Reservation } from "./types";

// Helper function to determine category from product name
const getCategoryFromName = (name: string): Product["category"] => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("chair") || lowerName.includes("desk") || lowerName.includes("table") || 
      lowerName.includes("sofa") || lowerName.includes("bed") || lowerName.includes("furniture")) {
    return "Furniture";
  }
  if (lowerName.includes("tv") || lowerName.includes("console") || lowerName.includes("macbook") || 
      lowerName.includes("camera") || lowerName.includes("projector") || lowerName.includes("sound")) {
    return "Electronics";
  }
  if (lowerName.includes("refrigerator") || lowerName.includes("washing") || lowerName.includes("air conditioner") || 
      lowerName.includes("appliance")) {
    return "Appliances";
  }
  if (lowerName.includes("tent") || lowerName.includes("event") || lowerName.includes("party")) {
    return "Baby & Kids"; // Using this as a catch-all for event equipment
  }
  
  return "Furniture"; // Default category
};

// Prefer explicit env; do NOT silently swap db names (avoid accidental empty DB usage)
const ODOO_URL = process.env.ODOO_URL?.trim() || "https://rentkar2.odoo.com"; // current populated DB
const ODOO_DB = process.env.ODOO_DB?.trim() || "rentkar2";
const ODOO_USERNAME = process.env.ODOO_USERNAME?.trim() || "ayushranjan535@gmail.com";
const ODOO_PASSWORD = (process.env.ODOO_PASSWORD || process.env.ODOO_API_KEY || "d90be76471da68d1a593859f5435fc993d2bb778").trim();

const odoo = new Odoo({ baseUrl: ODOO_URL, db: ODOO_DB, username: ODOO_USERNAME, password: ODOO_PASSWORD });

let _connected = false;
let _connectingPromise: Promise<any> | null = null;

/** Ensure a single successful connection (idempotent). */
export const ensureOdooConnected = async () => {
  if (_connected) return odoo;
  if (_connectingPromise) return _connectingPromise;
  _connectingPromise = (async () => {
    try {
      await odoo.connect();
      _connected = true;
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Odoo] Connected -> ${ODOO_URL} (db=${ODOO_DB}, user=${ODOO_USERNAME})`);
      }
      return odoo;
    } catch (err) {
      _connectingPromise = null;
      console.error("[Odoo] Connection failed:", (err as any)?.message || err);
      throw err;
    }
  })();
  return _connectingPromise;
};

// Backwards compatibility with earlier code referencing connectToOdoo
export const connectToOdoo = ensureOdooConnected;

export const getOdooProducts = async (): Promise<Product[]> => {
  try {
    await ensureOdooConnected();

    // Fetch only active + sale_ok templates (storable or consumable)
  // Start with permissive domain; we will filter in JS to surface data even if flags vary
  const domain: any[] = [];

    const fields = [
      "name", "description", "list_price", "id", "categ_id", "sale_ok", "active"
    ];

    const products = await odoo.searchRead("product.template", domain, fields);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Odoo] Raw product count fetched: ${products.length}`);
    }

    if (!products.length) {
      console.warn("[Odoo] No products returned (domain=", JSON.stringify(domain), ") DB=", ODOO_DB);
      console.log("[Odoo] Falling back to mock data for development");
      return getMockProducts();
    }

    // Collect and fetch categories
    const categoryIds = [...new Set(products.map((p: any) => Array.isArray(p.categ_id) ? p.categ_id[0] : p.categ_id).filter(Boolean))];
    let categoryMap = new Map<number, any>();
    if (categoryIds.length) {
      const categories = await odoo.searchRead("product.category", [["id", "in", categoryIds]], ["id", "name", "parent_id"]);
      categories.forEach((c: any) => categoryMap.set(c.id, c));
    }

    const mapCategory = (cat: any): Product["category"] => {
      if (!cat) return "Furniture"; // default bucket
      const n = String(cat.name).toLowerCase();
      if (/sofa|chair|table|bed|furniture|office/.test(n)) return "Furniture";
      if (/tv|console|macbook|camera|projector|sound|electronic/.test(n)) return "Electronics";
      if (/refrigerator|washing|air conditioner|appliance/.test(n)) return "Appliances";
      if (/fitness|gym|sport/.test(n)) return "Fitness";
      if (/baby|kid/.test(n)) return "Baby & Kids";
      if (/package|bundle/.test(n)) return "Packages";
      if (/event|tent|party/.test(n)) return "Baby & Kids"; // provisional mapping
      return "Furniture";
    };

    const nowIso = new Date().toISOString();

  return products.filter((p: any) => p.sale_ok !== false && p.active !== false).map((p: any) => {
      const catId = Array.isArray(p.categ_id) ? p.categ_id[0] : p.categ_id;
      const cat = categoryMap.get(catId);
      const frontendCategory = mapCategory(cat);
      const price = p.list_price || 0;
      return {
        id: String(p.id),
        name: p.name,
        description: p.description || "",
        salesPrice: price,
        images: ["/placeholder.jpg"],
        slug: p.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
        attributes: {},
        category: frontendCategory,
        relatedProducts: [],
        sustainability: {
          co2_new: 25, // simplified static placeholder
          co2_reuse: 60,
          weight_kg: 10,
          waste_factor: 0.2,
          retail_cost: price * 5,
        },
        internalRef: String(p.id),
        cost: price * 0.6,
        qtyOnHand: 10,
        qtyForecasted: 10,
        rentable: true,
        createdAt: nowIso,
        pricePerTenure: price,
        availabilityStatus: "green",
      } as Product;
    });
  } catch (err) {
    console.error("[Odoo] getOdooProducts failed:", (err as any)?.message || err);
    console.log("[Odoo] Falling back to mock data for development");
    return getMockProducts();
  }
};

const getMockProducts = (): Product[] => {
  const nowIso = new Date().toISOString();
  
  return [
    {
      id: "mock-1",
      name: "Ergonomic Office Chair - Premium",
      description: "Premium ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long work sessions and home offices.",
      salesPrice: 250,
      images: ["/placeholder.jpg"],
      slug: "ergonomic-office-chair-premium",
      attributes: {},
      category: "Furniture",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 10, waste_factor: 0.2, retail_cost: 1250 },
      internalRef: "mock-1",
      cost: 150,
      qtyOnHand: 10,
      qtyForecasted: 10,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 250,
      availabilityStatus: "green",
    },
    {
      id: "mock-2",
      name: "4K Smart TV - 55 inch",
      description: "55-inch 4K Smart TV with HDR support, built-in streaming apps, and voice control. Perfect for events and entertainment.",
      salesPrice: 500,
      images: ["/placeholder.jpg"],
      slug: "4k-smart-tv-55-inch",
      attributes: {},
      category: "Electronics",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 15, waste_factor: 0.2, retail_cost: 2500 },
      internalRef: "mock-2",
      cost: 300,
      qtyOnHand: 5,
      qtyForecasted: 5,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 500,
      availabilityStatus: "green",
    },
    {
      id: "mock-3",
      name: "Standing Desk - Electric",
      description: "Electric height-adjustable standing desk with memory presets. Promote better health and productivity in your workspace.",
      salesPrice: 400,
      images: ["/placeholder.jpg"],
      slug: "standing-desk-electric",
      attributes: {},
      category: "Furniture",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 25, waste_factor: 0.2, retail_cost: 2000 },
      internalRef: "mock-3",
      cost: 240,
      qtyOnHand: 8,
      qtyForecasted: 8,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 400,
      availabilityStatus: "green",
    },
    {
      id: "mock-4",
      name: "Gaming Console - Latest Gen",
      description: "Latest generation gaming console with 4K gaming support, wireless controllers, and access to thousands of games.",
      salesPrice: 400,
      images: ["/placeholder.jpg"],
      slug: "gaming-console-latest-gen",
      attributes: {},
      category: "Electronics",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 5, waste_factor: 0.2, retail_cost: 2000 },
      internalRef: "mock-4",
      cost: 240,
      qtyOnHand: 6,
      qtyForecasted: 6,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 400,
      availabilityStatus: "green",
    },
    {
      id: "mock-5",
      name: "MacBook Pro - M3 Chip",
      description: "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for creative work and professional tasks.",
      salesPrice: 800,
      images: ["/placeholder.jpg"],
      slug: "macbook-pro-m3-chip",
      attributes: {},
      category: "Electronics",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 2, waste_factor: 0.2, retail_cost: 4000 },
      internalRef: "mock-5",
      cost: 480,
      qtyOnHand: 3,
      qtyForecasted: 3,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 800,
      availabilityStatus: "green",
    },
    {
      id: "mock-6",
      name: "Luxury Sofa Set - 3+2",
      description: "Premium leather sofa set with 3-seater and 2-seater. Perfect for events, staging, or temporary accommodation.",
      salesPrice: 700,
      images: ["/placeholder.jpg"],
      slug: "luxury-sofa-set-3-2",
      attributes: {},
      category: "Furniture",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 50, waste_factor: 0.2, retail_cost: 3500 },
      internalRef: "mock-6",
      cost: 420,
      qtyOnHand: 4,
      qtyForecasted: 4,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 700,
      availabilityStatus: "green",
    },
    {
      id: "mock-7",
      name: "Refrigerator - Double Door",
      description: "Energy-efficient double door refrigerator with frost-free technology and large capacity.",
      salesPrice: 300,
      images: ["/placeholder.jpg"],
      slug: "refrigerator-double-door",
      attributes: {},
      category: "Appliances",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 60, waste_factor: 0.2, retail_cost: 1500 },
      internalRef: "mock-7",
      cost: 180,
      qtyOnHand: 7,
      qtyForecasted: 7,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 300,
      availabilityStatus: "green",
    },
    {
      id: "mock-8",
      name: "Air Conditioner - Split AC 1.5 Ton",
      description: "Energy-efficient split AC with inverter technology, perfect for cooling medium-sized rooms.",
      salesPrice: 400,
      images: ["/placeholder.jpg"],
      slug: "air-conditioner-split-ac-15-ton",
      attributes: {},
      category: "Appliances",
      relatedProducts: [],
      sustainability: { co2_new: 25, co2_reuse: 60, weight_kg: 30, waste_factor: 0.2, retail_cost: 2000 },
      internalRef: "mock-8",
      cost: 240,
      qtyOnHand: 12,
      qtyForecasted: 12,
      rentable: true,
      createdAt: nowIso,
      pricePerTenure: 400,
      availabilityStatus: "green",
    }
  ];
};

export const createOdooQuotation = async (quotationData: {
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    qty: number;
    pricePerUnit: number;
    tenureType: string;
    startDate: string;
    endDate: string;
    deposit: number;
  }>;
  notes?: string;
  validUntil?: string;
}): Promise<any> => {
  try {
    await ensureOdooConnected();
    
    // First, create or find the customer (partner)
    let partnerId;
    try {
      const existingPartners = await odoo.searchRead("res.partner", [
        ["email", "=", quotationData.customerInfo.email]
      ], ["id", "name"]) as Array<{ id: number; name: string }>;
      
      if (existingPartners.length > 0) {
        partnerId = existingPartners[0].id;
      } else {
        // Create new partner
        partnerId = await odoo.create("res.partner", {
          name: quotationData.customerInfo.name,
          email: quotationData.customerInfo.email,
          phone: quotationData.customerInfo.phone || "",
          street: quotationData.customerInfo.address || "",
          is_company: false,
          customer_rank: 1,
        });
      }
    } catch (partnerError) {
      console.warn("Partner creation failed, using default:", partnerError);
      partnerId = 1; // Fallback to default partner
    }
    
    // Create the quotation (sale order in draft state)
    const quotationNumber = `QT-${Date.now().toString().slice(-8)}`;
    const odooQuotation = {
      name: quotationNumber,
      partner_id: partnerId,
      state: 'draft', // This makes it a quotation
      date_order: new Date().toISOString(),
      validity_date: quotationData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      note: quotationData.notes || "Rental quotation generated from platform",
    };
    
    const quotationId = await odoo.create("sale.order", odooQuotation);
    
    // Add order lines for each item
    for (const item of quotationData.items) {
      try {
        // Try to find the product in Odoo
        const products = await odoo.searchRead("product.product", [
          ["name", "ilike", item.name]
        ], ["id", "name"], { limit: 1 }) as Array<{ id: number; name: string }>;
        
        let productId;
        if (products.length > 0) {
          productId = products[0].id;
        } else {
          // Create a service product for rental if not found
          productId = await odoo.create("product.product", {
            name: item.name,
            type: 'service',
            categ_id: 1, // Default category
            list_price: item.pricePerUnit,
            rental_ok: true,
          });
        }
        
        await odoo.create("sale.order.line", {
          order_id: quotationId,
          product_id: productId,
          product_uom_qty: item.qty,
          price_unit: item.pricePerUnit,
          name: `${item.name} (${item.tenureType} rental: ${item.startDate} to ${item.endDate})`,
        });
      } catch (lineError) {
        console.warn(`Failed to create order line for ${item.name}:`, lineError);
      }
    }
    
    return {
      id: quotationId,
      quotationNumber,
      partnerId,
      status: "draft",
      message: "Quotation created successfully in Odoo"
    };
    
  } catch (error) {
    console.error("Failed to create quotation in Odoo:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Odoo quotation creation failed: ${errorMessage}`);
  }
};

export const createOdooOrder = async (orderData: Partial<Order>): Promise<Order> => {
  try {
  await ensureOdooConnected();
    
    const odooOrder = {
      name: `ORD-${Date.now()}`,
      partner_id: 1, // Default partner, you might want to create customers
      state: 'sale',
      // Add order lines if needed
    };
    
    const orderId = await odoo.create("sale.order", odooOrder);
    
    return {
      id: orderId.toString(),
      userId: orderData.userId || "default",
      items: orderData.items || [],
      total: orderData.total || 0,
      deposit: orderData.deposit,
      address: orderData.address || { name: "", phone: "", email: "", line1: "", city: "", state: "", pincode: "" },
      paymentStatus: "pending",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to create order in Odoo:", error);
    // Fallback to mock order
    return {
      id: `ORD-${Date.now()}`,
      userId: orderData.userId || "default",
      items: orderData.items || [],
      total: orderData.total || 0,
      deposit: orderData.deposit,
      address: orderData.address || { name: "", phone: "", email: "", line1: "", city: "", state: "", pincode: "" },
      paymentStatus: "pending",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
  }
};

export const getOdooOrders = async (): Promise<Order[]> => {
  try {
  await ensureOdooConnected();
    const orders = await odoo.searchRead("sale.order", [], [
      "name", "partner_id", "amount_total", "state", "create_date"
    ]);

    return orders.map((o: any) => ({
      id: o.id.toString(),
      userId: "default",
      items: [], // You'd need to fetch order lines separately
      total: o.amount_total,
      address: { name: "", phone: "", email: "", line1: "", city: "", state: "", pincode: "" },
      paymentStatus: "paid",
      status: o.state === "sale" ? "confirmed" : "quotation",
      createdAt: o.create_date,
    }));
  } catch (error) {
    console.error("Failed to fetch orders from Odoo:", error);
    return [];
  }
};

export const createOdooReservation = async (reservationData: Partial<Reservation>): Promise<Reservation> => {
  try {
  await ensureOdooConnected();
    
    // In Odoo rental, you might use rental.order or a custom model
    const odooReservation = {
      product_id: parseInt(reservationData.productId || "1"),
      start_date: reservationData.startAt,
      end_date: reservationData.endAt,
      state: 'reserved',
    };
    
    const reservationId = await odoo.create("rental.order", odooReservation);
    
    return {
      id: reservationId.toString(),
      userId: reservationData.userId || "default",
      productId: reservationData.productId || "1",
      startAt: reservationData.startAt || new Date().toISOString(),
      endAt: reservationData.endAt || new Date().toISOString(),
      status: "reserved",
      price: reservationData.price || 0,
      deposit: reservationData.deposit,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to create reservation in Odoo:", error);
    // Fallback to mock reservation
    return {
      id: `RES-${Date.now()}`,
      userId: reservationData.userId || "default",
      productId: reservationData.productId || "1",
      startAt: reservationData.startAt || new Date().toISOString(),
      endAt: reservationData.endAt || new Date().toISOString(),
      status: "reserved",
      price: reservationData.price || 0,
      deposit: reservationData.deposit,
      createdAt: new Date().toISOString(),
    };
  }
};

// Create a new product in Odoo
export const createOdooProduct = async (productData: {
  name: string;
  description: string;
  category: string;
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
    deposit: number;
  };
  specifications: Record<string, string>;
  availability: {
    isAvailable: boolean;
    stock: number;
    location: string;
  };
}): Promise<{ success: boolean; odooId?: string; error?: string }> => {
  try {
    await ensureOdooConnected();

    // Map frontend category to Odoo category ID
    const getCategoryId = (category: string): number => {
      const categoryMap: Record<string, number> = {
        'furniture': 1,
        'electronics': 2,
        'appliances': 3,
        'tools': 4,
        'sports': 5,
        'automotive': 6,
      };
      return categoryMap[category.toLowerCase()] || 1; // Default to category 1
    };

    // Create the product in Odoo
    const odooProductData = {
      name: productData.name,
      description: productData.description,
      categ_id: getCategoryId(productData.category),
      type: 'product', // Storable product
      list_price: productData.pricing.daily,
      standard_price: productData.pricing.daily * 0.6, // Cost price (60% of selling price)
      sale_ok: true,
      purchase_ok: true,
      rental_ok: true, // Enable for rental if available
      active: productData.availability.isAvailable,
      // Add custom fields for rental pricing
      x_rental_daily_price: productData.pricing.daily,
      x_rental_weekly_price: productData.pricing.weekly,
      x_rental_monthly_price: productData.pricing.monthly,
      x_rental_deposit: productData.pricing.deposit,
      x_rental_location: productData.availability.location,
    };

    const productId = await odoo.create("product.template", odooProductData);

    // Update stock quantities if needed
    if (productData.availability.stock > 0) {
      try {
        // Find the product variant (product.product) created automatically
        const variants = await odoo.searchRead("product.product", [
          ["product_tmpl_id", "=", productId]
        ], ["id"], { limit: 1 });

        if (variants.length > 0) {
          const variantId = (variants[0] as any).id;
          
          // Create stock quant to set initial inventory
          await odoo.create("stock.quant", {
            product_id: variantId,
            location_id: 8, // Stock location (adjust based on your Odoo setup)
            quantity: productData.availability.stock,
            inventory_quantity: productData.availability.stock,
          });
        }
      } catch (stockError) {
        console.warn("Failed to set initial stock:", stockError);
        // Continue without failing the product creation
      }
    }

    console.log(`[Odoo] Product created successfully with ID: ${productId}`);
    return { success: true, odooId: productId.toString() };

  } catch (error) {
    console.error("[Odoo] Product creation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: `Failed to create product in Odoo: ${errorMessage}` };
  }
};

// Update an existing product in Odoo
export const updateOdooProduct = async (odooId: string, updates: Partial<{
  name: string;
  description: string;
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
    deposit: number;
  };
  availability: {
    isAvailable: boolean;
    stock: number;
    location: string;
  };
}>): Promise<{ success: boolean; error?: string }> => {
  try {
    await ensureOdooConnected();

    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.availability?.isAvailable !== undefined) {
      updateData.active = updates.availability.isAvailable;
    }
    if (updates.pricing) {
      updateData.list_price = updates.pricing.daily;
      updateData.x_rental_daily_price = updates.pricing.daily;
      updateData.x_rental_weekly_price = updates.pricing.weekly;
      updateData.x_rental_monthly_price = updates.pricing.monthly;
      updateData.x_rental_deposit = updates.pricing.deposit;
    }
    if (updates.availability?.location) {
      updateData.x_rental_location = updates.availability.location;
    }

    await (odoo as any).update("product.template", parseInt(odooId), updateData);

    // Update stock if needed
    if (updates.availability?.stock !== undefined) {
      try {
        const variants = await odoo.searchRead("product.product", [
          ["product_tmpl_id", "=", parseInt(odooId)]
        ], ["id"], { limit: 1 });

        if (variants.length > 0) {
          const variantId = (variants[0] as any).id;
          
          // Update stock quant
          const quants = await odoo.searchRead("stock.quant", [
            ["product_id", "=", variantId],
            ["location_id", "=", 8]
          ], ["id"], { limit: 1 });

          if (quants.length > 0) {
            await (odoo as any).update("stock.quant", (quants[0] as any).id, {
              quantity: updates.availability.stock,
              inventory_quantity: updates.availability.stock,
            });
          } else {
            // Create new stock quant
            await odoo.create("stock.quant", {
              product_id: variantId,
              location_id: 8,
              quantity: updates.availability.stock,
              inventory_quantity: updates.availability.stock,
            });
          }
        }
      } catch (stockError) {
        console.warn("Failed to update stock:", stockError);
      }
    }

    console.log(`[Odoo] Product ${odooId} updated successfully`);
    return { success: true };

  } catch (error) {
    console.error("[Odoo] Product update failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: `Failed to update product in Odoo: ${errorMessage}` };
  }
};

// Delete a product from Odoo
export const deleteOdooProduct = async (odooId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await ensureOdooConnected();

    // Instead of deleting, we'll archive the product (set active=false)
    // This is the recommended approach in Odoo to maintain data integrity
    await (odoo as any).update("product.template", parseInt(odooId), { active: false });

    console.log(`[Odoo] Product ${odooId} archived successfully`);
    return { success: true };

  } catch (error) {
    console.error("[Odoo] Product archival failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: `Failed to archive product in Odoo: ${errorMessage}` };
  }
};

export default odoo;
