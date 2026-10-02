import { cache } from "react";
import { notFound } from "next/navigation";

import { getServerSession } from "@/lib/session";
import { workspaceService } from "./workspace.service";

/**
 * Ledrix — Session Workspace.
 * Cache-per-request, returns user's primary workspace.
 */
export const getCurrentWorkspace = cache(async () => {
  const session = await getServerSession();
  if (!session?.user) return null;

  const workspace = await workspaceService.getPrimaryForUser(session.user.id);
  return workspace;
});

/**
 * Require a workspace — redirect to setup if missing.
 */
export async function requireWorkspace() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    notFound();
  }
  return workspace;
}

/**
 * Tenant context for repository usage.
 */
export async function getTenantContext() {
  const session = await getServerSession();
  const workspace = await getCurrentWorkspace();

  if (!session?.user || !workspace) {
    notFound();
  }

  return {
    userId: session.user.id,
    workspaceId: workspace.id,
  };
}