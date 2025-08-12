"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { RescheduleModal } from "@/components/orders/reschedule-modal"
import { ExtendRentalModal } from "@/components/orders/extend-rental-modal"
import { showComingSoonToast } from "@/components/ui/coming-soon-toast"
import { FileText, Calendar, Clock, MessageCircle, Package, CheckCircle, AlertTriangle } from "lucide-react"

interface Order {
  id: string
  status: "confirmed" | "picked-up" | "due-return" | "returned" | "late"
  paymentStatus: "paid" | "pending" | "failed"
  createdAt: string
  deliveryDate: string
  returnDate: string
  total: number
  items: Array<{
    name: string
    image: string
    qty: number
    tenureType: string
  }>
  contactInfo: {
    name: string
    phone: string
    address: string
  }
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [showExtend, setShowExtend] = useState(false)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          variant: "default" as const,
          icon: CheckCircle,
          color: "text-green-600",
        }
      case "picked-up":
        return {
          label: "Picked Up",
          variant: "secondary" as const,
          icon: Package,
          color: "text-blue-600",
        }
      case "due-return":
        return {
          label: "Due for Return",
          variant: "destructive" as const,
          icon: AlertTriangle,
          color: "text-orange-600",
        }
      case "returned":
        return {
          label: "Returned",
          variant: "outline" as const,
          icon: CheckCircle,
          color: "text-gray-600",
        }
      case "late":
        return {
          label: "Late Return",
          variant: "destructive" as const,
          icon: AlertTriangle,
          color: "text-red-600",
        }
      default:
        return {
          label: status,
          variant: "outline" as const,
          icon: Package,
          color: "text-gray-600",
        }
    }
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  const handleViewContract = () => {
    // In a real app, this would open a PDF contract
    showComingSoonToast() // "Opening contract PDF..."
    window.open(`/contracts/${order.id}.pdf`, "_blank")
  }

  const handleWhatsAppHelp = () => {
    const message = `Hi! I need help with my order ${order.id}. Can you please assist me?`
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(order.total)}</div>
              <div className="text-sm text-muted-foreground">{order.items.length} items</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-3">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded border border-border">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.qty} • {item.tenureType} rental
                  </p>
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-muted-foreground">+{order.items.length - 2} more items</p>
            )}
          </div>

          <Separator />

          {/* Delivery & Return Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-foreground">Delivery</div>
                <div className="text-muted-foreground">
                  {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              <div>
                <div className="font-medium text-foreground">Return</div>
                <div className="text-muted-foreground">
                  {new Date(order.returnDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleViewContract} className="bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              View Contract
            </Button>

            {(order.status === "confirmed" || order.status === "picked-up") && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowReschedule(true)} className="bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExtend(true)} className="bg-transparent">
                  <Clock className="mr-2 h-4 w-4" />
                  Extend Rental
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleWhatsAppHelp} className="bg-transparent">
              <MessageCircle className="mr-2 h-4 w-4" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <RescheduleModal
        open={showReschedule}
        onOpenChange={setShowReschedule}
        order={order}
        onReschedule={(newDates) => {
          console.log("Rescheduling order:", order.id, newDates)
          showComingSoonToast() // "Order rescheduled successfully!"
          setShowReschedule(false)
        }}
      />

      <ExtendRentalModal
        open={showExtend}
        onOpenChange={setShowExtend}
        order={order}
        onExtend={(newEndDate, extraCharge) => {
          console.log("Extending rental:", order.id, newEndDate, extraCharge)
          showComingSoonToast() // "Rental extended successfully!"
          setShowExtend(false)
        }}
      />
    </>
  )
}
