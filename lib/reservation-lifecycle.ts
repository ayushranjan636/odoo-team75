export type ReservationStatus = "reserved" | "picked_up" | "returned" | "late" | "cancelled" | "extended"

export interface ReservationLifecycleEvent {
  reservationId: string
  fromStatus: ReservationStatus
  toStatus: ReservationStatus
  timestamp: string
  metadata?: Record<string, any>
}

export class ReservationLifecycleManager {
  static async markPickedUp(reservationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "picked_up",
          pickedUpAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark reservation as picked up")
      }

      // Log lifecycle event
      this.logLifecycleEvent({
        reservationId,
        fromStatus: "reserved",
        toStatus: "picked_up",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error marking reservation as picked up:", error)
      throw error
    }
  }

  static async markReturned(reservationId: string, condition?: string): Promise<number> {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "returned",
          returnedAt: new Date().toISOString(),
          condition: condition || "good",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark reservation as returned")
      }

      const result = await response.json()

      // Log lifecycle event
      this.logLifecycleEvent({
        reservationId,
        fromStatus: "picked_up",
        toStatus: "returned",
        timestamp: new Date().toISOString(),
        metadata: { condition },
      })

      return result.depositRefund || 0
    } catch (error) {
      console.error("Error marking reservation as returned:", error)
      throw error
    }
  }

  static async extendRental(reservationId: string, newEndDate: Date, additionalCharge: number): Promise<void> {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "extended",
          endAt: newEndDate.toISOString(),
          additionalCharge,
          extendedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extend reservation")
      }

      // Log lifecycle event
      this.logLifecycleEvent({
        reservationId,
        fromStatus: "picked_up",
        toStatus: "extended",
        timestamp: new Date().toISOString(),
        metadata: { newEndDate: newEndDate.toISOString(), additionalCharge },
      })
    } catch (error) {
      console.error("Error extending reservation:", error)
      throw error
    }
  }

  static async processLateReturns(): Promise<void> {
    try {
      // Fetch all active reservations
      const response = await fetch("/api/reservations?status=picked_up")
      const { reservations } = await response.json()

      const now = new Date()
      const graceDays = 1 // From settings

      for (const reservation of reservations) {
        const endDate = new Date(reservation.endAt)
        const gracePeriodEnd = new Date(endDate.getTime() + graceDays * 24 * 60 * 60 * 1000)

        if (now > gracePeriodEnd && reservation.status !== "late") {
          // Mark as late and apply fee
          await fetch(`/api/reservations/${reservation.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "late",
              markedLateAt: now.toISOString(),
            }),
          })

          // Log lifecycle event
          this.logLifecycleEvent({
            reservationId: reservation.id,
            fromStatus: "picked_up",
            toStatus: "late",
            timestamp: now.toISOString(),
            metadata: { daysLate: Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) },
          })

          // Send notifications (email, WhatsApp, etc.)
          await this.sendLateReturnNotification(reservation)
        }
      }
    } catch (error) {
      console.error("Error processing late returns:", error)
    }
  }

  private static async sendLateReturnNotification(reservation: any): Promise<void> {
    // Mock notification sending
    console.log(`Sending late return notification for reservation ${reservation.id}`)

    // In real app, integrate with email service and WhatsApp API
    // await emailService.sendLateReturnNotification(reservation)
    // await whatsappService.sendLateReturnNotification(reservation)
  }

  private static logLifecycleEvent(event: ReservationLifecycleEvent): void {
    console.log("Reservation lifecycle event:", event)
    // In real app, save to database for audit trail
  }
}

export class SustainabilityCalculator {
  static calculateImpact(product: any, quantity: number, rentalDuration: number) {
    // Default sustainability values if not provided
    const co2New = product.sustainability?.co2_new || 120 // kg CO2 for new product
    const co2Reuse = product.sustainability?.co2_reuse || 20 // kg CO2 for rental/reuse
    const weightKg = product.sustainability?.weight_kg || 10 // product weight
    const wasteFactor = product.sustainability?.waste_factor || 0.6 // waste reduction factor
    const retailCost = product.salesPrice || 0

    // Calculate impacts per specification formulas
    const co2Saved = (co2New - co2Reuse) * quantity // CO₂ Saved = (CO₂_new − CO₂_reuse) × units_rented
    const moneySaved = (retailCost - retailCost * 0.06 * rentalDuration) * quantity // Money Saved = (Retail − Rental) × units_rented
    const wasteAvoided = weightKg * wasteFactor * quantity // Waste Avoided = (Weight × Waste_factor)

    return {
      co2Saved: Math.round(co2Saved * 100) / 100, // Round to 2 decimal places
      moneySaved: Math.round(moneySaved),
      wasteAvoided: Math.round(wasteAvoided * 100) / 100,
    }
  }

  static aggregateUserImpact(userOrders: any[]): { co2Saved: number; moneySaved: number; wasteAvoided: number } {
    return userOrders.reduce(
      (total, order) => {
        order.items.forEach((item: any) => {
          const impact = this.calculateImpact(item.product, item.quantity, item.rentalDuration || 7)
          total.co2Saved += impact.co2Saved
          total.moneySaved += impact.moneySaved
          total.wasteAvoided += impact.wasteAvoided
        })
        return total
      },
      { co2Saved: 0, moneySaved: 0, wasteAvoided: 0 },
    )
  }
}
