"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type PassViewProps = {
  visitLog: {
    id: string
    purpose: string
    hostName: string
    remarks: string | null
    checkedInAt: string
    visitor: {
      id: string
      name: string
      cnic: string
      phone: string | null
      photoUrl: string | null
    }
    department: { name: string } | null
    loggedBy: { name: string }
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

export function PassView({ visitLog }: PassViewProps) {
  useEffect(() => {
    window.print()
  }, [])

  const passNo = `#${visitLog.id.slice(-6).toUpperCase()}`
  const entryTime = new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(visitLog.checkedInAt))

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <style>{`
        @media print {
          @page { size: A6; margin: 8mm; }
          body * { visibility: hidden; }
          #pass-card, #pass-card * { visibility: visible; }
          #pass-card { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="print:hidden mb-6 flex gap-3 p-4">
        <Button type="button" onClick={() => window.print()}>
          Print Pass
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/visit-logs" />}
        >
          Back to Visit History
        </Button>
      </div>

      <div
        id="pass-card"
        className="w-full max-w-sm rounded-lg border bg-white p-6 text-gray-900 shadow-sm"
      >
        <div className="flex items-baseline justify-between border-b border-gray-300 pb-3">
          <div>
            <p className="text-lg font-bold">PRMSC</p>
            <p className="text-xs text-gray-500">
              Punjab Rural Municipal Services
            </p>
          </div>
          <p className="text-sm font-semibold">VISITOR PASS</p>
        </div>

        <div className="flex gap-4 border-b border-gray-300 py-3">
          {visitLog.visitor.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visitLog.visitor.photoUrl}
              alt={visitLog.visitor.name}
              className="h-20 w-20 rounded object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-400 text-lg font-medium text-white">
              {getInitials(visitLog.visitor.name)}
            </div>
          )}
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {visitLog.visitor.name}
            </p>
            <p>
              <span className="font-medium">CNIC:</span>{" "}
              {visitLog.visitor.cnic}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {visitLog.visitor.phone ?? "—"}
            </p>
          </div>
        </div>

        <div className="space-y-1 border-b border-gray-300 py-3 text-sm">
          <p>
            <span className="font-medium">Purpose:</span> {visitLog.purpose}
          </p>
          <p>
            <span className="font-medium">Host:</span> {visitLog.hostName}
          </p>
          <p>
            <span className="font-medium">Dept:</span>{" "}
            {visitLog.department?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Entry:</span> {entryTime}
          </p>
          {visitLog.remarks && (
            <p>
              <span className="font-medium">Remarks:</span>{" "}
              {visitLog.remarks}
            </p>
          )}
        </div>

        <div className="space-y-1 border-b border-gray-300 py-3 text-sm">
          <p>
            <span className="font-medium">Pass No:</span> {passNo}
          </p>
          <p>
            <span className="font-medium">Logged by:</span>{" "}
            {visitLog.loggedBy.name}
          </p>
        </div>

        <p className="pt-3 text-center text-xs text-gray-500">
          Valid for one visit only. Please return this pass to reception on
          exit.
        </p>
      </div>
    </div>
  )
}
