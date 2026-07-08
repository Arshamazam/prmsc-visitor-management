import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Departments
  const departments = [
    "Administration",
    "HR",
    "Finance",
    "Engineering",
    "IT",
    "Security",
  ]
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log("✓ Departments seeded")

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@prmsc.gov.pk" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@prmsc.gov.pk",
      password: await bcrypt.hash("Admin@1234", 12),
      role: Role.ADMIN,
    },
  })
  console.log("✓ Admin user seeded")

  // Receptionist user
  await prisma.user.upsert({
    where: { email: "reception@prmsc.gov.pk" },
    update: {},
    create: {
      name: "Front Desk",
      email: "reception@prmsc.gov.pk",
      password: await bcrypt.hash("Recep@1234", 12),
      role: Role.RECEPTIONIST,
    },
  })
  console.log("✓ Receptionist user seeded")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
