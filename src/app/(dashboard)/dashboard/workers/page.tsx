import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { toWorkerListItem } from "@/features/workers/types/worker.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkerList } from "@/features/workers/components/worker-list";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Workers",
  description: "Manage your workforce",
};

export default async function WorkersPage() {
  const workspace = await requireWorkspace();
  const { items, total } = await workerService.list({
    workspaceId: workspace.id,
    page: 1,
    pageSize: 50,
  });

  // ✅ Convert Decimal → string (serializable for client)
  const workers = items.map(toWorkerListItem);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Workers
          </h1>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "Add your first worker to start tracking their ledger."
              : `${total} worker${total === 1 ? "" : "s"} in your workspace.`}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-9 bg-zinc-900 text-white hover:bg-zinc-800"
        >
          <Link href={ROUTES.workerNew}>
            <Plus className="mr-1.5 size-4" />
            Add Worker
          </Link>
        </Button>
      </div>

      {workers.length === 0 ? <EmptyState /> : <WorkerList workers={workers} />}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold">No workers yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Start by adding your first worker. You can record their work entries,
          payments, advances, and deductions.
        </p>
        <Button asChild size="sm" className="mt-6">
          <Link href={ROUTES.workerNew}>
            <Plus className="mr-1.5 size-4" />
            Add your first worker
          </Link>
        </Button>
      </div>
    </Card>
  );
}