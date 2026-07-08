import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  title: string
  value: number
  icon: LucideIcon
  description?: string
  highlight?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  highlight,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-semibold",
            highlight && "text-green-600 dark:text-green-500"
          )}
        >
          {value}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
