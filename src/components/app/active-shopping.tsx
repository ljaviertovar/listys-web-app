"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardBanner,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  dashboard?: boolean;
  activeShopping?: {
    id: string;
    name: string;
    items?: Array<{ checked: boolean | null }>;
  };
}

export default function ActiveShopping({ activeShopping, dashboard }: Props) {
  // Calculate progress
  const totalItems = activeShopping?.items?.length ?? 0;
  const checkedItems =
    activeShopping?.items?.filter((item) => item.checked === true).length ?? 0;
  const progress =
    totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Local image path - ensuring no external sources
  const cartImageUrl = "/images/shopping-session.jpg";

  return (
    <Card variant="premium" layout="horizontal" className="shadow-primary">
      <CardBanner className="aspect-video md:aspect-auto">
        {/* Premium Fallback Mesh */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-background to-primary/5 hero-mesh opacity-60" />

        <img
          src={cartImageUrl}
          alt="Shopping Cart"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="relative z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 z-20 bg-linear-to-t from-background/20 to-transparent md:bg-linear-to-r" />
        <div className="scan-line z-20 opacity-30" />
      </CardBanner>

      <div className="flex flex-1 flex-col justify-center">
        <CardHeader className="p-6 pb-2 md:p-8 md:pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary md:text-xs">
                {dashboard ? "Active Shopping Session" : "Shopping Session"}
              </CardDescription>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {activeShopping?.name || "Current Shopping"}
              </CardTitle>
            </div>
            <Badge
              variant="processing"
              className="hidden shrink-0 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest sm:inline-flex"
            >
              In Progress
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 py-2 md:p-8 md:py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between text-sm">
              <p className="font-medium text-muted-foreground">
                Progress:{" "}
                <span className="font-bold text-foreground tabular-nums">
                  {checkedItems} of {totalItems} items
                </span>{" "}
                collected
              </p>
              <span className="text-3xl font-bold tabular-nums text-primary leading-none">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-4 md:p-8 md:pt-5">
          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 justify-center">
              <AvatarGroup>
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px] font-bold uppercase">
                    L
                  </AvatarFallback>
                </Avatar>
                <AvatarGroupCount className="text-[10px] font-bold">
                  +2
                </AvatarGroupCount>
              </AvatarGroup>
              <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">
                Shared with family
              </p>
            </div>

            <Button
              asChild
              className="w-full px-6 text-xs font-bold uppercase tracking-widest sm:w-auto"
            >
              <Link
                href={`/shopping/${activeShopping?.id}`}
                className="flex items-center gap-2"
              >
                Continue Session
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
