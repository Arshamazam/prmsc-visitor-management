import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
