"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
  total: number
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  total,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`${basePath}?${params.toString()}`)
  }

  const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const windowEnd = Math.min(totalPages, windowStart + 4)
  const pages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  )

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} — {total.toLocaleString()} total
        records
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            type="button"
            variant={p === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
