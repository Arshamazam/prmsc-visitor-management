import { execSync } from "child_process"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("→ Running prisma migrate deploy...")
  execSync("npx prisma migrate deploy", { stdio: "inherit" })

  // Idempotent seed — only seeds if no users exist
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    console.log("→ No users found — running seed...")
    execSync("npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts", {
      stdio: "inherit",
    })
  } else {
    console.log(`→ Skipping seed — ${userCount} user(s) already exist.`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
