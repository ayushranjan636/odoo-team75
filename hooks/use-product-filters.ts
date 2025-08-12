"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"
import { format } from "date-fns"

export type ProductFilters = {
  q?: string
  category?: string
  page?: number
  limit?: number
  sort?: "popularity" | "price-asc" | "price-desc" | "newest"
  tenure?: "hour" | "day" | "week" | "month"
  minPrice?: number
  maxPrice?: number
  availableFrom?: Date
  availableTo?: Date
  pricelist?: string
  attributes?: { [key: string]: string[] }
}

export function useProductFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const searchParamsString = searchParams.toString()

  const currentFilters: ProductFilters = useMemo(() => {
    const filters: ProductFilters = {}

    const params = new URLSearchParams(searchParamsString)

    params.forEach((value, key) => {
      if (key === "page") {
        filters.page = Number.parseInt(value)
      } else if (key === "limit") {
        filters.limit = Number.parseInt(value)
      } else if (key === "minPrice") {
        filters.minPrice = Number.parseInt(value)
      } else if (key === "maxPrice") {
        filters.maxPrice = Number.parseInt(value)
      } else if (key === "availableFrom") {
        filters.availableFrom = new Date(value)
      } else if (key === "availableTo") {
        filters.availableTo = new Date(value)
      } else if (key.startsWith("attrs[")) {
        const attrName = key.substring(6, key.length - 1)
        if (!filters.attributes) filters.attributes = {}
        filters.attributes[attrName] = value.split(",")
      } else if (key === "q") {
        filters.q = value
      } else if (key === "category") {
        filters.category = value
      } else if (key === "sort") {
        filters.sort = value as "popularity" | "price-asc" | "price-desc" | "newest"
      } else if (key === "tenure" && (value === "hour" || value === "day" || value === "week" || value === "month")) {
        filters.tenure = value
      } else if (key === "pricelist") {
        filters.pricelist = value
      }
    })

    return filters
  }, [searchParamsString]) // Use stable string instead of searchParams object

  const updateFilters = useCallback(
    (newFilters: Partial<ProductFilters>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const key in newFilters) {
        const value = newFilters[key as keyof ProductFilters]
        if (value === undefined || value === null || value === "") {
          params.delete(key)
        } else if (key === "availableFrom" || key === "availableTo") {
          params.set(key, format(value as Date, "yyyy-MM-dd"))
        } else if (key === "attributes") {
          // Clear existing attributes first
          Array.from(params.keys()).forEach((paramKey) => {
            if (paramKey.startsWith("attrs[")) {
              params.delete(paramKey)
            }
          })
          // Add new attributes
          for (const attrName in value as { [key: string]: string[] }) {
            const attrValues = (value as { [key: string]: string[] })[attrName]
            if (attrValues && attrValues.length > 0) {
              params.set(`attrs[${attrName}]`, attrValues.join(","))
            }
          }
        } else {
          params.set(key, String(value))
        }
      }

      if (resetPage) {
        params.set("page", "1")
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  return {
    filters: currentFilters,
    updateFilters,
    clearFilters,
  }
}
