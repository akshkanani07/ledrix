import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { Button } from "@/components/ui/button";

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditTransactionPageProps): Promise<Metadata> {
  const { id } = await params;
  const workspace = await requireWorkspace();
  const tx = await transactionService.getById({
    workspaceId: workspace.id,
    id,
  });

  return {
    title: tx ? `Edit transaction` : "Edit Transaction",
  };
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const workspace = await requireWorkspace();

  const [rawTx, workersResult] = await Promise.all([
    transactionService.getById({ workspaceId: workspace.id, id }),
    workerService.list({
      workspaceId: workspace.id,
      page: 1,
      pageSize: 500,
    }),
  ]);

  if (!rawTx) {
    notFound();
  }

  const workers = workersResult.items.map((w) => ({
    id: w.id,
    name: w.name,
    openingBalance: w.openingBalance.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
          <Link href="/dashboard/transactions">
            <ArrowLeft className="mr-1.5 size-4" />
            Back to Transactions
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Edit Transaction
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the entry details. Running ledger will auto-recalculate.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <TransactionForm
          workers={workers}
          mode="edit"
          transactionId={rawTx.id}
          defaultValues={{
            workerId: rawTx.workerId,
            type: rawTx.type,
            reason: rawTx.reason,
            workName: rawTx.workName ?? "",
            rate: rawTx.rate ? Number(rawTx.rate) : undefined,
            pieces: rawTx.pieces ?? undefined,
            amount: Number(rawTx.amount),
            paymentMethod: rawTx.paymentMethod ?? "CASH",
            remarks: rawTx.remarks ?? "",
            date: rawTx.date.toISOString().slice(0, 10),
          }}
        />
      </div>
    </div>
  );
}