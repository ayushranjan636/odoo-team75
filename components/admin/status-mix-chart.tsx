"use client"

import { PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StatusMixChartProps {
  data: Array<{ status: string; count: number; fill: string }>
}

const chartConfig = {
  reserved: { label: "Reserved", color: "#3b82f6" },
  "picked-up": { label: "Picked Up", color: "#10b981" },
  returned: { label: "Returned", color: "#6b7280" },
  late: { label: "Late", color: "#ef4444" },
}

export function StatusMixChart({ data }: StatusMixChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          label={({ status, percent }) => `${status} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  )
}
