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
        shopping: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
        // Over ink or photo surfaces (the dashboard hero).
        "on-dark": "bg-white/15 text-white",
        failed: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        merged: "bg-primary/10 text-primary",
        category: "bg-primary/10 text-primary",
        neutral: "bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground",
        // A store, in violet so it reads apart from lists, trips and receipts: a store learned from receipts, and one chosen by the user (white, with a darker ring).
        store: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200 [&>svg]:text-violet-600 dark:[&>svg]:text-violet-300",
        "store-manual":
          "border-violet-300 bg-card text-violet-900 dark:border-violet-400/50 dark:text-violet-200 [&>svg]:text-violet-600 dark:[&>svg]:text-violet-300",
        // Tag (canvas 3/7): the only bordered box. A fact about the object, never its progress; it always carries an icon and no green or red.
        tag: "h-5.5 gap-1 rounded-md border-slate-200 bg-card px-2 has-[>svg]:pl-1.5 font-medium text-slate-700 dark:border-border dark:text-slate-200 [&>svg]:size-3.25! [&>svg]:text-slate-500",
        // The attention tag: something is missing (no receipt, no price). Amber, never an action.
        "tag-attention":
          "h-5.5 gap-1 rounded-md border-amber-200 bg-amber-50 px-2 has-[>svg]:pl-1.5 font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 [&>svg]:size-3.25! [&>svg]:text-amber-600",
        // The list every account starts with (Pantry): a yellow tag, with its star.
        "list-default":
          "h-5.5 gap-1 rounded-md border-amber-200 bg-amber-100 px-2 font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200 [&>svg]:size-3.25! [&>svg]:text-amber-600",
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
  dot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    /** The 6px dot of a status pill (canvas 3/7): status says where the object is in its process. */
    dot?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {dot ? (
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
          ) : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Badge, badgeVariants };
