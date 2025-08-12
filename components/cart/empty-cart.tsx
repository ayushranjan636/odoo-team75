import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRight } from "lucide-react"

export function EmptyCart() {
  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added any items to your cart yet. Start browsing to find amazing rental products!
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/browse" prefetch={false}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg font-semibold">
              Start Browsing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/" prefetch={false}>
            <Button variant="outline" className="w-full py-3 text-lg font-semibold bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
