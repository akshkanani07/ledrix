import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  User,
  Receipt,
  Building2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { activityService } from "@/features/activity/services/activity.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activity",
  description: "Audit trail of your workspace",
};

function getActionConfig(action: string) {
  if (action.endsWith(".create")) {
    return {
      icon: Plus,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Created",
    };
  }
  if (action.endsWith(".update")) {
    return {
      icon: Pencil,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Updated",
    };
  }
  if (action.endsWith(".delete")) {
    return {
      icon: Trash2,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Deleted",
    };
  }
  return {
    icon: Activity,
    color: "text-zinc-600",
    bg: "bg-zinc-100",
    label: "Action",
  };
}

function getEntityIcon(entityType: string) {
  if (entityType === "Worker") return User;
  if (entityType === "Transaction") return Receipt;
  if (entityType === "Workspace") return Building2;
  return Activity;
}

export default async function ActivityPage() {
  const workspace = await requireWorkspace();
  const { items, total } = await activityService.list({
    workspaceId: workspace.id,
    take: 100,
  });

  function formatDate(iso: Date) {
    const date = new Date(iso);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 60 * 24 * 7)
      return `${Math.floor(diff / (60 * 24))}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "All workspace actions will appear here."
            : `${total} action${total === 1 ? "" : "s"} recorded.`}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Activity className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No activity yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Actions like adding workers or recording transactions will
              appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {items.map((item) => {
              const actionConfig = getActionConfig(item.action);
              const ActionIcon = actionConfig.icon;
              const EntityIcon = getEntityIcon(item.entityType);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={cn(
                      "shrink-0 rounded-lg p-2",
                      actionConfig.bg
                    )}
                  >
                    <ActionIcon
                      className={cn("size-4", actionConfig.color)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {actionConfig.label} {item.entityType.toLowerCase()}
                      </p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <EntityIcon className="size-2.5" />
                        {item.entityType}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.entityId
                        ? `ID: ${item.entityId.slice(0, 12)}…`
                        : item.action}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}