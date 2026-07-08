import { auth } from "@/auth"
import { getDashboardStats, getActiveVisits } from "@/lib/actions/dashboard.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/StatCard"
import { CheckOutButton } from "@/components/CheckOutButton"
import { CalendarDays, UserCheck, BarChart2, Building2, UserX } from "lucide-react"

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user
  const isAdmin = user.role === "ADMIN"

  const [stats, activeVisits] = await Promise.all([
    getDashboardStats(),
    getActiveVisits(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back, {user.name}</CardTitle>
          <Badge
            className={
              isAdmin
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {user.role}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Today's Visitors"
          value={stats.todayCount}
          icon={CalendarDays}
        />
        <StatCard
          title="Currently Inside"
          value={stats.activeCount}
          icon={UserCheck}
          highlight={stats.activeCount > 0}
        />
        <StatCard
          title="This Month"
          value={stats.monthCount}
          icon={BarChart2}
        />
        <StatCard
          title="Departments"
          value={stats.departmentCount}
          icon={Building2}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Currently Inside</CardTitle>
            {stats.activeCount > 0 && (
              <span className="size-2 rounded-full bg-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className={activeVisits.length > 0 ? "p-0" : undefined}>
          {activeVisits.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <UserX className="size-8" />
              <p className="text-sm">No visitors currently inside</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeVisits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.visitor.name}</TableCell>
                    <TableCell>{v.visitor.cnic}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell>{v.hostName}</TableCell>
                    <TableCell>{v.department?.name ?? "—"}</TableCell>
                    <TableCell>{formatTime(v.checkedInAt)}</TableCell>
                    <TableCell>
                      <CheckOutButton visitLogId={v.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
