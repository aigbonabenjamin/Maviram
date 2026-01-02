import { getRedisClient } from './redis';

const SESSION_KEY_PREFIX = 'active_session:';
const ACTIVE_USERS_KEY = 'active_users';
const SESSION_TIMEOUT = 5 * 60; // 5 minutes in seconds

export interface ActiveSession {
  userId: string;
  role: string;
  fullName: string;
  lastSeen: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Register an active user session
 */
export async function registerSession(
  userId: string,
  role: string,
  fullName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const sessionKey = `${SESSION_KEY_PREFIX}${userId}`;
    
    const sessionData: ActiveSession = {
      userId,
      role,
      fullName,
      lastSeen: Date.now(),
      ipAddress,
      userAgent,
    };

    // Store session with TTL
    await redis.setex(sessionKey, SESSION_TIMEOUT, JSON.stringify(sessionData));
    
    // Add to active users set
    await redis.sadd(ACTIVE_USERS_KEY, userId);
    
    console.log(`Session registered for user ${userId}`);
  } catch (error) {
    console.error('Error registering session:', error);
  }
}

/**
 * Update session heartbeat (keep-alive)
 */
export async function updateSessionHeartbeat(userId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const sessionKey = `${SESSION_KEY_PREFIX}${userId}`;
    
    const sessionData = await redis.get(sessionKey);
    if (sessionData) {
      const session: ActiveSession = JSON.parse(sessionData);
      session.lastSeen = Date.now();
      
      await redis.setex(sessionKey, SESSION_TIMEOUT, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Error updating session heartbeat:', error);
  }
}

/**
 * Remove a user session
 */
export async function removeSession(userId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    const sessionKey = `${SESSION_KEY_PREFIX}${userId}`;
    
    await redis.del(sessionKey);
    await redis.srem(ACTIVE_USERS_KEY, userId);
    
    console.log(`Session removed for user ${userId}`);
  } catch (error) {
    console.error('Error removing session:', error);
  }
}

/**
 * Get all active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
  try {
    const redis = await getRedisClient();
    const userIds = await redis.smembers(ACTIVE_USERS_KEY);
    
    const sessions: ActiveSession[] = [];
    
    for (const userId of userIds) {
      const sessionKey = `${SESSION_KEY_PREFIX}${userId}`;
      const sessionData = await redis.get(sessionKey);
      
      if (sessionData) {
        sessions.push(JSON.parse(sessionData));
      } else {
        // Clean up stale entry in set
        await redis.srem(ACTIVE_USERS_KEY, userId);
      }
    }
    
    // Sort by last seen (most recent first)
    return sessions.sort((a, b) => b.lastSeen - a.lastSeen);
  } catch (error) {
    console.error('Error getting active sessions:', error);
    return [];
  }
}

/**
 * Get active sessions count
 */
export async function getActiveSessionsCount(): Promise<number> {
  try {
    const redis = await getRedisClient();
    return await redis.scard(ACTIVE_USERS_KEY);
  } catch (error) {
    console.error('Error getting active sessions count:', error);
    return 0;
  }
}

/**
 * Get active sessions by role
 */
export async function getActiveSessionsByRole(): Promise<Record<string, number>> {
  try {
    const sessions = await getActiveSessions();
    const roleCount: Record<string, number> = {
      admin: 0,
      buyer: 0,
      seller: 0,
      driver: 0,
    };
    
    sessions.forEach((session) => {
      if (roleCount[session.role] !== undefined) {
        roleCount[session.role]++;
      }
    });
    
    return roleCount;
  } catch (error) {
    console.error('Error getting sessions by role:', error);
    return { admin: 0, buyer: 0, seller: 0, driver: 0 };
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  peakConcurrentUsers: number;
}> {
  try {
    const activeSessions = await getActiveSessions();
    const activeCount = activeSessions.length;

    // For now, return basic stats. In a real implementation,
    // you might track historical data for more detailed stats
    return {
      totalSessions: activeCount, // This would be historical total in a real app
      activeSessions: activeCount,
      averageSessionDuration: SESSION_TIMEOUT * 1000, // Convert to milliseconds
      peakConcurrentUsers: activeCount, // This would be tracked separately
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      averageSessionDuration: 0,
      peakConcurrentUsers: 0,
    };
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const redis = await getRedisClient();
    const userIds = await redis.smembers(ACTIVE_USERS_KEY);
    let cleanedCount = 0;

    for (const userId of userIds) {
      const sessionKey = `${SESSION_KEY_PREFIX}${userId}`;
      const exists = await redis.exists(sessionKey);

      if (!exists) {
        await redis.srem(ACTIVE_USERS_KEY, userId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}
