"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// ── Auth guard helper ──
async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

// ── Visit log queries ──
export type VisitLogFilters = {
  dateFrom?: string   // ISO date string
  dateTo?: string     // ISO date string
  departmentId?: number
  search?: string     // searches visitor name, CNIC, hostName
  page?: number
}

export async function getAdminVisitLogs(filters: VisitLogFilters = {}) {
  await requireAdmin()

  const PAGE_SIZE = 25
  const page = filters.page ?? 1
  const skip = (page - 1) * PAGE_SIZE

  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined
  const dateTo = filters.dateTo
    ? (() => { const d = new Date(filters.dateTo!); d.setHours(23, 59, 59, 999); return d })()
    : undefined

  const where = {
    ...(dateFrom || dateTo
      ? { checkedInAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
      : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.search
      ? {
          OR: [
            { visitor: { name: { contains: filters.search } } },
            { visitor: { cnic: { contains: filters.search } } },
            { hostName: { contains: filters.search } },
          ],
        }
      : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.visitLog.findMany({
      where,
      include: { visitor: true, department: true, loggedBy: true },
      orderBy: { checkedInAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.visitLog.count({ where }),
  ])

  const serialize = (log: (typeof logs)[0]) => ({
    id: log.id,
    purpose: log.purpose,
    hostName: log.hostName,
    remarks: log.remarks,
    checkedInAt: log.checkedInAt.toISOString(),
    checkedOutAt: log.checkedOutAt?.toISOString() ?? null,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
    visitor: {
      id: log.visitor.id,
      name: log.visitor.name,
      cnic: log.visitor.cnic,
      phone: log.visitor.phone,
      photoUrl: log.visitor.photoUrl,
    },
    department: log.department ? { id: log.department.id, name: log.department.name } : null,
    loggedBy: { id: log.loggedBy.id, name: log.loggedBy.name },
  })

  return {
    logs: logs.map(serialize),
    total,
    pages: Math.ceil(total / PAGE_SIZE),
    page,
  }
}

// For export — no pagination, all results
export async function getAllVisitLogsForExport(filters: Omit<VisitLogFilters, "page">) {
  await requireAdmin()

  const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : undefined
  const dateTo = filters.dateTo
    ? (() => { const d = new Date(filters.dateTo!); d.setHours(23, 59, 59, 999); return d })()
    : undefined

  const where = {
    ...(dateFrom || dateTo
      ? { checkedInAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
      : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.search
      ? {
          OR: [
            { visitor: { name: { contains: filters.search } } },
            { visitor: { cnic: { contains: filters.search } } },
            { hostName: { contains: filters.search } },
          ],
        }
      : {}),
  }

  const logs = await prisma.visitLog.findMany({
    where,
    include: { visitor: true, department: true, loggedBy: true },
    orderBy: { checkedInAt: "desc" },
  })

  return logs.map((log) => ({
    id: log.id,
    visitorName: log.visitor.name,
    cnic: log.visitor.cnic,
    phone: log.visitor.phone ?? "",
    purpose: log.purpose,
    hostName: log.hostName,
    department: log.department?.name ?? "",
    receptionist: log.loggedBy.name,
    checkedInAt: log.checkedInAt.toISOString(),
    checkedOutAt: log.checkedOutAt?.toISOString() ?? "",
    durationMinutes: log.checkedOutAt
      ? Math.round((log.checkedOutAt.getTime() - log.checkedInAt.getTime()) / 60000)
      : null,
  }))
}

// ── Department actions ──
export async function createDepartment(name: string) {
  await requireAdmin()
  if (!name?.trim()) throw new Error("Department name is required")
  const dept = await prisma.department.create({
    data: { name: name.trim() },
  })
  revalidatePath("/admin/departments")
  return dept
}

export async function deleteDepartment(id: number) {
  await requireAdmin()
  const visitCount = await prisma.visitLog.count({ where: { departmentId: id } })
  if (visitCount > 0) throw new Error("Cannot delete department with visit records")
  await prisma.department.delete({ where: { id } })
  revalidatePath("/admin/departments")
}

export async function getDepartmentsWithCount() {
  await requireAdmin()
  const departments = await prisma.department.findMany({
    include: { _count: { select: { visitLogs: true } } },
    orderBy: { name: "asc" },
  })
  return departments.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    visitCount: d._count.visitLogs,
  }))
}

// ── User actions ──
export async function getUsers() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })
  return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: Role
}) {
  await requireAdmin()
  if (!data.name?.trim()) throw new Error("Name is required")
  if (!data.email?.trim()) throw new Error("Email is required")
  if (!data.password || data.password.length < 8) throw new Error("Password must be at least 8 characters")

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("A user with this email already exists")

  const hashed = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: hashed,
      role: data.role,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  revalidatePath("/admin/users")
  return { ...user, createdAt: user.createdAt.toISOString() }
}

export async function toggleUserActive(id: string) {
  const session = await requireAdmin()
  if (id === session.user.id) throw new Error("You cannot deactivate your own account")
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error("User not found")
  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  })
  revalidatePath("/admin/users")
}
