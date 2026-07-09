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
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.user.role} user={session.user} />
      <div className="flex flex-1 flex-col overflow-hidden md:ml-60">
        <Topbar user={session.user} />
        <main className="mt-14 flex-1 overflow-y-auto bg-[#F0F4F8] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
