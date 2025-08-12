import Link from "next/link"
import { mockQuickFilterCategories } from "@/lib/mock-data"
import { Package, Sofa, Refrigerator, Monitor, Dumbbell, Baby } from "lucide-react"
import type React from "react"

const IconMap: { [key: string]: React.ElementType } = {
  Package: Package,
  Sofa: Sofa,
  Refrigerator: Refrigerator,
  Monitor: Monitor,
  Dumbbell: Dumbbell,
  Baby: Baby,
}

export function CategoryQuickFilter() {
  return (
    <section className="relative z-20 -mt-16 md:-mt-24 lg:-mt-32 pb-12 md:pb-16">
      {" "}
      {/* Reduced padding */}
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockQuickFilterCategories.map((category) => {
            const IconComponent = IconMap[category.icon]
            return (
              <Link
                key={category.slug}
                href={`/browse?category=${category.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border shadow-[0_8px_24px_rgba(0,0,0,.06)] text-center space-y-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary"
                prefetch={false}
              >
                {IconComponent && <IconComponent className="h-8 w-8 text-primary group-hover:text-secondary" />}
                <span className="text-sm font-medium text-foreground group-hover:text-primary">{category.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">{category.description}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
