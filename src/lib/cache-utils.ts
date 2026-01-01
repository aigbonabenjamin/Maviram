import { getRedisClient, safeParse } from './redis';

/**
 * Get cached data with automatic JSON parsing
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    const data = await redis.get(key);
    return safeParse<T>(data);
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

/**
 * Set cached data with automatic JSON stringification
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl?: number
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    const serialized = JSON.stringify(data);
    
    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting cached data:', error);
    return false;
  }
}

/**
 * Delete cached data by key or pattern
 */
export async function deleteCachedData(keyOrPattern: string): Promise<number> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    // If pattern contains wildcard, use scan + delete
    if (keyOrPattern.includes('*')) {
      const keys = await redis.keys(keyOrPattern);
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    }
    
    // Direct key deletion
    return await redis.del(keyOrPattern);
  } catch (error) {
    console.error('Error deleting cached data:', error);
    return 0;
  }
}

/**
 * Get or set cached data (cache-aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const freshData = await fetchFn();

  // Cache the fresh data
  await setCachedData(key, freshData, ttl);

  return freshData;
}

/**
 * Invalidate multiple cache keys by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  return await deleteCachedData(pattern);
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  keys: number;
  memory: string;
  connected: boolean;
}> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    const info = await redis.info('memory');
    const dbSize = await redis.dbsize();
    const connected = redis.status === 'ready';
    
    // Parse memory usage from info
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    const memory = memoryMatch ? memoryMatch[1] : 'N/A';
    
    return {
      keys: dbSize,
      memory,
      connected,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      keys: 0,
      memory: 'N/A',
      connected: false,
    };
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    await redis.flushdb();
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
}

/**
 * Get all cache keys matching a pattern
 */
export async function getCacheKeys(pattern: string = '*'): Promise<string[]> {
  try {
    const redis = getRedisClient();
    await redis.connect().catch(() => {}); // Ensure connected
    
    return await redis.keys(pattern);
  } catch (error) {
    console.error('Error getting cache keys:', error);
    return [];
  }
}