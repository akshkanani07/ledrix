"use server";

import { revalidatePath } from "next/cache";

import { getTenantContext } from "@/features/workspace/services/session-workspace";
import { activityService } from "@/features/activity/services/activity.service";
import { workerCreateSchema, workerUpdateSchema } from "../schemas/worker.schema";
import { workerService } from "../services/worker.service";
import type { WorkerActionResult } from "../types/worker.types";
import { ROUTES } from "@/config/routes";

export async function createWorkerAction(
  formData: FormData
): Promise<WorkerActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      name: formData.get("name") as string,
      mobile: (formData.get("mobile") as string) || "",
      address: (formData.get("address") as string) || "",
      notes: (formData.get("notes") as string) || "",
      openingBalance: formData.get("openingBalance") || "0",
      status: (formData.get("status") as string) || "ACTIVE",
      photo: (formData.get("photo") as string) || "",
    };

    const parsed = workerCreateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    const result = await workerService.create({
      workspaceId: tenant.workspaceId,
      actorId: tenant.userId,
      data: parsed.data,
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "worker.create",
      entityType: "Worker",
      entityId: result.value.workerId,
      metadata: { name: parsed.data.name, mobile: parsed.data.mobile },
    });

    revalidatePath(ROUTES.workers);
    revalidatePath(ROUTES.dashboard);

    return {
      success: true,
      message: "Worker created successfully",
      workerId: result.value.workerId,
    };
  } catch (error) {
    console.error("[createWorkerAction]", error);
    return { success: false, message: "Failed to create worker" };
  }
}

export async function updateWorkerAction(
  workerId: string,
  formData: FormData
): Promise<WorkerActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      name: formData.get("name") as string,
      mobile: (formData.get("mobile") as string) || "",
      address: (formData.get("address") as string) || "",
      notes: (formData.get("notes") as string) || "",
      openingBalance: formData.get("openingBalance") || "0",
      status: (formData.get("status") as string) || "ACTIVE",
      photo: (formData.get("photo") as string) || "",
    };

    const parsed = workerUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    const result = await workerService.update({
      workspaceId: tenant.workspaceId,
      actorId: tenant.userId,
      id: workerId,
      data: parsed.data,
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "worker.update",
      entityType: "Worker",
      entityId: workerId,
      metadata: { name: parsed.data.name },
    });

    revalidatePath(ROUTES.workers);
    revalidatePath(`/dashboard/workers/${workerId}`);

    return { success: true, message: "Worker updated" };
  } catch (error) {
    console.error("[updateWorkerAction]", error);
    return { success: false, message: "Failed to update worker" };
  }
}

export async function deleteWorkerAction(
  workerId: string
): Promise<WorkerActionResult> {
  try {
    const tenant = await getTenantContext();

    const result = await workerService.softDelete({
      workspaceId: tenant.workspaceId,
      id: workerId,
      actorId: tenant.userId,
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }

    // ✅ Activity log
    await activityService.log({
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
      action: "worker.delete",
      entityType: "Worker",
      entityId: workerId,
    });

    revalidatePath(ROUTES.workers);
    revalidatePath(ROUTES.dashboard);

    return { success: true, message: "Worker deleted" };
  } catch (error) {
    console.error("[deleteWorkerAction]", error);
    return { success: false, message: "Failed to delete worker" };
  }
}