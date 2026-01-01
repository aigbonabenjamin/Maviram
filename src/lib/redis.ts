import Redis from 'ioredis';

// Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  return redis;
}

// Cache key prefixes for different data types
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  ORDERS: 'orders',
  ORDER: 'order',
  USERS: 'users',
  USER: 'user',
  ACTIVITY_LOGS: 'activity_logs',
  DELIVERY_TASKS: 'delivery_tasks',
  SESSIONS: 'session',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, ...identifiers: (string | number)[]): string {
  return `${prefix}:${identifiers.join(':')}`;
}

// Helper function to safely parse JSON from cache
export function safeParse<T>(data: string | null): T | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error parsing cached data:', error);
    return null;
  }
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}