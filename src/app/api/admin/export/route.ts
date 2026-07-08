import { auth } from "@/auth"
import { getAllVisitLogsForExport } from "@/lib/actions/admin.actions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Auth check
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const format = searchParams.get("format") ?? "csv"
  const filters = {
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    departmentId: searchParams.get("departmentId")
      ? Number(searchParams.get("departmentId"))
      : undefined,
    search: searchParams.get("search") ?? undefined,
  }

  const logs = await getAllVisitLogsForExport(filters)
  const today = new Date().toISOString().split("T")[0]

  if (format === "csv") {
    // Build CSV manually — no library needed
    const headers = [
      "ID", "Visitor Name", "CNIC", "Phone", "Purpose",
      "Host", "Department", "Receptionist",
      "Check-in", "Check-out", "Duration (minutes)"
    ]

    const escape = (val: string | number | null) => {
      if (val === null || val === undefined) return ""
      const str = String(val)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = logs.map((log) => [
      log.id,
      log.visitorName,
      log.cnic,
      log.phone,
      log.purpose,
      log.hostName,
      log.department,
      log.receptionist,
      log.checkedInAt,
      log.checkedOutAt,
      log.durationMinutes ?? "",
    ].map(escape).join(","))

    const csv = [headers.join(","), ...rows].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="visits-${today}.csv"`,
      },
    })
  }

  if (format === "pdf") {
    // Build a simple HTML page and return it for printing
    // We are NOT using @react-pdf/renderer — it has SSR issues with Next.js App Router
    // Instead: return a styled HTML page the browser can print to PDF via Ctrl+P

    const formatDate = (iso: string) =>
      iso ? new Intl.DateTimeFormat("en-PK", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso)) : "—"

    // Visitor/receptionist-supplied fields are untrusted input rendered as raw
    // HTML below — escape them to prevent stored XSS in the admin's browser.
    const escapeHtml = (val: string) =>
      val
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

    const rows = logs.map((log, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(log.visitorName)}</td>
        <td>${escapeHtml(log.cnic)}</td>
        <td>${escapeHtml(log.purpose)}</td>
        <td>${escapeHtml(log.hostName)}</td>
        <td>${log.department ? escapeHtml(log.department) : "—"}</td>
        <td>${escapeHtml(log.receptionist)}</td>
        <td>${formatDate(log.checkedInAt)}</td>
        <td>${log.checkedOutAt ? formatDate(log.checkedOutAt) : "Active"}</td>
        <td>${log.durationMinutes !== null ? log.durationMinutes + "m" : "—"}</td>
      </tr>
    `).join("")

    const filterSummary = [
      filters.dateFrom ? `From: ${escapeHtml(filters.dateFrom)}` : null,
      filters.dateTo ? `To: ${escapeHtml(filters.dateTo)}` : null,
      filters.search ? `Search: "${escapeHtml(filters.search)}"` : null,
    ].filter(Boolean).join(" | ") || "All records"

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PRMSC Visit Report — ${today}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
    h1 { font-size: 16px; margin-bottom: 4px; }
    .meta { color: #555; margin-bottom: 12px; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f0f0f0; border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 10px; }
    td { border: 1px solid #ddd; padding: 4px 6px; vertical-align: top; }
    tr:nth-child(even) { background: #fafafa; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>PRMSC — Visitor Report</h1>
  <div class="meta">
    Generated: ${new Intl.DateTimeFormat("en-PK", { dateStyle: "full", timeStyle: "short" }).format(new Date())}
    &nbsp;|&nbsp; Filter: ${filterSummary}
    &nbsp;|&nbsp; Total: ${logs.length} records
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Visitor</th><th>CNIC</th><th>Purpose</th>
        <th>Host</th><th>Dept</th><th>Receptionist</th>
        <th>Check-in</th><th>Check-out</th><th>Duration</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = () => window.print()</script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  }

  return new NextResponse("Invalid format", { status: 400 })
}
