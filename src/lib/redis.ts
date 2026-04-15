import { createClient } from 'redis';

let redis: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    });
    redis.on('error', (err) => console.error('Redis error:', err));
    await redis.connect();
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedis();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    const client = await getRedis();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Fail silently
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = await getRedis();
    await client.del(key);
  } catch {
    // Fail silently
  }
}
