// lib/api.ts - Typed API client for the rental platform

import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Order,
  Reservation,
  Appointment,
  ProductFilters,
  OrderFilters,
  AdminStats,
  ReportData,
} from "./types"

// Base URL from environment variable, fallback to internal Next.js routes
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = BASE_URL ? `${BASE_URL}${endpoint}` : endpoint
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error occurred",
      }
    }
  }

  // PRODUCTS API
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })

    const endpoint = `/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    return this.request<PaginatedResponse<Product>>(endpoint)
  }

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/api/products/${slug}`)
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.getProducts({ slug, limit: 1 })
  }

  // ORDERS API
  async getOrders(filters: OrderFilters = {}): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })

    const endpoint = `/api/orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    return this.request<PaginatedResponse<Order>>(endpoint)
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/api/orders/${id}`)
  }

  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  // RESERVATIONS API
  async createReservation(reservationData: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    })
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>(`/api/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  // APPOINTMENTS API
  async getAppointments(): Promise<ApiResponse<Appointment[]>> {
    return this.request<Appointment[]>("/api/appointments")
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    })
  }

  // ADMIN API
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<AdminStats>("/api/admin/dashboard")
  }

  async getReports(type: string, dateFrom: string, dateTo: string): Promise<ApiResponse<ReportData>> {
    const searchParams = new URLSearchParams({ type, dateFrom, dateTo })
    return this.request<ReportData>(`/api/reports?${searchParams.toString()}`)
  }

  // DOCUMENTS API
  async generateInvoice(orderId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>("/api/docs/invoice", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    })
  }

  async generateManifest(type: "delivery" | "return", date: string): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>("/api/docs/manifest", {
      method: "POST",
      body: JSON.stringify({ type, date }),
    })
  }

  // IMPORT API
  async importProducts(csvData: any[]): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    return this.request<{ imported: number; errors: string[] }>("/api/import/products", {
      method: "POST",
      body: JSON.stringify({ products: csvData }),
    })
  }

  // PRICING API
  async getPricelists(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/pricelists")
  }

  // SETTINGS API
  async getSettings(): Promise<ApiResponse<any>> {
    return this.request<any>("/api/settings")
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request<any>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    })
  }

  // Check if endpoint is connected
  async checkEndpoint(endpoint: string): Promise<boolean> {
    try {
      const response = await this.request(endpoint)
      return !response.error
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual functions for convenience
export const {
  getProducts,
  getProduct,
  getProductBySlug,
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  createReservation,
  updateReservation,
  getAppointments,
  createAppointment,
  getAdminStats,
  getReports,
  generateInvoice,
  generateManifest,
  importProducts,
  getPricelists,
  getSettings,
  updateSettings,
  checkEndpoint,
} = apiClient
