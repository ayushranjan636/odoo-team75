import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  category: string
  images: string[]
  pricing: {
    daily: number
    weekly: number
    monthly: number
    deposit: number
  }
  specifications: Record<string, string>
  availability: {
    isAvailable: boolean
    stock: number
    location: string
  }
  odooId?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'pending' | 'confirmed' | 'picked-up' | 'delivered' | 'returned' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  items: Array<{
    productId: string
    productName: string
    quantity: number
    pricing: {
      daily: number
      weekly: number
      monthly: number
    }
    duration: number
    durationType: 'days' | 'weeks' | 'months'
    totalAmount: number
  }>
  totalAmount: number
  deliveryAddress: string
  deliveryDate: string
  returnDate: string
  createdAt: string
  updatedAt: string
  notes?: string
}

interface AdminState {
  products: Product[]
  orders: Order[]
  
  // Product Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Order Management
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<{ success: boolean; error?: string }>
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => Promise<{ success: boolean; error?: string }>
  
  // Odoo Integration
  syncWithOdoo: () => Promise<{ success: boolean; error?: string }>
  
  // Data fetching
  fetchProducts: () => Promise<void>
  fetchOrders: () => Promise<void>
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Modern L-Shaped Sofa',
    description: 'Comfortable modern L-shaped sofa perfect for living rooms',
    category: 'furniture',
    images: ['/placeholder.jpg'],
    pricing: {
      daily: 150,
      weekly: 900,
      monthly: 3000,
      deposit: 5000
    },
    specifications: {
      'Material': 'Fabric',
      'Color': 'Grey',
      'Dimensions': '280 x 200 x 85 cm',
      'Seating': '6 people'
    },
    availability: {
      isAvailable: true,
      stock: 5,
      location: 'Bangalore Warehouse'
    },
    odooId: 'ODO-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Dining Table Set',
    description: '6-seater wooden dining table with chairs',
    category: 'furniture',
    images: ['/placeholder.jpg'],
    pricing: {
      daily: 100,
      weekly: 600,
      monthly: 2000,
      deposit: 3000
    },
    specifications: {
      'Material': 'Wood',
      'Color': 'Brown',
      'Dimensions': '180 x 90 x 75 cm',
      'Seating': '6 people'
    },
    availability: {
      isAvailable: false,
      stock: 0,
      location: 'Bangalore Warehouse'
    },
    odooId: 'ODO-002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+91 98765 43210',
    status: 'confirmed',
    paymentStatus: 'paid',
    items: [
      {
        productId: '1',
        productName: 'Modern L-Shaped Sofa',
        quantity: 1,
        pricing: {
          daily: 150,
          weekly: 900,
          monthly: 3000
        },
        duration: 1,
        durationType: 'months',
        totalAmount: 3000
      }
    ],
    totalAmount: 3000,
    deliveryAddress: '123 Main Street, Bangalore - 560001',
    deliveryDate: '2024-02-01',
    returnDate: '2024-03-01',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    notes: 'Customer requested white color if available'
  },
  {
    id: 'ORD-002',
    customerId: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+91 87654 32109',
    status: 'pending',
    paymentStatus: 'pending',
    items: [
      {
        productId: '2',
        productName: 'Dining Table Set',
        quantity: 1,
        pricing: {
          daily: 100,
          weekly: 600,
          monthly: 2000
        },
        duration: 2,
        durationType: 'weeks',
        totalAmount: 1200
      }
    ],
    totalAmount: 1200,
    deliveryAddress: '456 Park Avenue, Mumbai - 400001',
    deliveryDate: '2024-02-15',
    returnDate: '2024-03-01',
    createdAt: '2024-01-20T14:20:00Z',
    updatedAt: '2024-01-20T14:20:00Z'
  }
]

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      orders: mockOrders,

      addProduct: async (productData) => {
        try {
          const newProduct: Product = {
            ...productData,
            id: `PROD-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // Simulate Odoo integration
          const odooResponse = await simulateOdooProductCreate(newProduct)
          if (odooResponse.success) {
            newProduct.odooId = odooResponse.odooId
          }

          set(state => ({
            products: [...state.products, newProduct]
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to add product' }
        }
      },

      updateProduct: async (id, updates) => {
        try {
          set(state => ({
            products: state.products.map(product =>
              product.id === id
                ? { ...product, ...updates, updatedAt: new Date().toISOString() }
                : product
            )
          }))

          // Simulate Odoo sync
          await simulateOdooProductUpdate(id, updates)

          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to update product' }
        }
      },

      deleteProduct: async (id) => {
        try {
          const product = get().products.find(p => p.id === id)
          if (product?.odooId) {
            await simulateOdooProductDelete(product.odooId)
          }

          set(state => ({
            products: state.products.filter(product => product.id !== id)
          }))

          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to delete product' }
        }
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { ...order, status, updatedAt: new Date().toISOString() }
                : order
            )
          }))
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to update order status' }
        }
      },

      updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? { ...order, paymentStatus, updatedAt: new Date().toISOString() }
                : order
            )
          }))
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to update payment status' }
        }
      },

      syncWithOdoo: async () => {
        try {
          // Simulate Odoo sync
          await new Promise(resolve => setTimeout(resolve, 2000))
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Failed to sync with Odoo' }
        }
      },

      fetchProducts: async () => {
        // In a real app, this would fetch from API
        // For now, products are already loaded from mock data
      },

      fetchOrders: async () => {
        // In a real app, this would fetch from API
        // For now, orders are already loaded from mock data
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ products: state.products, orders: state.orders })
    }
  )
)

// Simulate Odoo API calls
async function simulateOdooProductCreate(product: Product): Promise<{ success: boolean; odooId?: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true, odooId: `ODO-${Date.now()}` }
}

async function simulateOdooProductUpdate(productId: string, updates: Partial<Product>): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { success: true }
}

async function simulateOdooProductDelete(odooId: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 600))
  return { success: true }
}
