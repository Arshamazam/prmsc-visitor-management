import { auth } from "@/auth"
import { getVisitLogsForExport } from "@/lib/actions/visitor.actions"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  if (!dateFrom || !dateTo) {
    return new NextResponse("dateFrom and dateTo are required", { status: 400 })
  }
  const timeFrom = searchParams.get("timeFrom") ?? undefined
  const timeTo = searchParams.get("timeTo") ?? undefined

  const logs = await getVisitLogsForExport({ dateFrom, dateTo, timeFrom, timeTo })

  const headers = [
    "ID",
    "Visitor Name",
    "CNIC",
    "Phone",
    "Purpose",
    "Host",
    "Department",
    "Receptionist",
    "Check-in",
    "Check-out",
    "Duration (minutes)",
    "Photo URL",
  ]

  const escape = (val: string | number | null) => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = logs.map((log) =>
    [
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
      log.photoUrl,
    ]
      .map(escape)
      .join(",")
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const filename = `visit-history-${dateFrom}-to-${dateTo}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
