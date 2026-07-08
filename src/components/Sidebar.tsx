"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  BarChart2,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarProps = {
  role?: string
}

type NavLink = {
  href: string
  label: string
  icon: LucideIcon
}

const mainLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log-visit", label: "Log Visit", icon: UserPlus },
  { href: "/visit-logs", label: "Visit History", icon: ClipboardList },
]

const adminLinks: NavLink[] = [
  { href: "/admin/visits", label: "All Visits", icon: BarChart2 },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const renderLink = ({ href, label, icon: Icon }: NavLink) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <Icon className="size-4" />
        {label}
      </Link>
    )
  }

  return (
    <aside className="flex w-56 flex-col border-r pt-4">
      <nav className="flex flex-col gap-1 px-2">
        {mainLinks.map(renderLink)}
        {role === "ADMIN" && (
          <>
            <div className="my-2 border-t" />
            {adminLinks.map(renderLink)}
          </>
        )}
      </nav>
    </aside>
  )
}
