"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { cn } from '@/utils'

function Collapsible({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  /** `section` leaves 10px under the content while it is open (a category section of a card). */
  variant?: "default" | "section"
}) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      data-variant={variant}
      className={cn(variant === "section" && "data-[state=open]:pb-2.5", className)}
      {...props}
    />
  )
}

function CollapsibleTrigger({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger> & {
  /** `row` is a full-width, 52px header row (a category section): the content sits on one line with the chevron at the end. */
  variant?: "default" | "row"
}) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      data-variant={variant}
      className={cn(variant === "row" && "flex min-h-13 w-full items-center gap-3 rounded-xl text-left focus-ring", className)}
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
