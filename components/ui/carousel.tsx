"use client"

// This is a placeholder for shadcn/ui's carousel component.
// In a real project, you would install it via `npx shadcn@latest add carousel`
// For v0, we assume it's available.
// I'm providing a minimal structure to make it work with the mock data.

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  opts?: {
    align?: "start" | "center" | "end"
    loop?: boolean
  }
  plugins?: any[]
  setApi?: (api: any) => void
}

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {}
interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {}

const CarouselContext = React.createContext<any>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel>")
  }
  return context
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ orientation = "horizontal", opts, plugins, setApi, className, children, ...props }, ref) => {
    // Mock API for basic functionality
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(React.Children.count(children))

    React.useEffect(() => {
      setCount(React.Children.count(children))
    }, [children])

    const scrollNext = React.useCallback(() => {
      setCurrent((prev) => (prev + 1) % count)
    }, [count])

    const scrollPrev = React.useCallback(() => {
      setCurrent((prev) => (prev - 1 + count) % count)
    }, [count])

    const api = React.useMemo(
      () => ({
        scrollNext,
        scrollPrev,
        selectedScrollSnap: () => current,
        scrollSnapList: () => Array.from({ length: count }, (_, i) => i),
      }),
      [scrollNext, scrollPrev, current, count],
    )

    React.useEffect(() => {
      if (setApi) {
        setApi(api)
      }
    }, [api, setApi])

    return (
      <CarouselContext.Provider value={{ api, orientation, opts, plugins, current, count }}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, current } = useCarousel()
    const childrenArray = React.Children.toArray(children)

    return (
      <div ref={ref} className="overflow-hidden">
        <div
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          style={{
            transform:
              orientation === "horizontal" ? `translateX(-${current * 100}%)` : `translateY(-${current * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
          {...props}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4")}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  },
)
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<HTMLButtonElement, CarouselPreviousProps>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, api } = useCarousel()
    const handleScrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        onClick={handleScrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    )
  },
)
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, api } = useCarousel()
    const handleScrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        onClick={handleScrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    )
  },
)
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
