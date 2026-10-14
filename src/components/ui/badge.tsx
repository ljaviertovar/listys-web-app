import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from '@/utils'

const badgeVariants = cva(
  "h-5.5 gap-1.5 rounded-full border border-transparent px-2 text-xs font-semibold transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        // White pill with a hairline ring (the date pill of the dashboard).
        outline: "border-0 bg-card text-slate-700 shadow-card dark:text-slate-200",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Status tints (the 100-level fill with the 700-level text): a receipt or session in its state. `neutral` is "not started".
        processing: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        completed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
        // Over ink or photo surfaces (the dashboard hero).
        "on-dark": "bg-white/15 text-white",
        failed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        merged: "bg-primary/10 text-primary",
        category: "bg-primary/10 text-primary",
        neutral: "bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground",
      },
      size: {
        default: "",
        lg: "h-7 gap-1.5 rounded-lg px-2.5",
        // The "Shopping now" pill over the dashboard hero: as tall as its two-line text needs.
        hero: "h-auto gap-2 border-0 px-3 py-1.5 leading-[1.2]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
