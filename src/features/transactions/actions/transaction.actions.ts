"use server";

import { revalidatePath } from "next/cache";

import { getTenantContext } from "@/features/workspace/services/session-workspace";
import { activityService } from "@/features/activity/services/activity.service";
import { transactionCreateSchema } from "../schemas/transaction.schema";
import { transactionService } from "../services/transaction.service";
import type { TransactionActionResult } from "../types/transaction.types";
import { ROUTES } from "@/config/routes";

export async function createTransactionAction(
  formData: FormData
): Promise<TransactionActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      workerId: (formData.get("workerId") as string) || "",
      type: (formData.get("type") as string) || "WORK",
      reason: (formData.get("reason") as string) || "",
      workName: (formData.get("workName") as string) || "",
      rate: formData.get("rate") || undefined,
      pieces: formData.get("pieces") || undefined,
      amount: formData.get("amount") || 0,
      paymentMethod: (formData.get("paymentMethod") as string) || undefined,
      remarks: (formData.get("remarks") as string) || "",
      date: (formData.get("date") as string) || new Date().toISOString(),
    };

    const parsed = transactionCreateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    const data = parsed.data;

    const result = await transactionService.create({
      workspaceId: tenant.workspaceId,
      actorId: tenant.userId,
      data: {
        workerId: data.workerId,
        type: data.type,
        reason: data.reason,
        workName: data.workName || null,
        rate: data.rate ?? null,
        pieces: data.pieces ?? null,
        amount: data.amount,
        paymentMethod: data.paymentMethod ?? null,
        remarks: data.remarks || null,
        date: new Date(data.date),
      },
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "transaction.create",
      entityType: "Transaction",
      entityId: result.value.transactionId,
      metadata: {
        type: data.type,
        amount: data.amount,
        workerId: data.workerId,
      },
    });

    revalidatePath(ROUTES.transactions);
    revalidatePath(ROUTES.dashboard);
    revalidatePath(`/dashboard/workers/${data.workerId}`);

    return {
      success: true,
      message: "Transaction recorded",
      transactionId: result.value.transactionId,
    };
  } catch (error) {
    console.error("[createTransactionAction]", error);
    return { success: false, message: "Failed to record transaction" };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  formData: FormData
): Promise<TransactionActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      workerId: (formData.get("workerId") as string) || "",
      type: (formData.get("type") as string) || "WORK",
      reason: (formData.get("reason") as string) || "",
      workName: (formData.get("workName") as string) || "",
      rate: formData.get("rate") || undefined,
      pieces: formData.get("pieces") || undefined,
      amount: formData.get("amount") || 0,
      paymentMethod: (formData.get("paymentMethod") as string) || undefined,
      remarks: (formData.get("remarks") as string) || "",
      date: (formData.get("date") as string) || new Date().toISOString(),
    };

    const parsed = transactionCreateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    const data = parsed.data;

    const result = await transactionService.update({
      workspaceId: tenant.workspaceId,
      actorId: tenant.userId,
      id: transactionId,
      data: {
        workerId: data.workerId,
        type: data.type,
        reason: data.reason,
        workName: data.workName || null,
        rate: data.rate ?? null,
        pieces: data.pieces ?? null,
        amount: data.amount,
        paymentMethod: data.paymentMethod ?? null,
        remarks: data.remarks || null,
        date: new Date(data.date),
      },
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "transaction.update",
      entityType: "Transaction",
      entityId: transactionId,
      metadata: { type: data.type, amount: data.amount },
    });

    revalidatePath(ROUTES.transactions);
    revalidatePath(ROUTES.dashboard);
    revalidatePath(`/dashboard/workers/${data.workerId}`);

    return {
      success: true,
      message: "Transaction updated",
      transactionId: result.value.transactionId,
    };
  } catch (error) {
    console.error("[updateTransactionAction]", error);
    return { success: false, message: "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(
  transactionId: string
): Promise<TransactionActionResult> {
  try {
    const tenant = await getTenantContext();

    const result = await transactionService.softDelete({
      workspaceId: tenant.workspaceId,
      actorId: tenant.userId,
      id: transactionId,
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "transaction.delete",
      entityType: "Transaction",
      entityId: transactionId,
    });

    revalidatePath(ROUTES.transactions);
    revalidatePath(ROUTES.dashboard);

    return { success: true, message: "Transaction deleted" };
  } catch (error) {
    console.error("[deleteTransactionAction]", error);
    return { success: false, message: "Failed to delete transaction" };
  }
}