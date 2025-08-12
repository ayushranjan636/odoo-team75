// lib/types.ts - Type definitions for the rental platform

export type Tenure = "hour" | "day" | "week" | "month"

export interface Product {
  id: string
  slug: string
  name: string
  category: "Packages" | "Furniture" | "Appliances" | "Electronics" | "Fitness" | "Baby & Kids"
  internalRef: string
  salesPrice: number
  cost?: number
  qtyOnHand: number
  qtyForecasted: number
  rentable: boolean
  attributes?: {
    colors?: string[]
    materials?: string[]
    variants?: object[]
  }
  sustainability: {
    co2_new: number
    co2_reuse: number
    weight_kg: number
    waste_factor: number
    retail_cost?: number
  }
  images: string[]
  description: string
  createdAt: string
  relatedProducts?: string[] // slugs of related products
  // Computed fields (added by API)
  pricePerTenure?: number
  availabilityStatus?: "green" | "yellow" | "red"
}

export interface OrderItem {
  productId: string
  name: string
  image?: string
  tenure: Tenure
  pricePerUnit: number
  qty: number
  startAt: string // ISO date string
  endAt: string // ISO date string
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  type: "home" | "office" | "other"
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  deposit?: number
  address: {
    name: string
    phone: string
    email: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  invoiceAddress?: {
    name: string
    phone: string
    email: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  deliveryMethod?: string
  paymentStatus: "pending" | "paid" | "refunded"
  status: "quotation" | "confirmed" | "picked_up" | "returned" | "late" | "cancelled"
  invoices?: string[]
  contracts?: string[]
  createdAt: string
  updatedAt?: string
}

export interface Reservation {
  id: string
  userId: string
  productId: string
  startAt: string
  endAt: string
  status: "reserved" | "picked_up" | "returned" | "late" | "cancelled"
  price: number
  deposit?: number
  createdAt: string
}

export interface PricelistRule {
  hourly: number
  daily: number
  weekly: number
  monthly: number
  discounts?: Array<{
    type: "percent" | "fixed"
    value: number
    code?: string
    validFrom?: string
    validTo?: string
  }>
}

export interface Appointment {
  id: string
  userId: string
  scheduledAt: string
  status: "scheduled" | "completed" | "cancelled"
  meetingUrl?: string
  notes?: string
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// Filter types
export interface ProductFilters {
  q?: string
  category?: string
  slug?: string
  page?: number
  limit?: number
  sort?: "popularity" | "price-asc" | "price-desc" | "newest"
  tenure?: Tenure
  minPrice?: number
  maxPrice?: number
  availableFrom?: string
  availableTo?: string
  pricelist?: string
  [key: string]: any // For dynamic attribute filters like attrs[color]
}

export interface OrderFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  customer?: string
  city?: string
  page?: number
  limit?: number
}

// Admin types
export interface AdminStats {
  totalRevenue: number
  activeRentals: number
  lateReturns: number
  avgTenure: number
  depositLiability: number
}

export interface ReportData {
  type: "performance" | "products" | "customers" | "operations"
  dateFrom: string
  dateTo: string
  data: any
}
