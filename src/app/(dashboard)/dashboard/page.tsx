import Link from "next/link"
import { auth } from "@/auth"
import { getDashboardStats, getActiveVisits } from "@/lib/actions/dashboard.actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/StatCard"
import { CheckOutButton } from "@/components/CheckOutButton"
import {
  CalendarDays,
  UserCheck,
  BarChart2,
  Building2,
  UserPlus,
} from "lucide-react"

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function isOverdue(checkedInAtIso: string) {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
  return new Date(checkedInAtIso).getTime() < twoHoursAgo
}

const DEPT_COLORS = [
  { bg: "#E8F5E9", text: "#2E7D32" },
  { bg: "#E3F2FD", text: "#1976D2" },
  { bg: "#F3E5F5", text: "#7B1FA2" },
  { bg: "#FFF3E0", text: "#F57C00" },
]

function LogVisitButton({ label }: { label: string }) {
  return (
    <Button
      nativeButton={false}
      render={<Link href="/log-visit" />}
      className="gap-1.5 border-none px-4 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-md hover:brightness-110"
      style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
    >
      <UserPlus className="size-3.5" />
      {label}
    </Button>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user
  const firstName = user.name?.trim().split(/\s+/)[0] ?? ""

  const [stats, activeVisits] = await Promise.all([
    getDashboardStats(),
    getActiveVisits(),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "#1A1A2E",
            }}
          >
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "#546E7A" }}>
            {getGreeting()}, {firstName}
          </p>
        </div>
        <LogVisitButton label="Log New Visit" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Today's Visitors"
          value={stats.todayCount}
          icon={CalendarDays}
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
        />
        <StatCard
          title="Currently Inside"
          value={stats.activeCount}
          icon={UserCheck}
          iconBg="#FFF3E0"
          iconColor="#F57C00"
          valueColor={stats.activeCount > 0 ? "#F57C00" : "#1A1A2E"}
          accentBorder="#F57C00"
          pulse={stats.activeCount > 0}
        />
        <StatCard
          title="This Month"
          value={stats.monthCount}
          icon={BarChart2}
          iconBg="#E3F2FD"
          iconColor="#1976D2"
          valueColor="#1976D2"
        />
        <StatCard
          title="Departments"
          value={stats.departmentCount}
          icon={Building2}
          iconBg="#F3E5F5"
          iconColor="#7B1FA2"
        />
      </div>

      {/* Active visits */}
      <div
        className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "#F3F4F6" }}
        >
          <div className="flex items-center gap-2">
            <h2
              className="text-[15px] font-semibold"
              style={{ color: "#1A1A2E" }}
            >
              Currently Inside
            </h2>
            {activeVisits.length > 0 && <span className="pulse-dot size-2" />}
          </div>
          <p className="text-sm" style={{ color: "#546E7A" }}>
            {activeVisits.length} visitor{activeVisits.length === 1 ? "" : "s"}{" "}
            inside
          </p>
        </div>

        {activeVisits.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-12">
            <UserCheck className="size-12" style={{ color: "#D1D5DB" }} />
            <p
              className="mt-4 text-[15px] font-medium"
              style={{ color: "#374151" }}
            >
              No visitors currently inside
            </p>
            <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>
              Logged-in visitors will appear here
            </p>
            <div className="mt-4">
              <LogVisitButton label="Log a Visit" />
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Visitor
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  CNIC
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Purpose
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Host
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Department
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Check-in Time
                </TableHead>
                <TableHead className="px-5 py-3 text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVisits.map((v) => {
                const initial = v.visitor.name.trim()[0]?.toUpperCase() ?? "?"
                const dept = v.department
                  ? DEPT_COLORS[v.department.id % DEPT_COLORS.length]
                  : null
                const overdue = isOverdue(v.checkedInAt)

                return (
                  <TableRow
                    key={v.id}
                    className="border-b border-gray-50 transition-colors hover:bg-green-50/30"
                  >
                    <TableCell className="px-5 py-3.5 text-sm text-[#374151]">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ background: "#1B5E20" }}
                        >
                          {initial}
                        </div>
                        {v.visitor.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-mono text-xs text-[#6B7280]">
                      {v.visitor.cnic}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-[#374151]">
                      {v.purpose}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-[#374151]">
                      {v.hostName}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm">
                      {dept ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: dept.bg, color: dept.text }}
                        >
                          {v.department!.name}
                        </span>
                      ) : (
                        <span className="text-[#374151]">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="px-5 py-3.5 text-sm"
                      style={{ color: overdue ? "#F57C00" : "#374151" }}
                    >
                      {formatTime(v.checkedInAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm">
                      <CheckOutButton visitLogId={v.id} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
