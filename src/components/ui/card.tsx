import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  variant = "default",
  layout = "default",
  side = "left",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm" | "compact";
  variant?: "default" | "premium" | "accent" | "ghost";
  layout?: "default" | "horizontal";
  side?: "left" | "right";
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      data-layout={layout}
      data-side={side}
      className={cn(
        "bg-card text-card-foreground border overflow-hidden rounded-xl text-sm shadow group/card flex flex-col transition-all duration-300",
        layout === "default" && "gap-6 py-6",
        layout === "horizontal" && "p-0 gap-0 md:flex-row",
        "has-data-[slot=card-banner]:p-0",
        variant === "premium" &&
          "premium-card border-none ring-1 ring-slate-200/60 dark:ring-slate-800/60 shadow-sm hover:shadow-md",
        variant === "accent" && "border-primary/30 bg-primary/5 rounded-xl",
        variant === "ghost" && "bg-transparent border-dashed border-2",
        className,
      )}
      {...props}
    />
  );
}

function CardBanner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-banner"
      className={cn(
        "relative shrink-0 overflow-hidden bg-muted/30",
        "group-data-[layout=horizontal]/card:w-full group-data-[layout=horizontal]/card:md:h-auto group-data-[layout=horizontal]/card:md:w-[35%] group-data-[layout=horizontal]/card:lg:w-[30%]",
        "group-data-[layout=horizontal]/card:group-data-[side=right]/card:md:order-last",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-2 rounded-t-lg px-6 group-data-[size=sm]/card:px-4 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "group-data-[layout=horizontal]/card:md:p-8 group-data-[layout=horizontal]/card:md:pb-0",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base font-medium", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6 group-data-[size=sm]/card:px-4",
        "group-data-[layout=horizontal]/card:flex-1 group-data-[layout=horizontal]/card:flex group-data-[layout=horizontal]/card:flex-col group-data-[layout=horizontal]/card:md:p-8",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "rounded-b-lg px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4 flex items-center",
        "group-data-[layout=horizontal]/card:md:p-8 group-data-[layout=horizontal]/card:md:pt-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardBanner,
};
