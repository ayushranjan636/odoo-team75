"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Package, AlertTriangle, Clock, Wallet } from "lucide-react"

interface KpiCardsProps {
  kpis: {
    totalRevenue: number
    activeRentals: number
    lateReturns: number
    avgTenure: number
    depositLiability: number
  }
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    totalRevenue: 0,
    activeRentals: 0,
    lateReturns: 0,
    avgTenure: 0,
    depositLiability: 0,
  })

  // Count-up animation effect
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const intervals = Object.keys(kpis).map((key) => {
      const targetValue = kpis[key as keyof typeof kpis]
      const increment = targetValue / steps
      let currentValue = 0

      return setInterval(() => {
        currentValue += increment
        if (currentValue >= targetValue) {
          currentValue = targetValue
          clearInterval(intervals.find((_, i) => Object.keys(kpis)[i] === key))
        }
        setAnimatedValues((prev) => ({
          ...prev,
          [key]: Math.round(currentValue),
        }))
      }, stepDuration)
    })

    return () => intervals.forEach(clearInterval)
  }, [kpis])

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(animatedValues.totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Rentals",
      value: animatedValues.activeRentals.toLocaleString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Late Returns",
      value: animatedValues.lateReturns.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Avg Tenure",
      value: `${animatedValues.avgTenure} days`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Deposit Liability",
      value: formatCurrency(animatedValues.depositLiability),
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
