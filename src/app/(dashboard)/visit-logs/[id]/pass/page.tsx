import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrintButton } from "@/components/PrintButton"

export default async function VisitPassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const visitLog = await prisma.visitLog.findUnique({
    where: { id },
    include: { visitor: true, department: true, loggedBy: true },
  })

  if (!visitLog) notFound()

  return (
    <div className="mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Pass</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {visitLog.visitor.name}
          </p>
          <p>
            <span className="font-medium">CNIC:</span> {visitLog.visitor.cnic}
          </p>
          <p>
            <span className="font-medium">Purpose:</span> {visitLog.purpose}
          </p>
          <p>
            <span className="font-medium">Host:</span> {visitLog.hostName}
          </p>
          <p>
            <span className="font-medium">Department:</span>{" "}
            {visitLog.department?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Check-in:</span>{" "}
            {visitLog.checkedInAt.toLocaleString()}
          </p>

          <p className="pt-4 text-sm text-muted-foreground">
            Full pass PDF will be built in Phase 4
          </p>

          <PrintButton />
        </CardContent>
      </Card>
    </div>
  )
}
