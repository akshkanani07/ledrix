"use server";

import { getTenantContext } from "@/features/workspace/services/session-workspace";
import { reportService } from "../services/report.service";
import { buildWhatsAppMessage } from "../utils/whatsapp";

/**
 * Ledrix — Report Server Actions.
 * PDF/Excel downloads use API routes (better streaming).
 * This file only handles WhatsApp share URL.
 */

export async function getWhatsAppShareURL(workerId: string) {
  try {
    const tenant = await getTenantContext();

    const report = await reportService.getWorkerLedgerReport({
      workspaceId: tenant.workspaceId,
      workerId,
    });

    if (!report) {
      return { success: false as const, message: "Worker not found" };
    }

    const message = buildWhatsAppMessage(report);
    const phone = report.worker.mobile?.replace(/\D/g, "") ?? null;

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    return { success: true as const, url };
  } catch (error) {
    console.error("[getWhatsAppShareURL]", error);
    return { success: false as const, message: "Failed to generate link" };
  }
}