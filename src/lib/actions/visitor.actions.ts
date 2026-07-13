"use server"
import { prisma } from "@/lib/prisma"
import { uploadToS3 } from "@/lib/s3"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Lookup visitor by CNIC
export async function lookupVisitorByCNIC(cnic: string) {
  const visitor = await prisma.visitor.findUnique({
    where: { cnic: cnic.trim() },
    include: {
      visitLogs: {
        orderBy: { checkedInAt: "desc" },
        take: 1,
        include: { department: true },
      },
    },
  })
  if (!visitor) return null
  // Serialize dates to ISO strings — server actions cannot pass Date objects
  return {
    ...visitor,
    createdAt: visitor.createdAt.toISOString(),
    updatedAt: visitor.updatedAt.toISOString(),
    visitLogs: visitor.visitLogs.map((log) => ({
      ...log,
      checkedInAt: log.checkedInAt.toISOString(),
      checkedOutAt: log.checkedOutAt?.toISOString() ?? null,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    })),
  }
}

// Register new visitor
export async function createVisitor(data: {
  cnic: string
  name: string
  phone?: string
  photoBase64?: string
  photoMimeType?: string
}) {
  let photoUrl: string | undefined
  let photoKey: string | undefined

  if (data.photoBase64 && data.photoMimeType) {
    try {
      const buffer = Buffer.from(data.photoBase64, "base64")
      const key = `visitors/${data.cnic.replace(/-/g, "")}-${Date.now()}.jpg`
      photoUrl = await uploadToS3(buffer, key, data.photoMimeType)
      photoKey = key
    } catch (err) {
      // S3 may not be configured in local/dev environments — fall back to
      // persisting the photo directly as a data URL rather than losing it,
      // so it still renders wherever photoUrl is used (e.g. the pass page).
      console.error("S3 photo upload failed, storing photo inline:", err)
      photoUrl = `data:${data.photoMimeType};base64,${data.photoBase64}`
    }
  }

  const visitor = await prisma.visitor.create({
    data: {
      cnic: data.cnic.trim(),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      photoUrl: photoUrl ?? null,
      photoKey: photoKey ?? null,
    },
  })

  return {
    ...visitor,
    createdAt: visitor.createdAt.toISOString(),
    updatedAt: visitor.updatedAt.toISOString(),
  }
}

// Create visit log
export async function createVisitLog(data: {
  visitorId: string
  purpose: string
  hostName: string
  departmentId?: number
  remarks?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const visitLog = await prisma.visitLog.create({
    data: {
      visitorId: data.visitorId,
      purpose: data.purpose.trim(),
      hostName: data.hostName.trim(),
      departmentId: data.departmentId ?? null,
      remarks: data.remarks?.trim() || null,
      checkedInAt: new Date(),
      loggedById: session.user.id,
    },
  })

  return {
    ...visitLog,
    checkedInAt: visitLog.checkedInAt.toISOString(),
    checkedOutAt: null,
    createdAt: visitLog.createdAt.toISOString(),
    updatedAt: visitLog.updatedAt.toISOString(),
  }
}

// Check out a visitor
export async function checkoutVisit(visitLogId: string) {
  await prisma.visitLog.update({
    where: { id: visitLogId },
    data: { checkedOutAt: new Date() },
  })
  revalidatePath("/visit-logs")
  revalidatePath("/dashboard")
}
