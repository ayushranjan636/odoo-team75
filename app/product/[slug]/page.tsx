import { ProductDetails } from "@/components/product/product-details"

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // The ProductDetails component will handle product validation and loading
  return (
    <main className="flex-1 bg-background">
      <ProductDetails productSlug={slug} />
    </main>
  )
}
