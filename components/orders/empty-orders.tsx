import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, ArrowRight } from "lucide-react"

interface EmptyOrdersProps {
  title: string
  description: string
  actionText: string
  actionHref: string
}

export function EmptyOrders({ title, description, actionText, actionHref }: EmptyOrdersProps) {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto bg-muted/20 rounded-full flex items-center justify-center mb-6">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>

      <Link href={actionHref} prefetch={false}>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          {actionText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
