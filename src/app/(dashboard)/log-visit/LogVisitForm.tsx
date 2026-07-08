"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  lookupVisitorByCNIC,
  createVisitor,
  createVisitLog,
} from "@/lib/actions/visitor.actions"
import { getDepartments } from "@/lib/actions/department.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VisitorCard } from "@/components/VisitorCard"
import { WebcamCapture } from "@/components/WebcamCapture"

type Step = "search" | "register" | "found" | "log-visit"
type SerializedVisitor = Awaited<ReturnType<typeof lookupVisitorByCNIC>>
type Department = Awaited<ReturnType<typeof getDepartments>>[number]

export function LogVisitForm() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("search")
  const [cnicInput, setCnicInput] = useState("")
  const [visitor, setVisitor] = useState<SerializedVisitor | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])

  // Register form fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)

  // Visit log form fields
  const [purpose, setPurpose] = useState("")
  const [hostName, setHostName] = useState("")
  const [departmentId, setDepartmentId] = useState<string>("")
  const [remarks, setRemarks] = useState("")
  const [logVisitError, setLogVisitError] = useState<string | null>(null)

  useEffect(() => {
    getDepartments().then(setDepartments)
  }, [])

  async function handleSearch() {
    const cnic = cnicInput.trim()
    if (!cnic) return

    setSearching(true)
    setSearchError(null)

    const result = await lookupVisitorByCNIC(cnic)
    if (result) {
      setVisitor(result)
      setStep("found")
    } else {
      setSearchError("No visitor found with this CNIC.")
      setStep("register")
    }
    setSearching(false)
  }

  function resetToSearch() {
    setStep("search")
    setVisitor(null)
    setSearchError(null)
    setName("")
    setPhone("")
    setPhotoBase64(null)
    setPhotoMimeType(null)
    setRegisterError(null)
  }

  async function handleRegister() {
    if (!name.trim()) {
      setRegisterError("Full name is required.")
      return
    }
    setSubmitting(true)
    setRegisterError(null)
    try {
      const result = await createVisitor({
        cnic: cnicInput,
        name,
        phone: phone || undefined,
        photoBase64: photoBase64 ?? undefined,
        photoMimeType: photoMimeType ?? undefined,
      })
      setVisitor({ ...result, visitLogs: [] })
      setStep("log-visit")
    } catch {
      setRegisterError("Could not register visitor. Please try again.")
    }
    setSubmitting(false)
  }

  async function handleLogVisit() {
    if (!visitor) return
    if (!purpose.trim() || !hostName.trim()) {
      setLogVisitError("Purpose and host name are required.")
      return
    }
    setSubmitting(true)
    setLogVisitError(null)
    try {
      const visitLog = await createVisitLog({
        visitorId: visitor.id,
        purpose,
        hostName,
        departmentId: Number(departmentId) || undefined,
        remarks: remarks || undefined,
      })
      router.push(`/visit-logs/${visitLog.id}/pass`)
    } catch {
      setLogVisitError("Could not log visit. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section A — CNIC Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find Visitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="cnic-search">CNIC Number</Label>
          <div className="flex gap-2">
            <Input
              id="cnic-search"
              placeholder="XXXXX-XXXXXXX-X"
              value={cnicInput}
              onChange={(e) => setCnicInput(e.target.value)}
            />
            <Button type="button" onClick={handleSearch} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Format: 42101-1234567-8
          </p>
          {searchError && (
            <p className="text-sm text-destructive">{searchError}</p>
          )}
        </CardContent>
      </Card>

      {/* Section B — Visitor Found */}
      {step === "found" && visitor && (
        <div className="space-y-2">
          <VisitorCard visitor={visitor} onSelect={() => setStep("log-visit")} />
          <button
            type="button"
            onClick={resetToSearch}
            className="text-sm text-muted-foreground underline"
          >
            Not the right person? Search again
          </button>
        </div>
      )}

      {/* Section C — Register New Visitor */}
      {step === "register" && (
        <Card>
          <CardHeader>
            <CardTitle>Register New Visitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic-readonly">CNIC</Label>
              <Input
                id="cnic-readonly"
                value={cnicInput}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <WebcamCapture
                captured={!!photoBase64}
                onCapture={(b64, mime) => {
                  setPhotoBase64(b64)
                  setPhotoMimeType(mime)
                }}
                onClear={() => {
                  setPhotoBase64(null)
                  setPhotoMimeType(null)
                }}
              />
            </div>
            {registerError && (
              <p className="text-sm text-destructive">{registerError}</p>
            )}
            <Button type="button" onClick={handleRegister} disabled={submitting}>
              {submitting ? "Registering..." : "Register Visitor"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section D — Log Visit Details */}
      {step === "log-visit" && visitor && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Visitor</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {visitor.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={visitor.photoUrl}
                    alt={visitor.name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {visitor.name
                      .trim()
                      .split(/\s+/)
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{visitor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {visitor.cnic}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetToSearch}
                className="text-sm text-muted-foreground underline"
              >
                Change visitor
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostName">Host Name</Label>
                <Input
                  id="hostName"
                  placeholder="Name of person being visited"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={departmentId}
                  onValueChange={(value) => setDepartmentId(value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
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
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Any additional notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              {logVisitError && (
                <p className="text-sm text-destructive">{logVisitError}</p>
              )}
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={handleLogVisit}
                disabled={submitting}
              >
                {submitting ? "Logging visit..." : "Log Visit & Generate Pass"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
