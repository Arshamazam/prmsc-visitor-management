import { auth } from "@/auth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UserPlus,
  DoorOpen,
  CalendarDays,
  Building2,
  type LucideIcon,
} from "lucide-react"

const stats: { label: string; value: number; icon: LucideIcon }[] = [
  { label: "Today's Visitors", value: 0, icon: UserPlus },
  { label: "Currently Inside", value: 0, icon: DoorOpen },
  { label: "This Month", value: 0, icon: CalendarDays },
  { label: "Departments", value: 0, icon: Building2 },
]

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user
  const isAdmin = user.role === "ADMIN"

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back, {user.name}</CardTitle>
          <Badge
            className={
              isAdmin
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {user.role}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Active visits will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
