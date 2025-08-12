"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format, addDays, isBefore } from "date-fns"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  deliveryDate: string
  returnDate: string
}

interface RescheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onReschedule: (newDates: { deliveryDate: Date; returnDate: Date; deliverySlot: string; returnSlot: string }) => void
}

const timeSlots = [
  { value: "10-13", label: "10:00 AM - 1:00 PM" },
  { value: "13-16", label: "1:00 PM - 4:00 PM" },
  { value: "16-19", label: "4:00 PM - 7:00 PM" },
  { value: "19-22", label: "7:00 PM - 10:00 PM" },
]

export function RescheduleModal({ open, onOpenChange, order, onReschedule }: RescheduleModalProps) {
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date(order.deliveryDate))
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date(order.returnDate))
  const [deliverySlot, setDeliverySlot] = useState("10-13")
  const [returnSlot, setReturnSlot] = useState("10-13")
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = useState(false)
  const [returnCalendarOpen, setReturnCalendarOpen] = useState(false)

  const handleReschedule = () => {
    if (deliveryDate && returnDate) {
      onReschedule({
        deliveryDate,
        returnDate,
        deliverySlot,
        returnSlot,
      })
    }
  }

  const minReturnDate = deliveryDate ? addDays(deliveryDate, 1) : addDays(new Date(), 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Order #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              New Delivery Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Delivery Date</Label>
                <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => {
                        setDeliveryDate(date)
                        setDeliveryCalendarOpen(false)
                      }}
                      disabled={(date) => isBefore(date, new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Delivery Time Slot</Label>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.value}
                      type="button"
                      variant={deliverySlot === slot.value ? "default" : "outline"}
                      className="justify-start text-left h-auto py-2"
                      onClick={() => setDeliverySlot(slot.value)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Return Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              New Return Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Popover open={returnCalendarOpen} onOpenChange={setReturnCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !returnDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "PPP") : "Select return date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={(date) => {
                        setReturnDate(date)
                        setReturnCalendarOpen(false)
                      }}
                      disabled={(date) => isBefore(date, minReturnDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Return Time Slot</Label>
                <div className="grid grid-cols-1 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.value}
                      type="button"
                      variant={returnSlot === slot.value ? "default" : "outline"}
                      className="justify-start text-left h-auto py-2"
                      onClick={() => setReturnSlot(slot.value)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleReschedule} className="flex-1" disabled={!deliveryDate || !returnDate}>
              Reschedule Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
