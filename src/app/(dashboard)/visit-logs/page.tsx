import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckOutButton } from "@/components/CheckOutButton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default async function VisitLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { date } = await searchParams

  const targetDate = date ? new Date(date) : new Date()
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
      loggedBy: true,
    },
    orderBy: { checkedInAt: "desc" },
  })

  const serializedLogs = visitLogs.map((log) => ({
    id: log.id,
    purpose: log.purpose,
    hostName: log.hostName,
    checkedInAt: log.checkedInAt.toISOString(),
    checkedOutAt: log.checkedOutAt?.toISOString() ?? null,
    visitor: { name: log.visitor.name, cnic: log.visitor.cnic },
    department: log.department ? { name: log.department.name } : null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Visit History</h1>
        <form className="flex items-center gap-2" action="/visit-logs">
          <Input
            type="date"
            name="date"
            defaultValue={toInputDate(targetDate)}
            className="w-auto"
          />
          <Button type="submit" variant="outline">
            Go
          </Button>
        </form>
      </div>

      {serializedLogs.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No visits recorded for this date
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serializedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.visitor.name}</TableCell>
                    <TableCell>{log.visitor.cnic}</TableCell>
                    <TableCell>{log.purpose}</TableCell>
                    <TableCell>{log.hostName}</TableCell>
                    <TableCell>{log.department?.name ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(log.checkedInAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {log.checkedOutAt === null ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {formatTime(new Date(log.checkedOutAt))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.checkedOutAt === null && (
                          <CheckOutButton visitLogId={log.id} />
                        )}
                        <a
                          href={`/visit-logs/${log.id}/pass`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline"
                        >
                          Pass
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
