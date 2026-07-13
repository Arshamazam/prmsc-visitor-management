import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { VisitHistoryClient } from "./VisitHistoryClient"

function computeIsLongStay(checkedInAt: Date, checkedOutAt: Date | null) {
  return !checkedOutAt && Date.now() - checkedInAt.getTime() > 2 * 60 * 60 * 1000
}

export default async function VisitLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { date } = await searchParams

  // Parse as local midnight directly — new Date("YYYY-MM-DD") parses as UTC
  // midnight, which combined with setHours(0,0,0,0) below (local midnight)
  // shifts the date back a full day in any timezone behind UTC.
  const targetDate = date ? new Date(`${date}T00:00:00`) : new Date()
  targetDate.setHours(0, 0, 0, 0)
  const nextDay = new Date(targetDate)
  nextDay.setDate(targetDate.getDate() + 1)

  const visitLogs = await prisma.visitLog.findMany({
    where: {
      checkedInAt: { gte: targetDate, lt: nextDay },
      ...(session.user.role === "RECEPTIONIST"
        ? { loggedById: session.user.id }
        : {}),
    },
    include: {
      visitor: true,
      department: true,
    },
    orderBy: { checkedInAt: "desc" },
  })

  const serializedLogs = visitLogs.map((log) => {
    const isLongStay = computeIsLongStay(log.checkedInAt, log.checkedOutAt)

    return {
      id: log.id,
      purpose: log.purpose,
      hostName: log.hostName,
      checkedInAt: log.checkedInAt.toISOString(),
      checkedOutAt: log.checkedOutAt?.toISOString() ?? null,
      isLongStay,
      visitor: {
        name: log.visitor.name,
        cnic: log.visitor.cnic,
        photoUrl: log.visitor.photoUrl,
      },
      department: log.department
        ? { id: log.department.id, name: log.department.name }
        : null,
    }
  })

  return (
    <VisitHistoryClient
      visitLogs={serializedLogs}
      dateParam={date ?? null}
      targetDateIso={targetDate.toISOString()}
    />
  )
}
