import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "New Entry",
  description: "Record a transaction",
};

interface NewTransactionPageProps {
  searchParams: Promise<{ workerId?: string }>;
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const workspace = await requireWorkspace();
  const { workerId } = await searchParams;

  const { items } = await workerService.list({
    workspaceId: workspace.id,
    page: 1,
    pageSize: 500,
  });

  const workers = items.map((w) => ({
    id: w.id,
    name: w.name,
    openingBalance: w.openingBalance.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
          <Link href={ROUTES.transactions}>
            <ArrowLeft className="mr-1.5 size-4" />
            Back to Transactions
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            New Entry
          </h1>
          <p className="text-sm text-muted-foreground">
            Record work, payment, advance, or deduction for a worker
          </p>
        </div>
      </div>

      {workers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No workers yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              You need to add a worker first before recording transactions.
            </p>
            <Button asChild size="sm" className="mt-6">
              <Link href={ROUTES.workerNew}>
                <Plus className="mr-1.5 size-4" />
                Add Worker
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl">
          <TransactionForm workers={workers} defaultWorkerId={workerId} />
        </div>
      )}
    </div>
  );
}