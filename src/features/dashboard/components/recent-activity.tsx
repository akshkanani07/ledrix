"use client";

import Link from "next/link";
import {
  Hammer,
  Wallet,
  TrendingDown,
  TrendingUp,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { ROUTES } from "@/config/routes";

interface RecentActivityItem {
  id: string;
  workerId: string;
  workerName: string;
  type: "WORK" | "PAYMENT" | "ADVANCE" | "DEDUCTION";
  reason: string;
  workName: string | null;
  amount: string;
  date: string;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

const TYPE_CONFIG = {
  WORK: {
    label: "Work",
    icon: Hammer,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAYMENT: {
    label: "Payment",
    icon: Wallet,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ADVANCE: {
    label: "Advance",
    icon: TrendingDown,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DEDUCTION: {
    label: "Deduction",
    icon: TrendingUp,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
} as const;

export function RecentActivity({ items }: RecentActivityProps) {
  function formatDate(iso: string) {
    const date = new Date(iso);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Hammer className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">No activity yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
          Start by adding workers and recording their work entries.
        </p>
        <Button asChild size="sm" className="mt-4 h-8">
          <Link href={ROUTES.workerNew}>
            <Receipt className="mr-1.5 size-3.5" />
            Add your first worker
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {items.map((item) => {
        const config = TYPE_CONFIG[item.type];
        const Icon = config.icon;

        return (
          <Link
            key={item.id}
            href={`/dashboard/workers/${item.workerId}`}
            className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
          >
            <div
              className={cn(
                "shrink-0 rounded-lg p-2",
                config.className.split(" ")[0]
              )}
            >
              <Icon
                className={cn("size-4", config.className.split(" ")[1])}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {item.workerName}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px]",
                    config.className
                  )}
                >
                  {config.label}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.workName ?? item.reason}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold">
                {formatMoney(item.amount)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatDate(item.date)}
              </p>
            </div>

            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        );
      })}
    </div>
  );
}