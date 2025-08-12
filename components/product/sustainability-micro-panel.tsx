import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Leaf, IndianRupee, Recycle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface SustainabilityMicroPanelProps {
  sustainability: {
    co2_new: number
    co2_reuse: number
    weight_kg: number
    waste_factor: number
    retail_cost?: number
  }
}

export function SustainabilityMicroPanel({ sustainability }: SustainabilityMicroPanelProps) {
  const co2Saved = sustainability.co2_new - sustainability.co2_reuse
  const wasteAvoided = sustainability.weight_kg * sustainability.waste_factor
  const moneySaved = sustainability.retail_cost ? sustainability.retail_cost * 0.5 : 0 // Mock 50% saving

  return (
    <div className="bg-muted/10 p-4 rounded-lg space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Sustainability Impact</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center space-y-1 cursor-help">
                <Leaf className="h-6 w-6 text-sustainability-green" />
                <span className="text-sm font-medium text-foreground">{co2Saved} kg</span>
                <span className="text-xs text-muted-foreground">CO₂ Saved</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
              <p>Calculated as (CO₂ from new – CO₂ from rental reuse) × units rented.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center space-y-1 cursor-help">
                <IndianRupee className="h-6 w-6 text-sustainability-amber" />
                <span className="text-sm font-medium text-foreground">{formatCurrency(moneySaved)}</span>
                <span className="text-xs text-muted-foreground">Money Saved</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
              <p>Calculated as (Retail cost – Rental cost) × units rented.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center space-y-1 cursor-help">
                <Recycle className="h-6 w-6 text-sustainability-teal" />
                <span className="text-sm font-medium text-foreground">{wasteAvoided} kg</span>
                <span className="text-xs text-muted-foreground">Waste Avoided</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-card text-foreground border-border shadow-md max-w-xs">
              <p>Calculated as (Product weight × waste factor if discarded).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
