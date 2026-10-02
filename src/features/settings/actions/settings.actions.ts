"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getTenantContext } from "@/features/workspace/services/session-workspace";
import { logger } from "@/lib/logger";
import {
  workspaceUpdateSchema,
  profileUpdateSchema,
} from "../schemas/settings.schema";

export interface SettingsActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateWorkspaceAction(
  formData: FormData
): Promise<SettingsActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      name: (formData.get("name") as string) || "",
      description: (formData.get("description") as string) || "",
      currency: (formData.get("currency") as string) || "INR",
      timezone: (formData.get("timezone") as string) || "Asia/Kolkata",
    };

    const parsed = workspaceUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    await prisma.workspace.update({
      where: { id: tenant.workspaceId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        currency: parsed.data.currency,
        timezone: parsed.data.timezone,
      },
    });

    logger.info("Workspace updated", {
      workspaceId: tenant.workspaceId,
      userId: tenant.userId,
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return { success: true, message: "Workspace updated" };
  } catch (error) {
    console.error("[updateWorkspaceAction]", error);
    return { success: false, message: "Failed to update workspace" };
  }
}

export async function updateProfileAction(
  formData: FormData
): Promise<SettingsActionResult> {
  try {
    const tenant = await getTenantContext();

    const raw = {
      name: (formData.get("name") as string) || "",
    };

    const parsed = profileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] ?? [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, fieldErrors };
    }

    await prisma.user.update({
      where: { id: tenant.userId },
      data: { name: parsed.data.name },
    });

    logger.info("Profile updated", { userId: tenant.userId });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return { success: true, message: "Profile updated" };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { success: false, message: "Failed to update profile" };
  }
}