"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckOutButton } from "@/components/CheckOutButton"
import { VisitorPhotoCell } from "@/components/VisitorPhotoCell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Search,
  Printer,
  CalendarX2,
  UserPlus,
} from "lucide-react"

type VisitLog = {
  id: string
  purpose: string
  hostName: string
  checkedInAt: string
  checkedOutAt: string | null
  isLongStay: boolean
  visitor: {
    name: string
    cnic: string
    photoUrl: string | null
  }
  department: { id: number; name: string } | null
}

type VisitHistoryClientProps = {
  visitLogs: VisitLog[]
  dateParam: string | null
  targetDateIso: string
}

type StatusFilter = "all" | "active" | "completed"

const DEPT_COLORS = [
  "bg-[#E8F5E9] text-[#1B5E20]",
  "bg-[#E1F5FE] text-[#0277BD]",
  "bg-[#F3E5F5] text-[#7B1FA2]",
  "bg-[#FFF3E0] text-[#E65100]",
  "bg-[#FCE4EC] text-[#C2185B]",
]

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso))
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function formatDuration(mins: number) {
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`
  return `${mins}m`
}

// Kept as a standalone function (not inline in the component body) — a bare
// Date.now() call directly inside a component trips React's
// react-hooks/purity lint rule.
function getElapsedLabel(checkedInIso: string) {
  const mins = Math.round((Date.now() - new Date(checkedInIso).getTime()) / 60000)
  return formatDuration(mins)
}

function getPurposeStyle(purpose: string) {
  const p = purpose.toLowerCase()
  if (p.includes("meet")) return "bg-blue-100 text-blue-700"
  if (p.includes("doc")) return "bg-purple-100 text-purple-700"
  if (p.includes("interview")) return "bg-orange-100 text-orange-700"
  if (p.includes("inspect")) return "bg-red-100 text-red-700"
  if (p.includes("deliver")) return "bg-yellow-100 text-yellow-700"
  return "bg-gray-100 text-gray-600"
}

function GradientButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-md"
      style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
    >
      <UserPlus size={14} />
      {label}
    </a>
  )
}

export function VisitHistoryClient({
  visitLogs,
  targetDateIso,
}: VisitHistoryClientProps) {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const targetDate = new Date(targetDateIso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday =
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate()

  function goToDate(d: Date) {
    router.push(`/visit-logs?date=${toInputDate(d)}`)
  }

  function goPrev() {
    const d = new Date(targetDate)
    d.setDate(d.getDate() - 1)
    goToDate(d)
  }

  function goNext() {
    const d = new Date(targetDate)
    d.setDate(d.getDate() + 1)
    goToDate(d)
  }

  // Summary strip — computed from the full (unfiltered) day's records
  const totalVisits = visitLogs.length
  const activeVisits = visitLogs.filter((v) => !v.checkedOutAt).length
  const completedVisits = visitLogs.filter((v) => v.checkedOutAt).length
  const avgDuration =
    completedVisits > 0
      ? Math.round(
          visitLogs
            .filter((v) => v.checkedOutAt)
            .reduce(
              (sum, v) =>
                sum +
                (new Date(v.checkedOutAt!).getTime() -
                  new Date(v.checkedInAt).getTime()),
              0
            ) /
            completedVisits /
            60000
        )
      : 0

  const filtered = visitLogs
    .filter((v) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? !v.checkedOutAt
          : !!v.checkedOutAt
    )
    .filter((v) =>
      searchQuery === ""
        ? true
        : v.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.visitor.cnic.includes(searchQuery) ||
          v.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 22,
              color: "#1A1A2E",
            }}
          >
            Visit History
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "#546E7A" }}>
            {isToday
              ? `Today — ${formatFullDate(targetDateIso)}`
              : `Viewing records for ${formatFullDate(targetDateIso)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#374151] hover:bg-gray-50"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <div className="relative inline-block">
            <div className="pointer-events-none flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#374151]">
              <Calendar size={14} style={{ color: "#546E7A" }} />
              {formatShortDate(targetDateIso)}
            </div>
            <input
              type="date"
              aria-label="Jump to date"
              value={toInputDate(targetDate)}
              onChange={(e) => {
                if (e.target.value) goToDate(new Date(`${e.target.value}T00:00:00`))
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={isToday}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#374151] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Next
            <ChevronRight size={14} />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => router.push("/visit-logs")}
              className="rounded-lg border px-3 py-2 text-sm font-medium"
              style={{
                background: "#E8F5E9",
                color: "#1B5E20",
                borderColor: "#A7D7AA",
              }}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div
            className="flex size-8 items-center justify-center rounded-full"
            style={{ background: "#E8F5E9" }}
          >
            <Users size={14} style={{ color: "#1B5E20" }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "#1A1A2E" }}>
              {totalVisits}
            </p>
            <p className="text-xs" style={{ color: "#546E7A" }}>
              Total Visits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div
            className="flex size-8 items-center justify-center rounded-full"
            style={{ background: "#FFF3E0" }}
          >
            <UserCheck size={14} style={{ color: "#F57C00" }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p
                className="text-lg font-bold"
                style={{ color: activeVisits > 0 ? "#F57C00" : "#374151" }}
              >
                {activeVisits}
              </p>
              {activeVisits > 0 && <span className="pulse-dot size-1.5" />}
            </div>
            <p className="text-xs" style={{ color: "#546E7A" }}>
              Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div
            className="flex size-8 items-center justify-center rounded-full"
            style={{ background: "#E8F5E9" }}
          >
            <CheckCircle2 size={14} style={{ color: "#2E7D32" }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "#2E7D32" }}>
              {completedVisits}
            </p>
            <p className="text-xs" style={{ color: "#546E7A" }}>
              Checked Out
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div
            className="flex size-8 items-center justify-center rounded-full"
            style={{ background: "#E1F5FE" }}
          >
            <Clock size={14} style={{ color: "#0277BD" }} />
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: "#0277BD" }}>
              {completedVisits > 0 ? `${avgDuration}m` : "—"}
            </p>
            <p className="text-xs" style={{ color: "#546E7A" }}>
              Avg Duration
            </p>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, CNIC, host, or purpose..."
            className="h-[38px] w-full rounded-lg border border-gray-200 pr-3 pl-9 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["completed", "Checked Out"],
            ] as const
          ).map(([value, label]) => {
            const selected = statusFilter === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  !selected && "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}
                style={
                  selected
                    ? {
                        background:
                          value === "all"
                            ? "#1F2937"
                            : value === "active"
                              ? "#F97316"
                              : "#1B5E20",
                        color: "#fff",
                      }
                    : undefined
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        <p className="ml-auto text-sm whitespace-nowrap" style={{ color: "#9CA3AF" }}>
          Showing {filtered.length} of {totalVisits} records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {visitLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16">
            <CalendarX2 size={56} style={{ color: "#D1D5DB" }} />
            <p
              className="mt-4 text-base font-semibold"
              style={{ color: "#374151" }}
            >
              No visits recorded
            </p>
            <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>
              No visitors were logged on {formatFullDate(targetDateIso)}
            </p>
            {isToday && (
              <div className="mt-4">
                <GradientButton href="/log-visit" label="Log a Visit" />
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16">
            <Search size={40} style={{ color: "#D1D5DB" }} />
            <p
              className="mt-3 text-[15px] font-semibold"
              style={{ color: "#374151" }}
            >
              No matches found
            </p>
            <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>
              Try adjusting your search or filter
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
              className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#F8FAFC" }} className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Photo
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Visitor
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  CNIC
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Purpose
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Host &amp; Dept
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Time
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => {
                const isActive = !log.checkedOutAt
                const deptColor = log.department
                  ? DEPT_COLORS[log.department.id % DEPT_COLORS.length]
                  : null
                const durationMins = log.checkedOutAt
                  ? Math.round(
                      (new Date(log.checkedOutAt).getTime() -
                        new Date(log.checkedInAt).getTime()) /
                        60000
                    )
                  : null

                return (
                  <TableRow
                    key={log.id}
                    className="border-b border-gray-50 transition-colors duration-100 hover:bg-green-50/20"
                    style={{
                      borderLeft: `3px solid ${isActive ? "#F59E0B" : "#E5E7EB"}`,
                    }}
                  >
                    <TableCell className="px-4 py-3">
                      <VisitorPhotoCell
                        name={log.visitor.name}
                        photoUrl={log.visitor.photoUrl}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                        {log.visitor.name}
                      </p>
                      <p className="font-mono text-xs" style={{ color: "#9CA3AF" }}>
                        #{log.id.slice(-6).toUpperCase()}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm" style={{ color: "#546E7A" }}>
                      {log.visitor.cnic}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="max-w-[160px] truncate text-sm font-medium" style={{ color: "#374151" }}>
                        {log.purpose}
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                          getPurposeStyle(log.purpose)
                        )}
                      >
                        {log.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: "#374151" }}>
                        {log.hostName}
                      </p>
                      {log.department && (
                        <span
                          className={cn(
                            "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                            deptColor
                          )}
                        >
                          {log.department.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: "#374151" }}>
                        {formatTime(log.checkedInAt)}
                      </p>
                      {durationMins !== null ? (
                        <p className="text-xs" style={{ color: "#9CA3AF" }}>
                          {formatDuration(durationMins)}
                        </p>
                      ) : log.isLongStay ? (
                        <p className="text-xs text-amber-600">
                          {getElapsedLabel(log.checkedInAt)} ⚠
                        </p>
                      ) : (
                        <p className="text-xs text-green-600">Active</p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {isActive ? (
                        <span
                          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                          style={{
                            background: "#FFF3E0",
                            color: "#E65100",
                            borderColor: "#FED7AA",
                          }}
                        >
                          <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-orange-400" />
                          Active
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                          style={{
                            background: "#E8F5E9",
                            color: "#1B5E20",
                            borderColor: "#BBF7D0",
                          }}
                        >
                          <CheckCircle2 size={12} className="mr-1" />
                          {formatTime(log.checkedOutAt!)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isActive && <CheckOutButton visitLogId={log.id} />}
                        <a
                          href={`/visit-logs/${log.id}/pass`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-green-100"
                          style={{
                            background: "#E8F5E9",
                            color: "#1B5E20",
                            borderColor: "#A7D7AA",
                          }}
                        >
                          <Printer size={12} />
                          Pass
                        </a>
                      </div>
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
