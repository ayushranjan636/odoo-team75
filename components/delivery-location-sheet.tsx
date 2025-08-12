"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from "lucide-react"
import { MapPin } from "lucide-react" // Added for location icon

export function DeliveryLocationSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [pincode, setPincode] = useState("")
  const currentPincode = "560068" // Placeholder for currently selected pincode

  // Mock data for popular locations
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
    // In a real app, this would update the global state for the selected location
    console.log(`Selected pincode: ${selectedPincode}`)
    setIsOpen(false) // Close the sheet after selection
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* This button is just for demonstration. In a real app, this would be triggered from the header or similar. */}
        <Button variant="outline">Select Location</Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md p-6 bg-surface text-text">
        <SheetHeader className="relative">
          <SheetTitle className="text-2xl font-semibold text-text">Select Delivery Location</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>
        <div className="mt-8 space-y-6">
          <div className="relative flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-brand">
            <Input
              type="text"
              placeholder="Enter your pincode"
              className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-text placeholder:text-muted-foreground py-3 px-4"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none text-brand hover:bg-brand/10"
              aria-label="Submit pincode"
              // This button would trigger a mock "search" or "set" action
              onClick={() => handleLocationSelect(pincode || currentPincode)}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Currently selected pincode: <span className="font-medium text-text">{currentPincode}</span>
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {mockLocations.map((location, i) => (
              <button
                key={i}
                className="rounded-xl border border-[#E2E8F0] shadow-[0_8px_24px_rgba(0,0,0,.06)] p-4 flex flex-col items-center justify-center space-y-2 text-center transition-all hover:bg-gray-50 active:bg-gray-100"
                onClick={() => handleLocationSelect(location.pincode)}
              >
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-text">{location.name}</span>
                <span className="text-xs text-muted-foreground">{location.pincode}</span>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
