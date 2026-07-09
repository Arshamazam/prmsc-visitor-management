"use client"

import { useEffect, useState } from "react"

export function LiveClock() {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const formatted = new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)

  return <span className="text-sm" style={{ color: "#546E7A" }}>{formatted}</span>
}
