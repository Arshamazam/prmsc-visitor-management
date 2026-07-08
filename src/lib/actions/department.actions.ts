"use server"
import { prisma } from "@/lib/prisma"

export async function getDepartments() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  })
  return departments.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
  }))
}
