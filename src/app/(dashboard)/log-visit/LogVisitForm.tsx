"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  lookupVisitorByCNIC,
  createVisitor,
  createVisitLog,
} from "@/lib/actions/visitor.actions"
import { getDepartments } from "@/lib/actions/department.actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WebcamCapture } from "@/components/WebcamCapture"
import { LiveClock } from "@/components/LiveClock"
import { cn } from "@/lib/utils"
import {
  Search,
  Loader2,
  Info,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserX,
  UserPlus,
  Lock,
  Camera,
  ClipboardList,
  ClipboardCheck,
  Printer,
  Check,
  CalendarDays,
  Users,
  type LucideIcon,
} from "lucide-react"

type Step = "search" | "register" | "found" | "log-visit"
type SerializedVisitor = Awaited<ReturnType<typeof lookupVisitorByCNIC>>
type Department = Awaited<ReturnType<typeof getDepartments>>[number]

type LogVisitFormProps = {
  departments: Department[]
  todayCount: number
  activeCount: number
}

const PURPOSE_CHIPS = [
  "Meeting",
  "Document Submission",
  "Interview",
  "Inspection",
  "Delivery",
]

function formatCNIC(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(
    new Date(iso)
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

function Avatar({
  name,
  photoUrl,
  size,
  radius,
}: {
  name: string
  photoUrl: string | null | undefined
  size: number
  radius: number
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
        }}
      />
    )
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
        fontFamily: "var(--font-playfair), serif",
        fontSize: size / 3,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function StatPill({
  icon: Icon,
  iconColor,
  textColor,
  children,
}: {
  icon: LucideIcon
  iconColor?: string
  textColor?: string
  children: React.ReactNode
}) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs shadow-sm"
      style={{ color: textColor ?? "#4B5563" }}
    >
      <Icon size={12} style={{ color: iconColor }} />
      {children}
    </span>
  )
}

const STEP_LABELS = ["Find Visitor", "Visitor Details", "Visit Details"]

function getStepStatuses(step: Step): Array<"completed" | "active" | "inactive"> {
  switch (step) {
    case "search":
    case "found":
      return ["active", "inactive", "inactive"]
    case "register":
      return ["completed", "active", "inactive"]
    case "log-visit":
      return ["completed", "completed", "active"]
  }
}

