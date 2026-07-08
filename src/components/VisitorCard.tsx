"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type VisitorCardProps = {
  visitor: {
    id: string
    name: string
    cnic: string
    phone: string | null
    photoUrl: string | null
    visitLogs: Array<{
      checkedInAt: string
      department: { name: string } | null
    }>
  }
  onSelect: () => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(
    new Date(iso)
  )
}

export function VisitorCard({ visitor, onSelect }: VisitorCardProps) {
  const lastVisit = visitor.visitLogs[0]

  return (
    <Card className="flex flex-row items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        {visitor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visitor.photoUrl}
            alt={visitor.name}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {getInitials(visitor.name)}
          </div>
        )}
        <div>
          <p className="font-medium">{visitor.name}</p>
          <p className="text-sm text-muted-foreground">{visitor.cnic}</p>
          {lastVisit && (
            <p className="text-xs text-muted-foreground">
              Last visit: {formatDate(lastVisit.checkedInAt)}
            </p>
          )}
        </div>
      </div>
      <Button type="button" variant="default" onClick={onSelect}>
        Use this Visitor
      </Button>
    </Card>
  )
}
