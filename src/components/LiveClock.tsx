"use client"

import { useEffect, useState } from "react"

type LiveClockProps = {
  mode?: "date" | "time"
  className?: string
}

export function LiveClock({ mode = "date", className }: LiveClockProps) {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const formatted =
    mode === "time"
      ? new Intl.DateTimeFormat("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date)
      : new Intl.DateTimeFormat("en-PK", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(date)

  return (
    <span className={className ?? "text-sm"} style={className ? undefined : { color: "#546E7A" }}>
      {formatted}
    </span>
  )
}
