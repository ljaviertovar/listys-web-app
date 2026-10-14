import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from '@/utils'

/**
 * Top-lit highlight (white 20% fading out) over the fill of every primary button: this Button's default variant, the
 * marketing ButtonLink, and non-interactive lookalikes. Always white, so it stays a highlight when the dark theme flips
 * `primary-foreground` to ink.
 */
const PRIMARY_BUTTON_LAYER =
  "relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-80 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-gradient-to-b after:from-white/10 after:to-transparent after:mix-blend-overlay"
const SECONDARY_BUTTON_STYLE =
  "border-slate-200 bg-card text-foreground shadow-none hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:hover:bg-muted [&_svg:not([class*='text-'])]:text-primary"

const buttonVariants = cva(
  "border border-transparent font-display text-sm font-semibold [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap gap-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-none focus-visible:outline-none select-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground shadow hover:bg-primary/90 ${PRIMARY_BUTTON_LAYER}`,
        outline: SECONDARY_BUTTON_STYLE,
        // The A1 grey button: `--secondary` surface, blue text and icons, no border or shadow.
        secondary:
          "bg-secondary text-secondary-foreground shadow-none hover:bg-secondary-hover",
        ghost: "hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90",
        // Soft red for an action that is allowed but should not shout: tinted fill, red text, no shadow.
        "destructive-soft":
          "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
        // Hero call to action: the primary fill with a blue glow that lifts on hover.
        hero:
          `bg-primary text-primary-foreground shadow-glow transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:bg-primary/90 hover:shadow-glow-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${PRIMARY_BUTTON_LAYER}`,
        // The raised round action of the mobile tab bar.
        fab:
          `bg-primary text-primary-foreground shadow-fab hover:bg-primary/90 ${PRIMARY_BUTTON_LAYER}`,
        // Confirmation of a done action ("Link Copied"): same shape as destructive-soft in green.
        "success-soft":
          "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900",
        // A quiet icon or row action: slate glyph, the secondary wash on hover and while its menu is open.
        quiet:
          "text-slate-600 shadow-none hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary dark:text-muted-foreground",
        "quiet-destructive":
          "text-slate-600 shadow-none hover:bg-secondary hover:text-red-700 dark:text-muted-foreground",
        // A destructive icon action that is not filled until hovered (remove a photo).
        "destructive-ghost":
          "text-red-700 shadow-none hover:bg-red-100 focus-visible:ring-red-500 dark:text-red-300 dark:hover:bg-red-950",
        // A text action in the primary colour (the "View All" link of a section): transparent until hovered.
        "ghost-primary": "text-blue-700 shadow-none hover:bg-secondary dark:text-blue-400",
        // A white button with the menu shadow that floats over a page (the session Actions button).
        floating: "bg-card text-blue-700 shadow-menu hover:bg-card dark:text-blue-300",
        // The dark photo viewer: translucent white controls, the darker plate over a photo, and the round arrows.
        "on-dark":
          "bg-white/12 text-white shadow-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40",
        viewer:
          "bg-slate-900/80 text-white shadow-none hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40",
        overlay:
          "bg-white/10 text-white shadow-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-30",
        // A drop target that is also a button: dashed outline, blue on hover.
        dropzone:
          "border-2 border-dashed border-slate-300 bg-transparent text-foreground shadow-none text-blue-700 hover:border-blue-400 hover:bg-blue-50/50 focus-visible:border-blue-500 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50/70 dark:border-border dark:text-blue-400 dark:hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        // The native xl of the library: the touch height of the app (screen toolbars, sheet and form footers, 44px).
        xl: "h-11 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        // Hero call to action (52px).
        "2xl": "h-13 gap-2.5 px-7 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        // Content decides the height: a drop target or any block-shaped action that holds several lines.
        block: "h-auto min-h-11 flex-col gap-2 px-6 py-6 text-center whitespace-normal",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xl": "size-11",
        "icon-2xl": "size-12",
        // The account trigger: an avatar circle that widens into a pill from `lg` (the content brings its own gap).
        avatar: "size-11 gap-0 lg:w-auto lg:gap-2.5 lg:pr-2 lg:pl-1",
      },
      // Label weight: `medium` is the lighter label of the landing header (the base is semibold).
      weight: {
        default: "",
        medium: "font-medium",
      },
      rounded: {
        default: "rounded-xl",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      weight: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  rounded = "default",
  weight = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-rounded={rounded}
      className={cn(buttonVariants({ variant, size, rounded, weight, className }))}
      {...props}
    />
  );
}

type ButtonProps = React.ComponentProps<typeof Button>;

export { Button, buttonVariants, PRIMARY_BUTTON_LAYER };
export type { ButtonProps };
