import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from '@/utils'

const badgeVariants = cva(
  "h-5 gap-1 rounded-3xl border border-transparent px-2 text-xs font-medium transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        // White pill with a hairline ring (the date pill of the dashboard).
        outline: "border-border bg-card text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Status badges use a colored label and dot without a filled background.
        processing: "border-border bg-card text-muted-foreground [&_[data-slot=badge-dot]]:text-feedback-info",
        completed: "border-border bg-card text-muted-foreground [&_[data-slot=badge-dot]]:text-feedback-success",
        shopping: "border-border bg-card text-muted-foreground [&_[data-slot=badge-dot]]:text-feedback-info",
        // Over ink or photo surfaces (the dashboard hero).
        "on-dark": "bg-white/15 text-white",
        failed: "border-border bg-card text-muted-foreground [&_[data-slot=badge-dot]]:text-feedback-error",
        pending: "border-border bg-card text-muted-foreground [&_[data-slot=badge-dot]]:text-feedback-warning",
        merged: "bg-primary/10 text-primary",
        category: "bg-primary/10 text-primary",
        neutral: "bg-secondary text-secondary-foreground",
        // Something that needs a look but is not an error (a receipt read without a confirmed store): amber fill, amber text, no border.
        warning: "bg-feedback-warning-tint text-feedback-warning dark:bg-feedback-warning-tint dark:text-feedback-warning",
        // A store, in violet so it reads apart from lists, trips and receipts: a store learned from receipts, and one chosen by the user (white, with a darker ring).
        store: "border-transparent bg-entity-store text-entity-store-text dark:border-transparent dark:bg-entity-store dark:text-entity-store-text [&>svg]:text-entity-store-on",
        "store-manual":
          "border-entity-store-on bg-card text-entity-store-text dark:border-entity-store-on dark:text-entity-store-text [&>svg]:text-entity-store-on",
      },
      size: {
        default: "",
        lg: "h-7 gap-1.5 rounded-lg px-2.5",
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
            <span data-slot="badge-dot" aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
          ) : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Badge, badgeVariants };
