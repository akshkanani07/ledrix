import { notFound } from "next/navigation";

/**
 * Ledrix — Tenant Guard Helpers.
 *
 * Multi-tenant SaaS માં દરેક query માં workspaceId હાજર હોવું
 * ફરજિયાત છે. આ helpers તેને enforce કરે છે.
 */

export interface TenantContext {
  workspaceId: string;
  userId: string;
}

/**
 * Ensure workspaceId matches — throws 404 if mismatch.
 * Cross-tenant data leak ન થાય એ માટે.
 */
export function assertTenantAccess(
  resource: { workspaceId: string } | null,
  tenant: TenantContext
): asserts resource is { workspaceId: string } {
  if (!resource || resource.workspaceId !== tenant.workspaceId) {
    notFound();
  }
}

/**
 * Scoped where clause builder — દરેક repository query માં વાપરો.
 */
export function tenantWhere(tenant: TenantContext) {
  return { workspaceId: tenant.workspaceId } as const;
}

/**
 * Soft-delete filter — deleted records hide કરો.
 */
export function notDeleted() {
  return { deletedAt: null } as const;
}

/**
 * Full safe where — tenant + not deleted.
 */
export function tenantSafeWhere(tenant: TenantContext) {
  return {
    workspaceId: tenant.workspaceId,
    deletedAt: null,
  } as const;
}