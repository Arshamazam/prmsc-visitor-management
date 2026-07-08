"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Department = { id: number; name: string }

type VisitFiltersProps = {
  departments: Department[]
  dateFrom?: string
  dateTo?: string
  departmentId?: number
  search?: string
}

export function VisitFilters({
  departments,
  dateFrom,
  dateTo,
  departmentId,
  search,
}: VisitFiltersProps) {
  const router = useRouter()

  const [from, setFrom] = useState(dateFrom ?? "")
  const [to, setTo] = useState(dateTo ?? "")
  const [dept, setDept] = useState(departmentId ? String(departmentId) : "")
  const [searchValue, setSearchValue] = useState(search ?? "")

  function handleFilter() {
    const params = new URLSearchParams()
    if (from) params.set("dateFrom", from)
    if (to) params.set("dateTo", to)
    if (dept) params.set("departmentId", dept)
    if (searchValue) params.set("search", searchValue)
    router.push(`/admin/visits?${params.toString()}`)
  }

  function handleClear() {
    setFrom("")
    setTo("")
    setDept("")
    setSearchValue("")
    router.push("/admin/visits")
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="dateFrom">Date From</Label>
        <Input
          id="dateFrom"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dateTo">Date To</Label>
        <Input
          id="dateTo"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Department</Label>
        <Select
          value={dept}
          onValueChange={(value) => setDept(value ?? "")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Visitor name, CNIC, or host"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={handleFilter}>
          Filter
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}
