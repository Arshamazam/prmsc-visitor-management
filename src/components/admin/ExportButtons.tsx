"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ExportButtons() {
  const searchParams = useSearchParams()

  const buildExportUrl = (format: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    params.set("format", format)
    return `/api/admin/export?${params.toString()}`
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={buildExportUrl("csv")} />}
      >
        Export CSV
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<a href={buildExportUrl("pdf")} />}
      >
        Export PDF
      </Button>
    </div>
  )
}
