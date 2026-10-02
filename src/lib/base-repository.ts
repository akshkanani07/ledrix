import type { TenantContext } from "@/lib/tenant";

/**
 * Ledrix — Base Repository.
 *
 * દરેક feature repository આ extend કરે છે.
 * Tenant safety + soft delete + audit માટે consistent API.
 */
export abstract class BaseRepository {
  protected readonly tenant: TenantContext;

  constructor(tenant: TenantContext) {
    this.tenant = tenant;
  }

  /**
   * Tenant scope enforce — દરેક subclass query માં વાપરે.
   */
  protected get tenantId(): string {
    return this.tenant.workspaceId;
  }

  /**
   * Tenant + soft-delete filter.
   */
  protected get safeFilter() {
    return {
      workspaceId: this.tenant.workspaceId,
      deletedAt: null,
    };
  }
}