import { logger } from "@/lib/logger";
import { Ok, Err, type Result } from "@/lib/result";
import { workerRepository } from "../repositories/worker.repository";
import type {
  CreateWorkerData,
  UpdateWorkerData,
} from "../repositories/worker.repository";
import type { WorkerFilters } from "../types/worker.types";

/**
 * Ledrix — Worker Service.
 * Business logic + tenant safety + audit.
 */
export class WorkerService {
  async create(params: {
    workspaceId: string;
    data: CreateWorkerData;
    actorId: string;
  }): Promise<Result<{ workerId: string }, string>> {
    const { workspaceId, data, actorId } = params;

    // Business rule: duplicate mobile check (per workspace)
    if (data.mobile) {
      const exists = await workerRepository.findMany({
        workspaceId,
        filters: { search: data.mobile },
        take: 5,
      });
      const duplicate = exists.items.find((w) => w.mobile === data.mobile);
      if (duplicate) {
        return Err(`Mobile number already used by ${duplicate.name}`);
      }
    }

    const worker = await workerRepository.create({ workspaceId, data });

    logger.info("Worker created", {
      workerId: worker.id,
      workspaceId,
      actorId,
    });

    return Ok({ workerId: worker.id });
  }

  async update(params: {
    workspaceId: string;
    id: string;
    data: UpdateWorkerData;
    actorId: string;
  }): Promise<Result<{ workerId: string }, string>> {
    const { workspaceId, id, data, actorId } = params;

    const worker = await workerRepository.update({ workspaceId, id, data });
    if (!worker) return Err("Worker not found");

    logger.info("Worker updated", { workerId: id, workspaceId, actorId });
    return Ok({ workerId: id });
  }

  async softDelete(params: {
    workspaceId: string;
    id: string;
    actorId: string;
  }): Promise<Result<void, string>> {
    const worker = await workerRepository.softDelete(params);
    if (!worker) return Err("Worker not found");

    logger.info("Worker deleted", {
      workerId: params.id,
      workspaceId: params.workspaceId,
      actorId: params.actorId,
    });
    return Ok(undefined);
  }

  async list(params: {
    workspaceId: string;
    filters?: WorkerFilters;
    page?: number;
    pageSize?: number;
  }) {
    const { workspaceId, filters, page = 1, pageSize = 20 } = params;
    const skip = (page - 1) * pageSize;

    return workerRepository.findMany({
      workspaceId,
      filters,
      skip,
      take: pageSize,
    });
  }

  async getById(params: { workspaceId: string; id: string }) {
    return workerRepository.findById(params);
  }

  async getStats(workspaceId: string) {
    return workerRepository.countByStatus(workspaceId);
  }
}

export const workerService = new WorkerService();