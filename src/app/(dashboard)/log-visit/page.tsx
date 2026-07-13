import { getDepartments } from "@/lib/actions/department.actions"
import { getDashboardStats } from "@/lib/actions/dashboard.actions"
import { LogVisitForm } from "./LogVisitForm"

export default async function LogVisitPage() {
  const [departments, stats] = await Promise.all([
    getDepartments(),
    getDashboardStats(),
  ])

  return (
    <LogVisitForm
      departments={departments}
      todayCount={stats.todayCount}
      activeCount={stats.activeCount}
    />
  )
}
