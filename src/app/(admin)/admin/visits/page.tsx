import { getAdminVisitLogs } from "@/lib/actions/admin.actions"
import { getDepartments } from "@/lib/actions/department.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VisitFilters } from "@/components/admin/VisitFilters"
import { ExportButtons } from "@/components/admin/ExportButtons"
import { Pagination } from "@/components/Pagination"

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso))
}

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    departmentId?: string
    search?: string
    page?: string
  }>
}) {
  const { dateFrom, dateTo, departmentId, search, page } = await searchParams

  const filters = {
    dateFrom,
    dateTo,
    departmentId: departmentId ? Number(departmentId) : undefined,
    search,
    page: page ? Number(page) : 1,
  }

  const [{ logs, total, pages, page: currentPage }, departments] =
    await Promise.all([getAdminVisitLogs(filters), getDepartments()])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">All Visits</h1>
          <Badge variant="secondary">
            {total.toLocaleString()} records
          </Badge>
        </div>
        <ExportButtons />
      </div>

      <Card>
        <CardContent>
          <VisitFilters
            departments={departments}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            departmentId={filters.departmentId}
            search={filters.search}
          />
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No visit records match these filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>CNIC</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Receptionist</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Pass</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, i) => {
                  const duration = log.checkedOutAt
                    ? Math.round(
                        (new Date(log.checkedOutAt).getTime() -
                          new Date(log.checkedInAt).getTime()) /
                          60000
                      )
                    : null

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        {(currentPage - 1) * 25 + i + 1}
                      </TableCell>
                      <TableCell>{log.visitor.name}</TableCell>
                      <TableCell>{log.visitor.cnic}</TableCell>
                      <TableCell>{log.purpose}</TableCell>
                      <TableCell>{log.hostName}</TableCell>
                      <TableCell>{log.department?.name ?? "—"}</TableCell>
                      <TableCell>{log.loggedBy.name}</TableCell>
                      <TableCell>{formatDateTime(log.checkedInAt)}</TableCell>
                      <TableCell>
                        {log.checkedOutAt
                          ? formatDateTime(log.checkedOutAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {duration !== null ? (
                          `${duration}m`
                        ) : (
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/visit-logs/${log.id}/pass`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary underline"
                        >
                          Pass
                        </a>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={pages}
        basePath="/admin/visits"
        total={total}
      />
    </div>
  )
}
