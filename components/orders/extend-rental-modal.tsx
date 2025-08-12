"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Plus } from "lucide-react"
import { format, addDays, differenceInDays, isBefore } from "date-fns"
import { cn, formatCurrency } from "@/lib/utils"

interface Order {
  id: string
  returnDate: string
  total: number
}

interface ExtendRentalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onExtend: (newEndDate: Date, extraCharge: number) => void
}

export function ExtendRentalModal({ open, onOpenChange, order, onExtend }: ExtendRentalModalProps) {
  const [newEndDate, setNewEndDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const currentEndDate = new Date(order.returnDate)
  const minExtendDate = addDays(currentEndDate, 1)

  // Calculate extra charge (mock calculation)
  const extraDays = newEndDate ? differenceInDays(newEndDate, currentEndDate) : 0
  const dailyRate = order.total * 0.06 // Assume 6% of total as daily rate
  const extraCharge = extraDays * dailyRate

  const handleExtend = () => {
    if (newEndDate) {
      onExtend(newEndDate, extraCharge)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Rental Period</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/10 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-foreground">Current Rental Period</h3>
            <p className="text-sm text-muted-foreground">
              Order #{order.id} • Ends on {format(currentEndDate, "PPP")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Return Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newEndDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEndDate ? format(newEndDate, "PPP") : "Select new return date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEndDate}
                    onSelect={(date) => {
                      setNewEndDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => isBefore(date, minExtendDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {newEndDate && (
              <div className="bg-muted/10 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Extension Details</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Days</span>
                    <span className="text-foreground font-medium">{extraDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="text-foreground">{formatCurrency(dailyRate)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Extra Charge</span>
                    <span className="font-semibold text-primary">{formatCurrency(extraCharge)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  *Payment will be processed automatically using your saved payment method
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleExtend} className="flex-1" disabled={!newEndDate || extraDays <= 0}>
              Extend for {formatCurrency(extraCharge)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
