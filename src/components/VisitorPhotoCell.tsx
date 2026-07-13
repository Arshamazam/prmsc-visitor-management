"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type VisitorPhotoCellProps = {
  name: string
  photoUrl: string | null
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

export function VisitorPhotoCell({ name, photoUrl }: VisitorPhotoCellProps) {
  if (!photoUrl) {
    return (
      <div
        className="flex size-10 items-center justify-center rounded-[10px] text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button type="button" className="block cursor-pointer rounded-[10px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={name}
              className="size-10 rounded-[10px] object-cover"
            />
          </button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          className="w-full rounded-md object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
