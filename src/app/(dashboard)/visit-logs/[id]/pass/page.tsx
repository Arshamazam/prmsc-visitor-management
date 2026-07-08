import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PassView } from "./PassView"

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

  const serializedVisitLog = {
    id: visitLog.id,
    purpose: visitLog.purpose,
    hostName: visitLog.hostName,
    remarks: visitLog.remarks,
    checkedInAt: visitLog.checkedInAt.toISOString(),
    visitor: {
      id: visitLog.visitor.id,
      name: visitLog.visitor.name,
      cnic: visitLog.visitor.cnic,
      phone: visitLog.visitor.phone,
      photoUrl: visitLog.visitor.photoUrl,
    },
    department: visitLog.department ? { name: visitLog.department.name } : null,
    loggedBy: { name: visitLog.loggedBy.name },
  }

  return <PassView visitLog={serializedVisitLog} />
}
