// lib/mock-data.ts
// Minimal exports to keep essential UI components working during Odoo integration

// Essential category data for navigation
export const mockQuickFilterCategories = [
  { name: "Packages", icon: "Package", slug: "packages", description: "Curated room & home sets" },
  { name: "Furniture", icon: "Sofa", slug: "furniture", description: "Sofas, beds, tables & more" },
  { name: "Appliances", icon: "Refrigerator", slug: "appliances", description: "Fridge, washer, ACs" },
  { name: "Electronics", icon: "Monitor", slug: "electronics", description: "TVs, work-from-home" },
  { name: "Fitness", icon: "Dumbbell", slug: "fitness", description: "Cycle, treadmill, bench" },
  { name: "Baby & Kids", icon: "Baby", slug: "baby-kids", description: "Cribs, study desks" },
]

// How it works steps for the home page
export const mockHowItWorksSteps = [
  {
    icon: "ShoppingCart",
    title: "Choose & Schedule",
    description: "Browse our catalog, select your items, and pick a convenient delivery slot.",
  },
  {
    icon: "CreditCard",
    title: "Pay Securely", 
    description: "Complete your payment online through our secure gateway.",
  },
  {
    icon: "Truck",
    title: "We Deliver & Pick Up",
    description: "Our team delivers and sets up your rentals, and picks them up when your tenure ends.",
  },
]

// Mock reservations for availability checking
export const mockReservations = [
  {
    id: "res-1",
    userId: "user-1", 
    productId: "7", // Reference to Odoo product ID
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "reserved",
    price: 1000,
    createdAt: new Date().toISOString(),
  },
]

// Minimal data to prevent component errors
export const mockMicroBenefits = ["Free relocation", "Free maintenance", "Flexible tenure", "Sanitized products"]

export const mockCategoryShowcaseProducts = []
export const mockTrendingPackages = []
export const mockSustainabilityData = {
  global: { co2Saved: 123456, moneySaved: 9876543, wasteAvoided: 7890 },
  myImpact: { co2Saved: 1234, moneySaved: 98765, wasteAvoided: 78 }
}

// Empty arrays for components that haven't been migrated yet
export const allMockProducts = []
export const mockCategories = []
export const mockCuratedProducts = []
export const mockHeroImages = []
export const mockValueProps = []
