import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="container py-12 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <p className="text-muted-foreground">The product you're looking for doesn't exist or may have been removed.</p>
        <Button asChild>
          <Link href="/browse">Back to Catalog</Link>
        </Button>
      </div>
    </div>
  )
}
