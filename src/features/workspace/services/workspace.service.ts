import { logger } from "@/lib/logger";
import { workspaceRepository } from "../repositories/workspace.repository";

/**
 * Ledrix — Workspace Service.
 */
export class WorkspaceService {
  async createDefaultForUser(params: {
    userId: string;
    userName?: string | null;
    userEmail: string;
  }) {
    const { userId, userName, userEmail } = params;

    const baseName = userName
      ? `${userName}'s Workspace`
      : `${userEmail.split("@")[0]}'s Workspace`;

    const baseSlug = userName ?? userEmail.split("@")[0];
    const slug = await this.generateUniqueSlug(baseSlug);

    const workspace = await workspaceRepository.createWithOwner({
      name: baseName,
      slug,
      ownerId: userId,
      role: "OWNER",
    });

    logger.info("Default workspace created", {
      workspaceId: workspace.id,
      userId,
      slug,
    });

    return workspace;
  }

  async listForUser(userId: string) {
    return workspaceRepository.findByUserId(userId);
  }

  async getPrimaryForUser(userId: string) {
    return workspaceRepository.getPrimaryForUser(userId);
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const baseSlug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let slug = baseSlug;
    let counter = 1;

    while (await workspaceRepository.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    return slug;
  }
}

export const workspaceService = new WorkspaceService();