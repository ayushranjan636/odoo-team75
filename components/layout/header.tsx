"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Heart, ShoppingCart, User, MapPin, X, ArrowRight, LogIn, LogOut } from "lucide-react"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useCartStore } from "@/hooks/use-cart-store"
import { useWishlistStore } from "@/hooks/use-wishlist-store"
import { useAuthStore } from "@/hooks/use-auth-store"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false)
  const [pincode, setPincode] = useState("")
  const currentPincode = "560068" // Placeholder for currently selected pincode
  const totalCartItems = useCartStore((state) => state.getTotalItems())
  const wishlistCount = useWishlistStore((state) => state.getWishlistCount())
  const { user, isAuthenticated, logout } = useAuthStore()

  const mockLocations = [
    { name: "Bengaluru", pincode: "560001" },
    { name: "Mumbai", pincode: "400001" },
    { name: "Delhi", pincode: "110001" },
    { name: "Chennai", pincode: "600001" },
    { name: "Hyderabad", pincode: "500001" },
    { name: "Pune", pincode: "411001" },
    { name: "Kolkata", pincode: "700001" },
    { name: "Ahmedabad", pincode: "380001" },
    { name: "Jaipur", pincode: "302001" },
  ]

  const handleLocationSelect = (selectedPincode: string) => {
    console.log(`Selected pincode: ${selectedPincode}`)
    setIsLocationSheetOpen(false)
    showComingSoonToast() // Simulate setting location
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm my-0 py-0">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-2xl font-sans" prefetch={false}>
          RentKaro
        </Link>

        {/* Search Bar (Center) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Input
            type="search"
            placeholder="Search products & categories..."
            className="w-full rounded-full pl-10 pr-4 py-2 border border-border bg-input focus-visible:ring-primary focus-visible:ring-offset-0"
            onFocus={showComingSoonToast}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/wishlist" prefetch={false}>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/cart" prefetch={false}>
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Button>
          </Link>
          
          {/* Authentication Section */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full w-fit">
                        Admin
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Sign In</span>
              </Button>
            </Link>
          )}

          {/* Location Selector Sheet Trigger */}
          <Sheet open={isLocationSheetOpen} onOpenChange={setIsLocationSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <MapPin className="h-5 w-5" />
                <span className="sr-only">Select Location</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md p-6 bg-background text-foreground">
              <SheetHeader className="relative">
                <SheetTitle className="text-2xl font-semibold text-foreground">Select Delivery Location</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted/20"
                  onClick={() => setIsLocationSheetOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                <div className="relative flex items-center border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                  <Input
                    type="text"
                    placeholder="Enter your pincode"
                    className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground py-3 px-4"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none text-primary hover:bg-primary/10"
                    aria-label="Submit pincode"
                    onClick={() => handleLocationSelect(pincode || currentPincode)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Currently selected pincode: <span className="font-medium text-foreground">{currentPincode}</span>
                </p>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  {mockLocations.map((location, i) => (
                    <button
                      key={i}
                      className="rounded-xl border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,.06)] p-4 flex flex-col items-center justify-center space-y-2 text-center transition-all duration-200 hover:bg-muted/10 active:bg-muted/20"
                      onClick={() => handleLocationSelect(location.pincode)}
                    >
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{location.name}</span>
                      <span className="text-xs text-muted-foreground">{location.pincode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
