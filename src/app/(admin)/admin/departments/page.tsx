import { getDepartmentsWithCount } from "@/lib/actions/admin.actions"
import { DepartmentManager } from "@/components/admin/DepartmentManager"

export default async function AdminDepartmentsPage() {
  const departments = await getDepartmentsWithCount()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Departments</h1>
      <DepartmentManager departments={departments} />
    </div>
  )
}
