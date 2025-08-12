"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"

interface SchedulerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SchedulerModal({ isOpen, onClose }: SchedulerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [topic, setTopic] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null)

  const mockTimeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ]

  const handleBookCall = async () => {
    if (!selectedDate || !selectedTime) {
      showComingSoonToast() // "Please select date and time"
      return
    }

    setIsBooking(true)
    setBookingSuccess(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const jitsiLink = `https://meet.jit.si/RentifyConsultation-${Date.now()}` // Mock Jitsi link
    console.log("Call booked:", {
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      topic,
      meetUrl: jitsiLink,
    })

    setIsBooking(false)
    setBookingSuccess(true)
    showComingSoonToast() // "Call booked successfully!"
    // In a real app, you'd likely redirect or show a persistent success message
    // For now, we'll just close after a short delay
    setTimeout(() => {
      onClose()
      setBookingSuccess(null) // Reset for next open
      setSelectedDate(new Date())
      setSelectedTime(undefined)
      setTopic("")
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card text-foreground p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Schedule a Free Consultation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a date and time for your personalized consultation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date()} // Disable past dates
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Select onValueChange={setSelectedTime} value={selectedTime}>
              <SelectTrigger className="w-full">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {mockTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder="e.g., Furniture rental, Home office setup"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBookCall} disabled={isBooking || !selectedDate || !selectedTime}>
            {isBooking ? "Booking..." : "Book Call"}
          </Button>
        </div>
        {bookingSuccess === true && (
          <div className="mt-4 text-center text-sustainability-green font-medium">
            Call booked successfully! We'll send you a confirmation.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
