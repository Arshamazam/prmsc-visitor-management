"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayStart.getDate() + 1)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayCount, activeCount, monthCount, departmentCount] =
    await Promise.all([
      prisma.visitLog.count({
        where: { checkedInAt: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.visitLog.count({
        where: {
          checkedInAt: { gte: todayStart },
          checkedOutAt: null,
        },
      }),
      prisma.visitLog.count({
        where: { checkedInAt: { gte: monthStart } },
      }),
      prisma.department.count(),
    ])

  return { todayCount, activeCount, monthCount, departmentCount }
}

export async function getActiveVisits() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const activeVisits = await prisma.visitLog.findMany({
    where: {
      checkedInAt: { gte: todayStart },
      checkedOutAt: null,
    },
    include: {
      visitor: true,
      department: true,
    },
    orderBy: { checkedInAt: "asc" },
  })

  return activeVisits.map((v) => ({
    ...v,
    checkedInAt: v.checkedInAt.toISOString(),
    checkedOutAt: null,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    visitor: {
      ...v.visitor,
      createdAt: v.visitor.createdAt.toISOString(),
      updatedAt: v.visitor.updatedAt.toISOString(),
    },
  }))
}
