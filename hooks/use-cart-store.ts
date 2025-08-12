import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CartItem = {
  productId: string
  slug: string
  name: string
  image: string
  pricePerUnit: number
  qty: number
  tenureType: "hour" | "day" | "week" | "month"
  startDate: Date
  endDate: Date
  deposit: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem, options?: { navigate: boolean; showToast: boolean }) => void
  updateItem: (productId: string, startDate: Date, qty: number) => void
  updateItemQuantity: (productId: string, qty: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  createOdooQuotation: (customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }, notes?: string) => Promise<any>
}

const ensureDate = (date: Date | string): Date => {
  return date instanceof Date ? date : new Date(date)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, options = { navigate: true, showToast: true }) => {
        set((state) => {
          const normalizedItem = {
            ...item,
            startDate: ensureDate(item.startDate),
            endDate: ensureDate(item.endDate),
          }

          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.productId === normalizedItem.productId &&
              i.tenureType === normalizedItem.tenureType &&
              ensureDate(i.startDate).getTime() === normalizedItem.startDate.getTime() &&
              ensureDate(i.endDate).getTime() === normalizedItem.endDate.getTime(),
          )

          let newItems
          let action: "added" | "updated"

          if (existingItemIndex > -1) {
            // Update quantity if item with same dates/tenure exists
            newItems = [...state.items]
            newItems[existingItemIndex].qty += normalizedItem.qty
            action = "updated"
          } else {
            newItems = [...state.items, normalizedItem]
            action = "added"
          }

          // Handle navigation and toast after state update
          if (options.navigate || options.showToast) {
            // Use setTimeout to ensure state is updated first
            setTimeout(() => {
              if (options.navigate && typeof window !== "undefined") {
                window.location.href = "/cart"
              }

              if (options.showToast) {
                // Dynamic import to avoid SSR issues
                import("@/components/ui/cart-toast").then(({ showCartToast }) => {
                  showCartToast(
                    action,
                    () => {
                      if (typeof window !== "undefined") {
                        window.location.href = "/cart"
                      }
                    },
                    () => {
                      if (typeof window !== "undefined") {
                        window.history.back()
                      }
                    },
                  )
                })
              }
            }, 0)
          }

          return { items: newItems }
        })
      },
      updateItemQuantity: (productId: string, qty: number) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.productId === productId ? { ...item, qty } : item))
            .filter((item) => item.qty > 0),
        }))
      },
      updateItem: (productId: string, startDate: Date, qty: number) => {
        set((state) => ({
          items: state.items
            .map((item) => 
              item.productId === productId && item.startDate.getTime() === startDate.getTime() 
                ? { ...item, qty } 
                : item
            )
            .filter((item) => item.qty > 0),
        }))
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.qty, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + item.pricePerUnit * item.qty, 0),
      createOdooQuotation: async (customerInfo, notes) => {
        try {
          const items = get().items;
          if (items.length === 0) {
            throw new Error("No items in cart to create quotation");
          }

          const response = await fetch("/api/quotes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerInfo,
              items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                qty: item.qty,
                pricePerUnit: item.pricePerUnit,
                tenureType: item.tenureType,
                startDate: item.startDate.toISOString(),
                endDate: item.endDate.toISOString(),
                deposit: item.deposit,
              })),
              notes,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to create quotation");
          }

          return result.data;
        } catch (error) {
          console.error("Failed to create Odoo quotation:", error);
          throw error;
        }
      },
    }),
    {
      name: "rentify-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map((item) => ({
            ...item,
            startDate: ensureDate(item.startDate),
            endDate: ensureDate(item.endDate),
          }))
        }
      },
    },
  ),
)
