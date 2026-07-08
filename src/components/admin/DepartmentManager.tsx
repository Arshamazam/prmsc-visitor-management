"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDepartment, deleteDepartment } from "@/lib/actions/admin.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Department = {
  id: number
  name: string
  visitCount: number
  createdAt: string
}

type DepartmentManagerProps = {
  departments: Department[]
}

// Explicit locale avoids a hydration mismatch: toLocaleDateString() with no
// locale falls back to the runtime's default, which can differ between the
// Node SSR process and the browser.
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(
    new Date(iso)
  )
}

export function DepartmentManager({ departments }: DepartmentManagerProps) {
  const router = useRouter()

  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleAdd() {
    if (!newName.trim()) {
      setError("Department name is required")
      return
    }
    setAdding(true)
    setError(null)
    try {
      await createDepartment(newName)
      setNewName("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add department")
    }
    setAdding(false)
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete department ${name}?`)) return
    setDeletingId(id)
    try {
      await deleteDepartment(id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete department")
    }
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Department name"
            />
            <Button type="button" onClick={handleAdd} disabled={adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Visit Count</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    {d.visitCount === 0 ? (
                      <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        0 visits
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {d.visitCount} visits
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(d.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={d.visitCount > 0 || deletingId === d.id}
                      title={
                        d.visitCount > 0
                          ? "Cannot delete — has visit records"
                          : undefined
                      }
                      onClick={() => handleDelete(d.id, d.name)}
                    >
                      {deletingId === d.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
