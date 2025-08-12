"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { Package, CheckCircle, AlertTriangle, Clock, CreditCard } from "lucide-react"

interface LiveOpsFeedProps {
  events: Array<{
    id: string
    type: string
    message: string
    timestamp: string
    orderId?: string
  }>
}

export function LiveOpsFeed({ events }: LiveOpsFeedProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "order_confirmed":
        return <Package className="h-4 w-4 text-green-600" />
      case "picked_up":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "returned":
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      case "late_flag":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case "order_confirmed":
        return (
          <Badge variant="default" className="text-xs">
            New Order
          </Badge>
        )
      case "picked_up":
        return (
          <Badge variant="secondary" className="text-xs">
            Pickup
          </Badge>
        )
      case "returned":
        return (
          <Badge variant="outline" className="text-xs">
            Return
          </Badge>
        )
      case "late_flag":
        return (
          <Badge variant="destructive" className="text-xs">
            Late
          </Badge>
        )
      case "payment":
        return (
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
            Payment
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Event
          </Badge>
        )
    }
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">{getEventIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getEventBadge(event.type)}
                {event.orderId && <span className="text-xs text-muted-foreground">#{event.orderId}</span>}
              </div>
              <p className="text-sm text-foreground">{event.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
