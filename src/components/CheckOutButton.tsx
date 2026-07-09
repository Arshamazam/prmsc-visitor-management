"use client"

import { useTransition } from "react"
import { checkoutVisit } from "@/lib/actions/visitor.actions"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

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
      className="border-[#E5E7EB] text-[12px] text-[#374151] transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      onClick={() => {
        startTransition(async () => {
          await checkoutVisit(visitLogId)
        })
      }}
    >
      <LogOut className="size-[13px]" />
      {isPending ? "Checking out..." : "Check Out"}
    </Button>
  )
}
