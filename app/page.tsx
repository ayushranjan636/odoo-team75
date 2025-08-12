import { PromoTicker } from "@/components/home/promo-ticker"
import { HeroVideoSection } from "@/components/home/hero-video-section"
import { SustainabilityMetrics } from "@/components/home/sustainability-metrics"
import { CategoryQuickFilter } from "@/components/home/category-quick-filter"
import { TrendingProducts } from "@/components/home/trending-products"
import { CategoryShowcase } from "@/components/home/category-showcase"
import { HowItWorks } from "@/components/home/how-it-works"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <main className="flex-1">
      <PromoTicker />
      <HeroVideoSection />
      <CategoryQuickFilter />
      <SustainabilityMetrics />
      <TrendingProducts />
      <CategoryShowcase />
      <HowItWorks />
      <WhatsAppButton />
    </main>
  )
}
