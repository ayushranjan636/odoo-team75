import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "sonner"

interface WishlistState {
  wishlistIds: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getWishlistCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      addToWishlist: (productId) => {
        set((state) => {
          if (state.wishlistIds.includes(productId)) {
            return state // Already in wishlist
          }
          toast.success("Added to wishlist")
          return { wishlistIds: [...state.wishlistIds, productId] }
        })
      },
      removeFromWishlist: (productId) => {
        set((state) => {
          toast.success("Removed from wishlist")
          return { wishlistIds: state.wishlistIds.filter((id) => id !== productId) }
        })
      },
      isInWishlist: (productId) => get().wishlistIds.includes(productId),
      clearWishlist: () => set({ wishlistIds: [] }),
      getWishlistCount: () => get().wishlistIds.length,
    }),
    {
      name: "rentify-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlistIds: state.wishlistIds }),
    },
  ),
)
