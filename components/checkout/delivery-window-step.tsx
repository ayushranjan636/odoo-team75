"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { cn } from "@/lib/utils"
import { deliveryWindowSchema, type DeliveryWindowForm } from "@/lib/checkout-schemas"
import type { CartItem } from "@/hooks/use-cart-store"

interface DeliveryWindowStepProps {
  onSubmit: (data: DeliveryWindowForm) => void
  onBack: () => void
  initialData?: DeliveryWindowForm | null
  cartItems: CartItem[]
}

const timeSlots = [
  { value: "10-13", label: "10:00 AM - 1:00 PM" },
  { value: "13-16", label: "1:00 PM - 4:00 PM" },
  { value: "16-19", label: "4:00 PM - 7:00 PM" },
  { value: "19-22", label: "7:00 PM - 10:00 PM" },
]

export function DeliveryWindowStep({ onSubmit, onBack, initialData, cartItems }: DeliveryWindowStepProps) {
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = useState(false)
  const [returnCalendarOpen, setReturnCalendarOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryWindowForm>({
    resolver: zodResolver(deliveryWindowSchema),
    defaultValues: initialData || undefined,
  })

  const deliveryDate = watch("deliveryDate")
  const minReturnDate = deliveryDate ? addDays(deliveryDate, 1) : addDays(new Date(), 2)

  // Mock function to check slot availability
  const isSlotAvailable = (date: Date, slot: string) => {
    // In a real app, this would check against actual reservations
    // For now, randomly make some slots unavailable for demo
    const dateStr = format(date, "yyyy-MM-dd")
    const slotKey = `${dateStr}-${slot}`
    const unavailableSlots = [
      `${format(new Date(), "yyyy-MM-dd")}-10-13`,
      `${format(addDays(new Date(), 1), "yyyy-MM-dd")}-16-19`,
    ]
    return !unavailableSlots.includes(slotKey)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Delivery & Return Windows</h2>
        <p className="text-muted-foreground">Choose convenient time slots for delivery and return of your items.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Delivery Section */}
        <div className="bg-muted/10 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Delivery Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Date *</Label>
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.deliveryDate && "border-destructive",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Select delivery date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDeliveryCalendarOpen(false)
                        }}
                        disabled={(date) => isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.deliveryDate && <p className="text-sm text-destructive">{errors.deliveryDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Delivery Time Slot *</Label>
              <Controller
                name="deliveryTimeSlot"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots.map((slot) => {
                      const available = deliveryDate ? isSlotAvailable(deliveryDate, slot.value) : true
                      return (
                        <Button
                          key={slot.value}
                          type="button"
                          variant={field.value === slot.value ? "default" : "outline"}
                          className={cn(
                            "justify-start text-left h-auto py-2",
                            !available && "opacity-50 cursor-not-allowed",
                            field.value === slot.value && "bg-primary text-primary-foreground",
                          )}
                          disabled={!available}
                          onClick={() => field.onChange(slot.value)}
                        >
                          <div>
                            <div className="font-medium">{slot.label}</div>
                            {!available && <div className="text-xs text-muted-foreground">Unavailable</div>}
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.deliveryTimeSlot && <p className="text-sm text-destructive">{errors.deliveryTimeSlot.message}</p>}
            </div>
          </div>
        </div>

        {/* Return Section */}
        <div className="bg-muted/10 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            Return Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Return Date *</Label>
              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <Popover open={returnCalendarOpen} onOpenChange={setReturnCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.returnDate && "border-destructive",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Select return date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setReturnCalendarOpen(false)
                        }}
                        disabled={(date) => isBefore(date, minReturnDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.returnDate && <p className="text-sm text-destructive">{errors.returnDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Return Time Slot *</Label>
              <Controller
                name="returnTimeSlot"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.value}
                        type="button"
                        variant={field.value === slot.value ? "default" : "outline"}
                        className={cn(
                          "justify-start text-left h-auto py-2",
                          field.value === slot.value && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => field.onChange(slot.value)}
                      >
                        <div className="font-medium">{slot.label}</div>
                      </Button>
                    ))}
                  </div>
                )}
              />
              {errors.returnTimeSlot && <p className="text-sm text-destructive">{errors.returnTimeSlot.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Step
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? "Validating..." : "Continue to Payment"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
