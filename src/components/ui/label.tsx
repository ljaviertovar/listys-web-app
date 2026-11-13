"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from '@/utils'

const labelVariants = cva(
  "gap-2 font-semibold group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        default: 'text-sm',
        compact: 'text-xs leading-3',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

function Label({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-size={size}
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  )
}

export { Label }
