import { logoutAction } from "@/lib/actions/auth.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type TopbarProps = {
  user: {
    name?: string | null
    role?: string
  }
}

export function Topbar({ user }: TopbarProps) {
  const isAdmin = user.role === "ADMIN"

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <span className="font-bold">PRMSC</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user.name}</span>
        <Badge
          className={
            isAdmin
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }
        >
          {user.role}
        </Badge>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Logout
          </Button>
        </form>
      </div>
    </header>
  )
}
