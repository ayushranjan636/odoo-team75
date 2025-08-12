"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MostRentedChartProps {
  data: Array<{ name: string; count: number }>
}

const chartConfig = {
  count: {
    label: "Rentals",
    color: "hsl(var(--primary))",
  },
}

export function MostRentedChart({ data }: MostRentedChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" />
      </BarChart>
    </ChartContainer>
  )
}
