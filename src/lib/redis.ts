import Redis from "ioredis";
import { serverEnv } from "@/lib/env";

/**
 * Ledrix — Redis Client Singleton.
 *
 * Used for:
 *  - Session caching
 *  - Rate limiting
 *  - BullMQ queue connection
 *  - Query result caching
 */

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const client = new Redis(serverEnv.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Error:", err.message);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}