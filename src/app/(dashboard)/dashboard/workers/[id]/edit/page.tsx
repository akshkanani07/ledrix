import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { toWorkerDetail } from "@/features/workers/types/worker.types";
import { WorkerForm } from "@/features/workers/components/worker-form";
import { Button } from "@/components/ui/button";

interface EditWorkerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditWorkerPageProps): Promise<Metadata> {
  const { id } = await params;
  const workspace = await requireWorkspace();
  const worker = await workerService.getById({
    workspaceId: workspace.id,
    id,
  });

  return {
    title: worker ? `Edit ${worker.name}` : "Edit Worker",
  };
}

export default async function EditWorkerPage({
  params,
}: EditWorkerPageProps) {
  const { id } = await params;
  const workspace = await requireWorkspace();

  const rawWorker = await workerService.getById({
    workspaceId: workspace.id,
    id,
  });

  if (!rawWorker) {
    notFound();
  }

  // ✅ Convert to client-safe DTO
  const worker = toWorkerDetail(rawWorker);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
          <Link href={`/dashboard/workers/${worker.id}`}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to Worker
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Edit Worker
          </h1>
          <p className="text-sm text-muted-foreground">
            Update {worker.name}&apos;s details
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <WorkerForm
          mode="edit"
          workerId={worker.id}
          defaultValues={{
            name: worker.name,
            mobile: worker.mobile ?? "",
            address: worker.address ?? "",
            notes: worker.notes ?? "",
            openingBalance: Number(worker.openingBalance),
            status: worker.status,
            photo: worker.photo ?? "",
          }}
        />
      </div>
    </div>
  );
}