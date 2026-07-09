import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  title: string
  value: number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  valueColor?: string
  trend?: string
  accentBorder?: string
  pulse?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = "#1A1A2E",
  trend,
  accentBorder,
  pulse,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        "transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      )}
      style={{
        borderColor: "#E5E7EB",
        borderLeft: accentBorder ? `3px solid ${accentBorder}` : undefined,
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-[#546E7A] uppercase">
          {title}
        </p>
        <div
          className="flex size-10 items-center justify-center rounded-full"
          style={{ background: iconBg }}
        >
          <Icon className="size-[18px]" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold" style={{ color: valueColor }}>
            {value}
          </p>
          {pulse && <span className="pulse-dot size-2" />}
        </div>
        {trend && <p className="text-xs text-[#9CA3AF]">{trend}</p>}
      </div>
    </div>
  )
}
