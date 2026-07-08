import { auth } from "@/auth"
import { getUsers } from "@/lib/actions/admin.actions"
import { UserManager } from "@/components/admin/UserManager"

export default async function AdminUsersPage() {
  const session = await auth()
  const users = await getUsers()

  return <UserManager users={users} currentUserId={session!.user.id} />
}
