"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser, toggleUserActive } from "@/lib/actions/admin.actions"
import type { Role } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

type UserManagerProps = {
  users: User[]
  currentUserId: string
}

// Explicit locale avoids a hydration mismatch: toLocaleDateString() with no
// locale falls back to the runtime's default, which can differ between the
// Node SSR process and the browser.
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(
    new Date(iso)
  )
}

const initialFormData = {
  name: "",
  email: "",
  password: "",
  role: "RECEPTIONIST",
}

export function UserManager({ users, currentUserId }: UserManagerProps) {
  const router = useRouter()

  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function closeDialog() {
    setShowDialog(false)
    setFormData(initialFormData)
    setFormError(null)
  }

  async function handleCreateUser() {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setFormError("All fields are required")
      return
    }
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as Role,
      })
      closeDialog()
      router.refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create user")
    }
    setSubmitting(false)
  }

  async function handleToggleActive(id: string) {
    setTogglingId(id)
    try {
      await toggleUserActive(id)
      router.refresh()
    } catch {
      // no-op — self-deactivation is prevented client-side via disabled button
    }
    setTogglingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Button type="button" onClick={() => setShowDialog(true)}>
          Add User
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge
                  className={
                    u.role === "ADMIN"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }
                >
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell>
                {u.isActive ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(u.createdAt)}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={u.id === currentUserId || togglingId === u.id}
                  title={
                    u.id === currentUserId
                      ? "Cannot deactivate your own account"
                      : undefined
                  }
                  onClick={() => handleToggleActive(u.id)}
                >
                  {togglingId === u.id
                    ? "Updating..."
                    : u.isActive
                      ? "Deactivate"
                      : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) closeDialog()
          else setShowDialog(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((f) => ({ ...f, role: value ?? "RECEPTIONIST" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEPTIONIST">RECEPTIONIST</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateUser}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
