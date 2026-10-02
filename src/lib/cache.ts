import { redis } from "@/lib/redis";

/**
 * Ledrix — Simple Redis cache helper.
 * Falls back gracefully if Redis not configured.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 300) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // Redis down — graceful degradation
    }
  },

  async del(pattern: string) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // ignore
    }
  },
};