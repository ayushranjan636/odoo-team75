import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { Address } from "@/lib/types"

interface AddressState {
  addresses: Address[]
  defaultAddress: Address | null
  addAddress: (address: Omit<Address, "id" | "createdAt" | "updatedAt">) => void
  updateAddress: (id: string, updates: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  getAddressById: (id: string) => Address | undefined
  getUserAddresses: (userId: string) => Address[]
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      defaultAddress: null,

      addAddress: (addressData) => {
        const newAddress: Address = {
          ...addressData,
          id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => {
          const userAddresses = state.addresses.filter(addr => addr.userId === addressData.userId)
          
          // If this is the first address for the user or marked as default, make it default
          if (userAddresses.length === 0 || addressData.isDefault) {
            // Remove default from other addresses for this user
            const updatedAddresses = state.addresses.map(addr => 
              addr.userId === addressData.userId ? { ...addr, isDefault: false } : addr
            )
            return {
              addresses: [...updatedAddresses, newAddress],
              defaultAddress: newAddress
            }
          }

          return {
            addresses: [...state.addresses, newAddress]
          }
        })
      },

      updateAddress: (id, updates) => {
        set((state) => {
          const updatedAddresses = state.addresses.map(addr =>
            addr.id === id 
              ? { ...addr, ...updates, updatedAt: new Date().toISOString() }
              : addr
          )

          // If setting as default, remove default from others for the same user
          if (updates.isDefault) {
            const targetAddress = state.addresses.find(addr => addr.id === id)
            if (targetAddress) {
              updatedAddresses.forEach(addr => {
                if (addr.userId === targetAddress.userId && addr.id !== id) {
                  addr.isDefault = false
                }
              })
            }
          }

          const defaultAddress = updatedAddresses.find(addr => 
            addr.id === id && addr.isDefault
          ) || state.defaultAddress

          return {
            addresses: updatedAddresses,
            defaultAddress
          }
        })
      },

      deleteAddress: (id) => {
        set((state) => {
          const addressToDelete = state.addresses.find(addr => addr.id === id)
          const filteredAddresses = state.addresses.filter(addr => addr.id !== id)
          
          // If deleting default address, set another address as default
          let newDefaultAddress = state.defaultAddress
          if (addressToDelete?.isDefault && addressToDelete?.userId) {
            const userAddresses = filteredAddresses.filter(addr => addr.userId === addressToDelete.userId)
            if (userAddresses.length > 0) {
              userAddresses[0].isDefault = true
              newDefaultAddress = userAddresses[0]
            } else {
              newDefaultAddress = null
            }
          }

          return {
            addresses: filteredAddresses,
            defaultAddress: newDefaultAddress
          }
        })
      },

      setDefaultAddress: (id) => {
        set((state) => {
          const targetAddress = state.addresses.find(addr => addr.id === id)
          if (!targetAddress) return state

          const updatedAddresses = state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.userId === targetAddress.userId ? addr.id === id : addr.isDefault
          }))

          return {
            addresses: updatedAddresses,
            defaultAddress: targetAddress
          }
        })
      },

      getAddressById: (id) => {
        return get().addresses.find(addr => addr.id === id)
      },

      getUserAddresses: (userId) => {
        return get().addresses.filter(addr => addr.userId === userId)
      },
    }),
    {
      name: "rentify-address-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        addresses: state.addresses,
        defaultAddress: state.defaultAddress 
      }),
    }
  )
)
