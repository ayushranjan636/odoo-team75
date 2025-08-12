"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GeoHeatmapProps {
  data: Array<{ city: string; orders: number; lat: number; lng: number }>
}

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
}

export function GeoHeatmap({ data }: GeoHeatmapProps) {
  // For simplicity, we'll show a bar chart instead of a complex map
  // In a real app, this would integrate with Mapbox or similar
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="city" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="orders" fill="var(--color-orders)" />
      </BarChart>
    </ChartContainer>
  )
}
