import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'client'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
}

// Mock users for development
const mockUsers = [
  {
    id: '1',
    email: 'admin@rentkro.in',
    password: 'Admin@123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'client@test.com',
    password: 'Client@123',
    name: 'Test Client',
    role: 'client' as const
  }
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // Find user in mock data
          const foundUser = mockUsers.find(u => u.email === email && u.password === password)
          
          if (!foundUser) {
            return { success: false, error: 'Invalid email or password' }
          }

          const user: User = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role
          }

          // Set cookie for 7 days
          Cookies.set('auth-token', foundUser.id, { expires: 7 })
          
          set({ user, isAuthenticated: true })
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Login failed' }
        }
      },

      signup: async (email: string, password: string, name: string) => {
        try {
          // Check if user already exists
          const existingUser = mockUsers.find(u => u.email === email)
          if (existingUser) {
            return { success: false, error: 'User already exists' }
          }

          // In a real app, you would hash the password and save to database
          const newUser = {
            id: String(Date.now()),
            email,
            password,
            name,
            role: 'client' as const
          }
          
          mockUsers.push(newUser)

          const user: User = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }

          Cookies.set('auth-token', newUser.id, { expires: 7 })
          
          set({ user, isAuthenticated: true })
          return { success: true }
        } catch (error) {
          return { success: false, error: 'Signup failed' }
        }
      },

      logout: () => {
        Cookies.remove('auth-token')
        set({ user: null, isAuthenticated: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
