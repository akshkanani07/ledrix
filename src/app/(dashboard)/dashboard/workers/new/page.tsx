import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { WorkerForm } from "@/features/workers/components/worker-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Add Worker",
  description: "Add a new worker to your workspace",
};

export default async function NewWorkerPage() {
  await requireWorkspace();

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────── */}
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
          <Link href={ROUTES.workers}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to Workers
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Add Worker
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new worker to your workforce and start tracking their ledger.
          </p>
        </div>
      </div>

      {/* ─── Form ────────────────────────────────────── */}
      <div className="max-w-2xl">
        <WorkerForm mode="create" />
      </div>
    </div>
  );
}