function StepIndicator({
  step,
  viaFoundPath,
}: {
  step: Step
  viaFoundPath: boolean
}) {
  const statuses = getStepStatuses(step)

  return (
    <div className="mb-6 flex items-start">
      {STEP_LABELS.map((label, i) => {
        const status = statuses[i]
        const isLast = i === STEP_LABELS.length - 1
        const skippedRegister = i === 1 && status === "completed" && viaFoundPath

        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  status === "completed" && "text-white",
                  status === "active" && "border-2 bg-white",
                  status === "inactive" && "border-2 border-gray-200 bg-white text-gray-400"
                )}
                style={{
                  background: status === "completed" ? "#1B5E20" : undefined,
                  borderColor: status === "active" ? "#1B5E20" : undefined,
                  color: status === "active" ? "#1B5E20" : undefined,
                }}
              >
                {status === "completed" ? (
                  skippedRegister ? (
                    <span>—</span>
                  ) : (
                    <Check size={14} />
                  )
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: status === "inactive" ? "#9CA3AF" : "#1B5E20" }}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className="mt-4 h-0.5 flex-1"
                style={{
                  background: status === "completed" ? "#1B5E20" : "#E5E7EB",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function LogVisitForm({
  departments,
  todayCount,
  activeCount,
}: LogVisitFormProps) {
  const router = useRouter()

  const [step, setStep] = useState<Step>("search")
  const [cnicInput, setCnicInput] = useState("")
  const [visitor, setVisitor] = useState<SerializedVisitor | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [viaFoundPath, setViaFoundPath] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [photoMimeType, setPhotoMimeType] = useState<string | null>(null)
  const [cameraStreaming, setCameraStreaming] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  const digitCount = cnicInput.replace(/\D/g, "").length

  async function handleSearch() {
    if (digitCount !== 13) return

    setSearching(true)
    setSearchError(null)

    const result = await lookupVisitorByCNIC(cnicInput)
    if (result) {
      setVisitor(result)
      setViaFoundPath(true)
      setStep("found")
    } else {
      setSearchError("No visitor found with this CNIC.")
      setShowRegisterForm(false)
      setStep("register")
    }
    setSearching(false)
  }

  function resetToSearch() {
    setStep("search")
    setVisitor(null)
    setSearchError(null)
    setShowRegisterForm(false)
    setViaFoundPath(false)
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
      setViaFoundPath(false)
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

  const lastVisit = visitor?.visitLogs[0]
  const selectedChip = PURPOSE_CHIPS.includes(purpose) ? purpose : null
  const selectedDeptName = departments.find(
    (d) => String(d.id) === departmentId
  )?.name
  const remarksRemaining = 200 - remarks.length
  const remarksColor =
    remarksRemaining < 20 ? "#DC2626" : remarksRemaining < 50 ? "#F59E0B" : "#9CA3AF"

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 22,
              color: "#1A1A2E",
            }}
          >
            Log New Visit
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "#546E7A" }}>
            Search for a visitor by CNIC to get started
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatPill icon={CalendarDays}>
            {todayCount} visit{todayCount === 1 ? "" : "s"} today
          </StatPill>
          <StatPill
            icon={Users}
            iconColor="#F57C00"
            textColor={activeCount > 0 ? "#EA580C" : "#6B7280"}
          >
            {activeCount} inside
          </StatPill>
          <StatPill icon={Clock}>
            <LiveClock mode="time" className="text-xs" />
          </StatPill>
        </div>
      </div>

      <StepIndicator step={step} viaFoundPath={viaFoundPath} />

      {/* Step 1 — CNIC search (always visible until a visitor is chosen) */}
      {(step === "search" || step === "found" || step === "register") && (
        <div className="step-enter rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full"
              style={{ background: "#E8F5E9" }}
            >
              <Search size={18} style={{ color: "#1B5E20" }} />
            </div>
            <div>
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#1A1A2E" }}
              >
                Find Visitor
              </p>
              <p className="text-xs" style={{ color: "#546E7A" }}>
                Enter the visitor&apos;s CNIC to search existing records
              </p>
            </div>
          </div>

          <label
            htmlFor="cnic-search"
            className="mb-1.5 block text-[13px] font-medium text-[#374151]"
          >
            CNIC Number
          </label>
          <div className="relative">
            <input
              id="cnic-search"
              value={cnicInput}
              onChange={(e) => setCnicInput(formatCNIC(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && digitCount === 13) handleSearch()
              }}
              placeholder="42101-1234567-8"
              className="h-[52px] w-full rounded-[10px] border-2 border-[#E5E7EB] px-4 pr-14 font-mono text-lg tracking-[2px] text-[#1A1A2E] outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
            />
            <span
              className="absolute top-1/2 right-4 -translate-y-1/2 text-[11px] font-medium"
              style={{ color: digitCount === 13 ? "#22C55E" : "#9CA3AF" }}
            >
              {digitCount}/13
            </span>
          </div>
          <p
            className="mt-1.5 flex items-center gap-1 text-xs"
            style={{ color: "#9CA3AF" }}
          >
            <Info size={12} />
            Format: 42101-1234567-8
          </p>

          <button
            type="button"
            onClick={handleSearch}
            disabled={digitCount !== 13 || searching}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-semibold text-white transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:hover:brightness-100"
            style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
          >
            {searching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search Visitor
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs" style={{ color: "#9CA3AF" }}>
            Press Enter to search
          </p>

          {/* STATE A — Visitor found */}
          {step === "found" && visitor && (
            <div
              key="found"
              className="step-enter mt-4 rounded-xl border-2 p-5 shadow-md"
              style={{ borderColor: "#1B5E20" }}
            >
              <div
                className="mb-4 flex items-center gap-2 rounded-lg px-4 py-2"
                style={{ background: "#E8F5E9" }}
              >
                <CheckCircle2 size={16} style={{ color: "#1B5E20" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#1B5E20" }}
                >
                  Visitor Found
                </span>
              </div>

              <div className="flex items-start">
                <Avatar
                  name={visitor.name}
                  photoUrl={visitor.photoUrl}
                  size={72}
                  radius={12}
                />
                <div className="ml-4 flex-1">
                  <p
                    className="font-bold"
                    style={{ fontSize: 18, color: "#1A1A2E" }}
                  >
                    {visitor.name}
                  </p>
                  <p
                    className="mt-0.5 font-mono text-[13px]"
                    style={{ color: "#546E7A" }}
                  >
                    {visitor.cnic}
                  </p>
                  {visitor.phone && (
                    <p
                      className="mt-1 flex items-center gap-1 text-[13px]"
                      style={{ color: "#546E7A" }}
                    >
                      <Phone size={12} style={{ color: "#9CA3AF" }} />
                      {visitor.phone}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1">
                    {lastVisit ? (
                      <>
                        <Clock size={12} style={{ color: "#9CA3AF" }} />
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>
                          Last visited: {formatDate(lastVisit.checkedInAt)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} style={{ color: "#0277BD" }} />
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#0277BD" }}
                        >
                          First time visitor
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("log-visit")}
                  className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "#1B5E20" }}
                >
                  Proceed with this Visitor
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={resetToSearch}
                  className="rounded-lg border px-4 py-2.5 text-sm text-[#4B5563]"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  Search Again
                </button>
              </div>
            </div>
          )}

          {/* STATE B — Visitor not found */}
          {step === "register" && !showRegisterForm && (
            <div
              key="not-found"
              className="step-enter mt-4 rounded-xl border-2 border-dashed border-gray-300 p-5"
            >
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2">
                <UserX size={16} style={{ color: "#F59E0B" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#92400E" }}
                >
                  No record found for {cnicInput}
                </span>
              </div>
              <p className="text-sm" style={{ color: "#546E7A" }}>
                This appears to be a first-time visitor. Register them below
                to proceed.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(true)}
                  className="cursor-pointer rounded-lg border p-4 text-left transition-all hover:shadow-sm"
                  style={{ background: "#E8F5E9", borderColor: "#A7D7AA" }}
                >
                  <UserPlus size={20} style={{ color: "#1B5E20" }} />
                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "#1B5E20" }}
                  >
                    Register &amp; Log Visit
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#546E7A" }}>
                    Add this visitor and log their entry
                  </p>
                </button>
                <button
                  type="button"
                  onClick={resetToSearch}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:shadow-sm hover:border-gray-300"
                >
                  <Search size={20} style={{ color: "#546E7A" }} />
                  <p className="mt-2 text-sm font-semibold text-[#374151]">
                    Search Again
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                    Try a different CNIC
                  </p>
                </button>
              </div>

              {searchError && (
                <p className="mt-3 text-xs text-gray-400">{searchError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Register new visitor */}
      {step === "register" && showRegisterForm && (
        <div
          key="register"
          className="step-enter mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full"
              style={{ background: "#E8F5E9" }}
            >
              <UserPlus size={18} style={{ color: "#1B5E20" }} />
            </div>
            <div>
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#1A1A2E" }}
              >
                Register New Visitor
              </p>
              <p className="text-xs" style={{ color: "#546E7A" }}>
                Fill in the visitor&apos;s details to create their record
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Left column — personal details */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Full Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  CNIC Number
                </label>
                <div className="relative">
                  <input
                    value={cnicInput}
                    readOnly
                    className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-500"
                  />
                  <Lock
                    size={14}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="h-11 w-full rounded-lg border border-gray-200 pr-4 pl-10 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Right column — photo capture */}
            <div>
              <label className="block text-[13px] font-medium text-[#374151]">
                Visitor Photo
              </label>
              <p className="mb-3 text-xs" style={{ color: "#546E7A" }}>
                Capture or upload a photo for identification
              </p>
              <div className="rounded-xl border border-dashed border-gray-300 p-4">
                {!photoBase64 && !cameraStreaming && (
                  <div className="mb-3 flex flex-col items-center gap-1 text-gray-400">
                    <Camera size={32} />
                    <span className="text-xs">No photo yet</span>
                  </div>
                )}
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
                  onStreamingChange={setCameraStreaming}
                />
              </div>
            </div>
          </div>

          {registerError && (
            <p className="mt-4 text-sm text-destructive">{registerError}</p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={resetToSearch}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} />
              Back to Search
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={submitting || !name.trim()}
              className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "#1B5E20" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register &amp; Continue
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Visit details */}
      {step === "log-visit" && visitor && (
        <div key="log-visit" className="step-enter mt-0 flex flex-col gap-5 md:flex-row">
          {/* Left — visitor summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:w-2/5">
            <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              Logging visit for
            </p>

            <Avatar
              name={visitor.name}
              photoUrl={visitor.photoUrl}
              size={80}
              radius={16}
            />

            <p
              className="mt-3 font-bold"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: 20,
                color: "#1A1A2E",
              }}
            >
              {visitor.name}
            </p>
            <p className="mt-1 font-mono text-xs" style={{ color: "#546E7A" }}>
              {visitor.cnic}
            </p>
            {visitor.phone && (
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                {visitor.phone}
              </p>
            )}

            <div className="my-4 border-t border-gray-100" />

            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <ClipboardList size={12} />
                  Purpose
                </span>
                <span className="font-medium text-[#374151]">
                  {purpose || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <UserPlus size={12} />
                  Host
                </span>
                <span className="font-medium text-[#374151]">
                  {hostName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Users size={12} />
                  Department
                </span>
                <span className="font-medium text-[#374151]">
                  {selectedDeptName ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={12} />
                  Entry Time
                </span>
                <span className="font-medium text-[#374151]">
                  <LiveClock mode="time" className="text-xs font-medium text-[#374151]" />
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetToSearch}
              className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} />
              Change Visitor
            </button>
          </div>

          {/* Right — visit details form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:w-3/5">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-full"
                style={{ background: "#E1F5FE" }}
              >
                <ClipboardList size={18} style={{ color: "#0277BD" }} />
              </div>
              <div>
                <p
                  className="text-[15px] font-semibold"
                  style={{ color: "#1A1A2E" }}
                >
                  Visit Details
                </p>
                <p className="text-xs" style={{ color: "#546E7A" }}>
                  Fill in the purpose and host details for this visit
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Purpose of Visit *
                </label>
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Meeting, Document Submission, Interview"
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {PURPOSE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPurpose(chip)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-colors",
                        selectedChip === chip
                          ? "text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800"
                      )}
                      style={{
                        background: selectedChip === chip ? "#1B5E20" : undefined,
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Person Being Visited *
                </label>
                <div className="relative">
                  <UserPlus
                    size={14}
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Full name of the host"
                    className="h-11 w-full rounded-lg border border-gray-200 pr-4 pl-10 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Department
                </label>
                {departments.length > 8 ? (
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
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {departments.map((d) => {
                      const selected = departmentId === String(d.id)
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            setDepartmentId(selected ? "" : String(d.id))
                          }
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            selected
                              ? "border-transparent text-white"
                              : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                          )}
                          style={{ background: selected ? "#1B5E20" : undefined }}
                        >
                          {d.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <label className="text-[13px] font-medium text-[#374151]">
                    Additional Notes
                  </label>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    optional
                  </span>
                </div>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value.slice(0, 200))}
                  maxLength={200}
                  rows={3}
                  placeholder="Any special instructions or notes about this visit..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1B5E20] focus:shadow-[0_0_0_3px_rgba(27,94,32,0.1)]"
                />
                <p
                  className="mt-1 text-right text-[11px]"
                  style={{ color: remarksColor }}
                >
                  {remarks.length}/200
                </p>
              </div>

              {logVisitError && (
                <p className="text-sm text-destructive">{logVisitError}</p>
              )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={handleLogVisit}
                disabled={submitting}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging visit...
                  </>
                ) : (
                  <>
                    <ClipboardCheck size={18} />
                    Log Visit &amp; Generate Pass
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p
                className="mt-2 flex items-center justify-center gap-1 text-center text-xs"
                style={{ color: "#9CA3AF" }}
              >
                <Printer size={11} />
                A printable visitor pass will be generated after submission
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
