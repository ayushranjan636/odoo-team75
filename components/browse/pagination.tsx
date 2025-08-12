"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useProductFilters } from "@/hooks/use-product-filters"

interface PaginationProps {
  totalItems: number
  itemsPerPage: number
}

export function Pagination({ totalItems, itemsPerPage }: PaginationProps) {
  const { filters, updateFilters } = useProductFilters()
  const currentPage = filters.page || 1
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters({ page: newPage })
      window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top on page change
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Number of page buttons to show directly

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }

      if (startPage > 1) {
        pageNumbers.push(1)
        if (startPage > 2) pageNumbers.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      {renderPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-2 text-muted-foreground">
            {page}
          </span>
        ),
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}
