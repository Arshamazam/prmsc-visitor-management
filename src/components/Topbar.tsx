"use client"

import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { LiveClock } from "@/components/LiveClock"

type TopbarProps = {
  user: {
    name?: string | null
    role?: string
  }
}

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/log-visit": "Log Visit",
  "/visit-logs": "Visit History",
  "/admin/visits": "All Visits",
  "/admin/departments": "Departments",
  "/admin/users": "Users",
}

function getTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  const match = Object.keys(TITLES).find((path) => pathname.startsWith(path))
  return match ? TITLES[match] : "PRMSC"
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname()
  const title = getTitle(pathname)
  const isAdmin = user.role === "ADMIN"
  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? "?"

  return (
    <header
      className="fixed inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-6 md:ml-60"
      style={{
        borderColor: "#E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <h1 className="text-base font-semibold" style={{ color: "#1A1A2E" }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <LiveClock />

        <div className="h-6 w-px bg-gray-200" />

        <button
          type="button"
          className="relative cursor-pointer text-[#546E7A] transition-colors hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          <span
            className="absolute top-0 right-0 size-1.5 rounded-full"
            style={{ background: "#2E7D32" }}
          />
        </button>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "#1B5E20" }}
          >
            {initial}
          </div>
          <span className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
            {user.name}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={
              isAdmin
                ? { background: "#DBEAFE", color: "#1D4ED8" }
                : { background: "#D1FAE5", color: "#065F46" }
            }
          >
            {user.role}
          </span>
        </div>
      </div>
    </header>
  )
}
