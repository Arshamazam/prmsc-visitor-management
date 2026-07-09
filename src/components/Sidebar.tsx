"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  BarChart2,
  Building2,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/actions/auth.actions"
import prmscLogo from "@/img/prmsc-logo.png"

type SidebarProps = {
  role?: string
  user: {
    name?: string | null
    role?: string
  }
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

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname()

  const renderLink = ({ href, label, icon: Icon }: NavLink) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "sidebar-link mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
          isActive
            ? "active bg-white/15 font-medium text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon className={cn("size-4", isActive ? "opacity-100" : "opacity-70")} />
        {label}
      </Link>
    )
  }

  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? "?"

  return (
    <aside
      className="fixed inset-y-0 left-0 hidden h-screen w-60 flex-col md:flex"
      style={{
        background: "linear-gradient(180deg, #0D3B12 0%, #1B5E20 100%)",
      }}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <Image
          src={prmscLogo}
          alt="PRMSC"
          style={{ height: 32, width: "auto" }}
        />
        <span className="text-base font-bold text-white">PRMSC</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
          VMS
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        {mainLinks.map(renderLink)}

        {role === "ADMIN" && (
          <>
            <p className="mt-4 mb-2 px-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
              Administration
            </p>
            {adminLinks.map(renderLink)}
          </>
        )}
      </nav>

      {/* Bottom user card */}
      <div className="w-full border-t border-white/10">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="text-xs text-white/50">{user.role}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
