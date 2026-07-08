"use client"

import { useTransition } from "react"
import { checkoutVisit } from "@/lib/actions/visitor.actions"
import { Button } from "@/components/ui/button"

type CheckOutButtonProps = {
  visitLogId: string
}

export function CheckOutButton({ visitLogId }: CheckOutButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await checkoutVisit(visitLogId)
        })
      }}
    >
      {isPending ? "Checking out..." : "Check Out"}
    </Button>
  )
}
